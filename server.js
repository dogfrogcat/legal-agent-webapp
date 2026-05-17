import http from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLegalInstructions,
  CASE_TYPE_PROFILES,
  getCaseTypeProfile,
  LEGAL_SEARCH_DOMAINS
} from "./agent-config.js";
import { findKnowledgeContext } from "./knowledge-base.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");

loadLocalEnv(join(__dirname, ".env"));

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1");
const model = process.env.OPENAI_MODEL || "gpt-5";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const geminiFallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";
const openaiMaxOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 12000);
const appPassword = process.env.APP_PASSWORD || "";
const authSecret = process.env.AUTH_SECRET || process.env.OPENAI_API_KEY || "local-dev-secret";
const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || "");
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const MAX_IMAGES = 4;
const MAX_IMAGE_DATA_URL_CHARS = 11 * 1024 * 1024;
const MAX_REQUEST_BODY_BYTES = 45 * 1024 * 1024;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function loadLocalEnv(envPath) {
  try {
    const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional. Production deployments should use real environment variables.
  }
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, item) => {
    const separator = item.indexOf("=");
    if (separator === -1) return cookies;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeSupabaseUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  try {
    const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
    const parsed = new URL(withProtocol);
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return rawValue.replace(/\/(?:rest|auth)\/v1\/?$/i, "").replace(/\/+$/, "");
  }
}

function getAuthMode() {
  if (supabaseUrl && supabaseAnonKey) return "supabase";
  if (appPassword.length > 0) return "password";
  return "none";
}

function isAuthRequired() {
  return getAuthMode() !== "none";
}

function getPasswordAuthToken() {
  return createHmac("sha256", authSecret).update(appPassword).digest("hex");
}

function isPasswordAuthorized(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return safeEquals(cookies.legal_agent_session, getPasswordAuthToken());
}

function buildCookie(name, value, maxAge) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];

  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

function buildPasswordAuthCookie(value, maxAge) {
  return buildCookie("legal_agent_session", value, maxAge);
}

function buildSupabaseAuthCookies(session, maxAge = 60 * 60 * 24 * 30) {
  return [
    buildCookie("legal_agent_access_token", session.access_token || "", maxAge),
    buildCookie("legal_agent_refresh_token", session.refresh_token || "", maxAge)
  ];
}

function clearAuthCookies() {
  return [
    buildPasswordAuthCookie("", 0),
    buildCookie("legal_agent_access_token", "", 0),
    buildCookie("legal_agent_refresh_token", "", 0)
  ];
}

async function getAuthState(req) {
  const authMode = getAuthMode();
  if (authMode === "none") {
    return { authMode, authenticated: true, user: null, headers: {} };
  }

  if (authMode === "password") {
    return {
      authMode,
      authenticated: isPasswordAuthorized(req),
      user: null,
      headers: {}
    };
  }

  const cookies = parseCookies(req.headers.cookie || "");
  const accessToken = cookies.legal_agent_access_token;
  const refreshToken = cookies.legal_agent_refresh_token;

  if (accessToken) {
    try {
      const user = await requestSupabaseUser(accessToken);
      return { authMode, authenticated: true, user, headers: {} };
    } catch (error) {
      if (error.statusCode && error.statusCode !== 401 && error.statusCode !== 403) throw error;
    }
  }

  if (refreshToken) {
    try {
      const session = await refreshSupabaseSession(refreshToken);
      const user = await requestSupabaseUser(session.access_token);
      return {
        authMode,
        authenticated: true,
        user,
        headers: { "Set-Cookie": buildSupabaseAuthCookies(session) }
      };
    } catch {
      return {
        authMode,
        authenticated: false,
        user: null,
        headers: { "Set-Cookie": clearAuthCookies() }
      };
    }
  }

  return { authMode, authenticated: false, user: null, headers: {} };
}

async function supabaseAuthFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch {
    const error = new Error(
      "Supabase 연결에 실패했습니다. Render 환경변수 SUPABASE_URL은 https://프로젝트ID.supabase.co 형식이어야 하고, /rest/v1 또는 /auth/v1 경로는 빼야 합니다."
    );
    error.statusCode = 500;
    throw error;
  }
  const data = await readJsonResponse(response, "Supabase Auth");

  if (!response.ok) {
    const error = new Error(formatSupabaseError(data, response.status));
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function requestSupabaseUser(accessToken) {
  return supabaseAuthFetch("/user", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

async function loginSupabase(email, password) {
  return supabaseAuthFetch("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

async function signupSupabase(email, password) {
  return supabaseAuthFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

async function refreshSupabaseSession(refreshToken) {
  return supabaseAuthFetch("/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
  });
}

function formatSupabaseError(data, statusCode) {
  const message = data?.msg || data?.message || data?.error_description || data?.error || "";

  if (statusCode === 400 && /invalid login|credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 맞지 않습니다.";
  }

  if (statusCode === 422 && /already/i.test(message)) {
    return "이미 가입된 이메일입니다. 로그인으로 진행해주세요.";
  }

  if (/email not confirmed/i.test(message)) {
    return "이메일 인증 후 로그인해주세요.";
  }

  if (/password/i.test(message)) {
    return "비밀번호 조건을 확인해주세요. 보통 6자 이상이어야 합니다.";
  }

  return message || "인증 요청에 실패했습니다.";
}

async function readRequestBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      throw new Error("요청 본문이 너무 큽니다. 이미지는 최대 4장, 각 8MB 이하로 줄여서 다시 올려주세요.");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function extractOutput(response) {
  const textParts = [];
  const citations = [];
  const sources = [];

  for (const item of response.output || []) {
    if (item.type === "message") {
      for (const content of item.content || []) {
        if ((content.type === "output_text" || content.text) && content.text) {
          textParts.push(content.text);
          for (const annotation of content.annotations || []) {
            if (annotation.type === "url_citation") {
              citations.push({
                title: annotation.title || annotation.url,
                url: annotation.url
              });
            }
          }
        }
      }
    }

    if (item.type === "web_search_call" && item.action?.sources) {
      for (const source of item.action.sources) {
        if (source.url) {
          sources.push({
            title: source.title || source.url,
            url: source.url
          });
        }
      }
    }
  }

  return {
    text: textParts.join("\n\n").trim() || response.output_text || "",
    citations: dedupeLinks(citations),
    sources: dedupeLinks(sources)
  };
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (!link.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function buildInput({
  message,
  history = [],
  mode = "qa",
  caseType = "general",
  knowledgeContext = "",
  images = []
}) {
  const caseTypeProfile = getCaseTypeProfile(caseType);
  const recentHistory = history.slice(-8).map((turn) => ({
    role: turn.role === "assistant" ? "assistant" : "user",
    content: String(turn.content || "").slice(0, 5000)
  }));

  const knowledgeBlock = knowledgeContext
    ? `\n\n내부 법률 플레이북 참고자료:\n${knowledgeContext}\n\n플레이북은 사건 분류와 누락 방지용이다. 최신 법령/판례가 필요한 부분은 공식 출처로 확인하라.`
    : "";

  const text = `작업 모드: ${mode}
사건 유형: ${caseTypeProfile.label}
유형별 중점: ${caseTypeProfile.focus}${knowledgeBlock}\n\n사용자 질문/자료:\n${
    message || "첨부 이미지 내용을 법률 관점에서 분석해줘."
  }`;
  const content = images.length
    ? [
        { type: "input_text", text },
        ...images.map((image) => ({
          type: "input_image",
          image_url: image.dataUrl,
          detail: "high"
        }))
      ]
    : text;

  return [
    ...recentHistory,
    {
      role: "user",
      content
    }
  ];
}

function withFinalAnswerInstruction(input, note) {
  const updated = [...input];
  const last = updated[updated.length - 1];
  if (last?.role === "user") {
    if (Array.isArray(last.content)) {
      const content = [...last.content];
      const firstText = content.find((item) => item.type === "input_text");
      if (firstText) {
        firstText.text = `${firstText.text}\n\n${note}`;
      } else {
        content.unshift({ type: "input_text", text: note });
      }
      updated[updated.length - 1] = { ...last, content };
      return updated;
    }

    updated[updated.length - 1] = {
      ...last,
      content: `${last.content}\n\n${note}`
    };
  }
  return updated;
}

function getMaxOutputTokens(message, deepResearch = false) {
  if (deepResearch) return Math.max(openaiMaxOutputTokens, 12000);
  if (message.length > 3500) return Math.max(openaiMaxOutputTokens, 10000);
  if (message.length > 1800) return Math.max(7000, Math.min(openaiMaxOutputTokens, 9000));
  return Math.max(4200, Math.min(openaiMaxOutputTokens, 7000));
}

function buildDeepResearchInstruction() {
  return `
심층 검토 모드:
- 내부 플레이북으로 사건 유형과 누락 쟁점을 먼저 잡고, 공식 출처 검색으로 최신 법령/기관자료/판례 필요 부분을 확인한다.
- 사용자가 확률, 책임비율, 인정금액, 합의 하한선을 물으면 단일 숫자로 단정하지 말고 "보수적/중간/공격적" 범위와 전제조건을 나누어 제시한다.
- 다만 결론 문장은 분명하게 쓴다. 낮은 합의안, 수락 비추천 조건, 분쟁조정 실익, 소송 실익 부족처럼 전략 판단이 가능한 부분은 회피하지 않는다.
- 확률은 가능하면 일부배상 인정 가능성, 100만 원 이상 가능성, 200만 원 이상 가능성, 300만 원 이상 가능성, 청구액 대부분 인정 가능성처럼 승리 기준별로 쪼갠다.
- 원고/신청인 주장, 상대방 방어논리, 재반박, 조정위원/판사 관점을 번갈아 검토한다.
- 기존 질환, 사전 고지, 시술 후 급성 악화, 업체 설명 변경, 동의서 폐기, 소비자원 제안 조건처럼 서로 반대 방향으로 작용하는 사실을 표로 정리한다.
- 법원이 실제로 인정할 금액은 감정, 진료기록, 판례/조정례에 좌우되므로 "현실적 추정"과 "추가 입증 필요"를 구분한다.
- 합의 전략은 공식 청구액, 내부 목표액, 하한선, 절대 거절선으로 구분하고, 위험한 합의문 문구와 대체 문구를 제시한다.
- 소송 승률과 경제적 승률을 구분하고, 변호사비·시간·감정소모·실익을 함께 평가한다.
- 관련 근거/판례 섹션에서 URL을 노출하지 말고 한국어 제목 링크만 사용한다.
- 답변은 길어도 좋지만, 마지막에는 "지금 당장 할 행동 3개"와 "하지 말아야 할 행동 3개"를 반드시 포함한다.
`.trim();
}

function buildOpenAIRequest({
  message,
  mode,
  caseType,
  history,
  knowledgeContext,
  images,
  useWebSearch,
  deepResearch = false
}) {
  const input = buildInput({
    message,
    history,
    mode,
    caseType,
    knowledgeContext,
    images
  });
  const finalInput = deepResearch
    ? withFinalAnswerInstruction(input, buildDeepResearchInstruction())
    : input;

  return {
    model,
    instructions: buildLegalInstructions(mode, caseType),
    input: finalInput,
    max_output_tokens: getMaxOutputTokens(message, deepResearch),
    reasoning: model.startsWith("gpt-5")
      ? { effort: deepResearch ? "medium" : message.length > 1800 ? "low" : "medium" }
      : undefined,
    include: useWebSearch ? ["web_search_call.action.sources"] : undefined,
    tools: useWebSearch
      ? [
          {
            type: "web_search",
            filters: {
              allowed_domains: LEGAL_SEARCH_DOMAINS
            },
            user_location: {
              type: "approximate",
              country: "KR",
              city: "Seoul",
              timezone: "Asia/Seoul"
            }
          }
        ]
      : undefined,
    tool_choice: useWebSearch ? "auto" : undefined
  };
}

async function callOpenAIWithRetry(requestBody) {
  let first;
  try {
    first = await callOpenAI(requestBody);
  } catch (error) {
    if (!requestBody.tools) throw error;

    const fallbackBody = {
      ...requestBody,
      include: undefined,
      tools: undefined,
      tool_choice: undefined,
      reasoning: model.startsWith("gpt-5") ? { effort: "low" } : undefined,
      input: withFinalAnswerInstruction(
        requestBody.input,
        "주의: 공식 출처 검색 도구가 일시적으로 실패했다. 검색 결과를 기다리지 말고 내부 플레이북과 사용자가 제공한 사실관계만으로 답하되, 최신 법령/기관자료 확인이 필요한 부분은 명시하라."
      )
    };

    const fallback = await callOpenAI(fallbackBody);
    const fallbackOutput = extractOutput(fallback);
    if (fallbackOutput.text) return { data: fallback, output: fallbackOutput };
    throw error;
  }

  let output = extractOutput(first);
  if (output.text) return { data: first, output };

  const retryBody = {
    ...requestBody,
    include: undefined,
    tools: undefined,
    tool_choice: undefined,
    max_output_tokens: Math.max(requestBody.max_output_tokens || 0, 10000),
    reasoning: model.startsWith("gpt-5") ? { effort: "low" } : undefined,
    input: withFinalAnswerInstruction(
      requestBody.input,
      "중요: 이전 응답 본문이 비어 있었다. 웹검색 없이 내부 플레이북과 사용자가 제공한 사실관계만으로, 반드시 한국어 최종 답변 본문을 작성하라. 질문이 길어도 생략하지 말고 핵심 항목별로 압축해서 답하라."
    )
  };

  const retry = await callOpenAI(retryBody);
  output = extractOutput(retry);
  if (output.text) return { data: retry, output };

  const status = retry.status || first.status || "unknown";
  const reason = retry.incomplete_details?.reason || first.incomplete_details?.reason || "unknown";
  throw new Error(`OpenAI 응답 본문이 비어 있습니다. 상태: ${status}, 이유: ${reason}. 질문을 나누거나 Gemini 검토/근거 검색을 끄고 다시 시도해주세요.`);
}

function buildGeminiReviewPrompt({ message, mode, caseType = "general", primaryAnswer }) {
  const caseTypeProfile = getCaseTypeProfile(caseType);
  return `
너는 한국법 법률 답변의 교차검증 리뷰어다. 변호사처럼 최종 자문하지 말고, 아래 1차 답변을 감사하라.

작업 모드: ${mode}
사건 유형: ${caseTypeProfile.label}
유형별 중점: ${caseTypeProfile.focus}

사용자 질문/자료:
${truncateForReview(message, 4500)}

OpenAI 1차 답변:
${truncateForReview(primaryAnswer, 4500)}

검토 기준:
- 사실관계가 부족한데 단정한 부분
- 한국법상 추가로 확인해야 할 쟁점
- 시효, 제척기간, 불복기간, 증거 보전 등 기한 리스크
- 판례/법령 근거가 필요한데 빠진 부분
- 일반 사용자에게 위험하게 들릴 수 있는 표현
- 다른 해석 가능성

출력 형식:
1. 교차검증 요약
2. 보완할 쟁점
3. 위험하거나 단정적인 표현
4. 추가 확인 질문
5. 최종 답변에 반영할 문장

한국어로 간결하게 작성하라.
`.trim();
}

function truncateForReview(value, maxChars) {
  const text = String(value || "");
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[이하 긴 내용은 교차검증 프롬프트 길이 조절을 위해 생략됨]`;
}

function buildSynthesisInstructions(mode, caseType = "general") {
  return `
${buildLegalInstructions(mode, caseType)}

추가 작업:
- Gemini 교차검증 리포트를 반영해 최종 답변을 다시 작성한다.
- 두 모델의 의견이 다르거나 확실하지 않은 부분은 "추가 확인 필요"로 표시한다.
- Gemini 검토 내용을 그대로 길게 붙이지 말고, 사용자에게 필요한 핵심만 녹여낸다.
- 마지막에 "Gemini 교차검증 반영" 섹션을 짧게 추가한다.
`.trim();
}

async function callOpenAI(requestBody) {
  const apiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  const data = await readJsonResponse(apiRes, "OpenAI API");
  if (!apiRes.ok) {
    const error = new Error(data.error?.message || "OpenAI API 요청에 실패했습니다.");
    error.statusCode = apiRes.status;
    throw error;
  }

  return data;
}

async function readJsonResponse(response, label) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!raw) return {};

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`${label} 응답 JSON을 읽지 못했습니다. 잠시 후 다시 시도해주세요.`);
    }
  }

  try {
    return JSON.parse(raw);
  } catch {
    const summary = raw.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`${label}에서 JSON이 아닌 응답을 받았습니다. 일시적인 서버/검색 오류일 수 있습니다. ${summary}`);
  }
}

async function callGeminiReview({ message, mode, caseType, primaryAnswer }) {
  const prompt = buildGeminiReviewPrompt({ message, mode, caseType, primaryAnswer });

  try {
    const text = await requestGeminiReview(geminiModel, prompt);
    return { modelUsed: geminiModel, text, usedFallback: false };
  } catch (error) {
    if (!error.isQuotaError || geminiFallbackModel === geminiModel) {
      throw error;
    }

    const text = await requestGeminiReview(geminiFallbackModel, prompt);
    return { modelUsed: geminiFallbackModel, text, usedFallback: true };
  }
}

async function requestGeminiReview(modelName, prompt) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await requestGeminiReviewOnce(modelName, prompt);
    } catch (error) {
      lastError = error;
      if (!error.isTransient || attempt === 2) break;
      await sleep(900 * (attempt + 1));
    }
  }

  throw lastError;
}

async function requestGeminiReviewOnce(modelName, prompt) {
  const endpointModel = modelName.replace(/^models\//, "");
  const apiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${endpointModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900
        }
      })
    }
  );

  const data = await readJsonResponse(apiRes, "Gemini API");
  if (!apiRes.ok) {
    const error = new Error(formatGeminiError(data, apiRes.status, modelName));
    error.statusCode = apiRes.status;
    error.isQuotaError = isGeminiQuotaError(data, apiRes.status);
    error.isTransient = isGeminiTransientError(data, apiRes.status);
    throw error;
  }

  return extractGeminiText(data);
}

function isGeminiQuotaError(data, statusCode) {
  const message = data.error?.message || "";
  return statusCode === 429 || /quota|rate/i.test(message);
}

function isGeminiTransientError(data, statusCode) {
  const message = data.error?.message || "";
  return [500, 502, 503, 504].includes(statusCode) || /high demand|try again/i.test(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatGeminiError(data, statusCode, modelName = geminiModel) {
  const message = data.error?.message || "";

  if (isGeminiQuotaError(data, statusCode)) {
    return `Gemini 모델(${modelName})의 할당량이 부족하거나 결제/쿼터가 아직 활성화되어 있지 않아 교차검증을 건너뛰었습니다. Google AI Studio에서 결제와 사용 한도를 확인해주세요.`;
  }

  if (statusCode === 400 && /model/i.test(message)) {
    return `Gemini 모델 설정을 확인해주세요. 현재 모델은 ${modelName} 입니다.`;
  }

  if (statusCode === 400 || statusCode === 403) {
    return "Gemini API 키 또는 프로젝트 권한을 확인해주세요.";
  }

  if (isGeminiTransientError(data, statusCode)) {
    return `Gemini 모델(${modelName})이 일시적으로 혼잡해 교차검증을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.`;
  }

  return "Gemini API 요청에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

function extractGeminiText(response) {
  return (response.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

async function synthesizeWithReview({ message, mode, caseType, history, primaryAnswer, geminiReview }) {
  const response = await callOpenAI({
    model,
    instructions: buildSynthesisInstructions(mode, caseType),
    input: [
      ...buildInput({ message, history, mode, caseType }),
      {
        role: "assistant",
        content: `OpenAI 1차 답변:\n${primaryAnswer}`
      },
      {
        role: "user",
        content: `Gemini 교차검증 리포트:\n${geminiReview}\n\n위 리포트를 반영해 최종 사용자 답변을 작성해줘.`
      }
    ],
    max_output_tokens: 5200,
    reasoning: model.startsWith("gpt-5") ? { effort: "low" } : undefined
  });

  return extractOutput(response);
}

function sanitizeImages(images = []) {
  if (!Array.isArray(images)) return [];

  return images.slice(0, MAX_IMAGES).map((image, index) => {
    const dataUrl = String(image?.dataUrl || "");
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(dataUrl)) {
      throw new Error(`첨부 이미지 ${index + 1}의 형식을 확인해주세요. PNG, JPG, WebP, GIF만 지원합니다.`);
    }

    if (dataUrl.length > MAX_IMAGE_DATA_URL_CHARS) {
      throw new Error(`첨부 이미지 ${index + 1}의 용량이 너무 큽니다. 8MB 이하 이미지로 다시 올려주세요.`);
    }

    return {
      name: String(image?.name || `image-${index + 1}`).slice(0, 120),
      dataUrl
    };
  });
}

function sanitizeCaseType(caseType = "general") {
  const normalized = String(caseType || "general");
  return CASE_TYPE_PROFILES[normalized] ? normalized : "general";
}

async function handleChat(req, res) {
  let authState;
  try {
    authState = await getAuthState(req);
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: `인증 확인 중 오류가 발생했습니다: ${error.message}` });
    return;
  }

  if (!authState.authenticated) {
    sendJson(res, 401, { error: "로그인이 필요합니다." }, authState.headers);
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, {
      error: "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.example을 참고해 환경변수를 설정해주세요."
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readRequestBody(req));
  } catch (error) {
    sendJson(res, 400, {
      error: error.message.includes("너무 큽니다")
        ? error.message
        : "요청 본문이 올바른 JSON이 아닙니다."
    });
    return;
  }

  const message = String(payload.message || "").trim();
  let images;
  try {
    images = sanitizeImages(payload.images);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }
  const mode = String(payload.mode || "qa");
  const caseType = sanitizeCaseType(payload.caseType);
  const caseTypeProfile = getCaseTypeProfile(caseType);
  const useWebSearch = payload.useWebSearch !== false;
  const useDeepResearch = payload.useDeepResearch === true;
  const useGeminiReview = payload.useGeminiReview === true;
  const useKnowledgeBase = payload.useKnowledgeBase !== false;
  const effectiveUseWebSearch = useWebSearch || useDeepResearch;

  if (!message && images.length === 0) {
    sendJson(res, 400, { error: "질문이나 문서 내용을 입력해주세요." });
    return;
  }

  const knowledge = await findKnowledgeContext({
    message: `${caseTypeProfile.label} ${caseTypeProfile.keywords} ${message}`,
    mode,
    enabled: useKnowledgeBase
  });

  const requestBody = buildOpenAIRequest({
    message,
    mode,
    caseType,
    history: payload.history,
    knowledgeContext: knowledge.context,
    images,
    useWebSearch: effectiveUseWebSearch,
    deepResearch: useDeepResearch
  });

  try {
    const { data, output: primaryOutput } = await callOpenAIWithRetry(requestBody);
    let finalOutput = primaryOutput;
    let geminiReviewText = "";
    let geminiReviewModel = "";
    let usedGeminiFallback = false;
    let reviewStatus = "off";

    if (useGeminiReview) {
      if (!process.env.GEMINI_API_KEY) {
        reviewStatus = "missing_key";
        finalOutput = {
          ...primaryOutput,
          text: `${primaryOutput.text}\n\nGemini 교차검증: GEMINI_API_KEY가 설정되어 있지 않아 건너뛰었습니다.`
        };
      } else {
        try {
          const geminiReviewResult = await callGeminiReview({
            message,
            mode,
            caseType,
            primaryAnswer: primaryOutput.text
          });
          geminiReviewText = geminiReviewResult.text;
          geminiReviewModel = geminiReviewResult.modelUsed;
          usedGeminiFallback = geminiReviewResult.usedFallback;
          finalOutput = await synthesizeWithReview({
            message,
            mode,
            caseType,
            history: payload.history,
            primaryAnswer: primaryOutput.text,
            geminiReview: geminiReviewText
          });
          finalOutput.citations = primaryOutput.citations;
          finalOutput.sources = primaryOutput.sources;
          if (usedGeminiFallback) {
            finalOutput.text = `${finalOutput.text}\n\nGemini 교차검증: ${geminiModel} 쿼터 문제로 ${geminiReviewModel} 모델로 검토했습니다.`;
          }
          reviewStatus = "completed";
        } catch (reviewError) {
          reviewStatus = "failed";
          finalOutput = {
            ...primaryOutput,
            text: `${primaryOutput.text}\n\nGemini 교차검증: ${reviewError.message}`
          };
        }
      }
    }

    sendJson(
      res,
      200,
      {
        ...finalOutput,
        model: data.model || model,
        geminiModel,
        geminiReviewModel,
        usedGeminiFallback,
        reviewStatus,
        geminiReview: geminiReviewText,
        knowledgeMatches: knowledge.matches,
        deepResearch: useDeepResearch
      },
      authState.headers
    );
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: `서버 처리 중 오류가 발생했습니다: ${error.message}`
    }, authState.headers);
  }
}

async function handleLogin(req, res) {
  const authMode = getAuthMode();
  if (authMode === "none") {
    sendJson(res, 200, { ok: true, authRequired: false, authMode });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readRequestBody(req));
  } catch {
    sendJson(res, 400, { error: "로그인 요청 형식이 올바르지 않습니다." });
    return;
  }

  if (authMode === "supabase") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    if (!email || !password) {
      sendJson(res, 400, { error: "이메일과 비밀번호를 입력해주세요." });
      return;
    }

    try {
      const session = await loginSupabase(email, password);
      sendJson(
        res,
        200,
        {
          ok: true,
          authRequired: true,
          authMode,
          authenticated: true,
          user: session.user ? { id: session.user.id, email: session.user.email } : { email }
        },
        { "Set-Cookie": buildSupabaseAuthCookies(session) }
      );
    } catch (error) {
      sendJson(res, error.statusCode || 401, { error: error.message });
    }
    return;
  }

  if (!safeEquals(payload.password, appPassword)) {
    sendJson(res, 401, { error: "비밀번호가 맞지 않습니다." });
    return;
  }

  sendJson(
    res,
    200,
    { ok: true, authRequired: true, authMode, authenticated: true },
    { "Set-Cookie": buildPasswordAuthCookie(getPasswordAuthToken(), 60 * 60 * 24 * 7) }
  );
}

async function handleSignup(req, res) {
  if (getAuthMode() !== "supabase") {
    sendJson(res, 400, {
      error: "회원가입은 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정한 뒤 사용할 수 있습니다."
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readRequestBody(req));
  } catch {
    sendJson(res, 400, { error: "회원가입 요청 형식이 올바르지 않습니다." });
    return;
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!email || !password) {
    sendJson(res, 400, { error: "이메일과 비밀번호를 입력해주세요." });
    return;
  }

  try {
    const result = await signupSupabase(email, password);
    const hasSession = Boolean(result.access_token && result.refresh_token);
    sendJson(
      res,
      200,
      {
        ok: true,
        authRequired: true,
        authMode: "supabase",
        authenticated: hasSession,
        needsEmailConfirmation: !hasSession,
        message: hasSession
          ? "회원가입이 완료되었습니다."
          : "회원가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해주세요.",
        user: result.user ? { id: result.user.id, email: result.user.email } : { email }
      },
      hasSession ? { "Set-Cookie": buildSupabaseAuthCookies(result) } : {}
    );
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

function handleLogout(_req, res) {
  sendJson(res, 200, { ok: true }, { "Set-Cookie": clearAuthCookies() });
}

async function handleSession(req, res) {
  try {
    const authState = await getAuthState(req);
    sendJson(
      res,
      200,
      {
        authRequired: isAuthRequired(),
        authMode: authState.authMode,
        authenticated: authState.authenticated,
        user: authState.user
          ? { id: authState.user.id, email: authState.user.email }
          : null
      },
      authState.headers
    );
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      authRequired: isAuthRequired(),
      authMode: getAuthMode(),
      authenticated: false,
      error: error.message
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && req.url === "/api/session") {
    void handleSession(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/login") {
    void handleLogin(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/signup") {
    void handleSignup(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/logout") {
    handleLogout(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    void handleChat(req, res);
    return;
  }

  if (req.method === "GET") {
    void serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, host, () => {
  console.log(`Korean legal agent running at http://${host}:${port}`);
});

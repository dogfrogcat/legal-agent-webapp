const loginGate = document.querySelector("#loginGate");
const loginForm = document.querySelector("#loginForm");
const loginDescription = document.querySelector("#loginDescription");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginSubmitButton = document.querySelector("#loginSubmitButton");
const signupButton = document.querySelector("#signupButton");
const loginError = document.querySelector("#loginError");
const appShell = document.querySelector("#appShell");
const chat = document.querySelector("#chat");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearButton");
const logoutButton = document.querySelector("#logoutButton");
const attachButton = document.querySelector("#attachButton");
const imageInput = document.querySelector("#imageInput");
const attachmentPreview = document.querySelector("#attachmentPreview");
const knowledgeBase = document.querySelector("#knowledgeBase");
const webSearch = document.querySelector("#webSearch");
const deepResearch = document.querySelector("#deepResearch");
const geminiReview = document.querySelector("#geminiReview");
const modeStatusTitle = document.querySelector("#modeStatusTitle");
const modeStatusText = document.querySelector("#modeStatusText");
const caseStatusText = document.querySelector("#caseStatusText");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const caseTypeButtons = Array.from(document.querySelectorAll(".case-type-button"));

const MODE_CONFIG = {
  dispute: {
    title: "쟁점 정리",
    status: "사실관계, 핵심 쟁점, 유불리, 다음 절차를 한 번에 정리합니다.",
    placeholder: "사건 경위, 상대방 주장, 가진 증거, 원하는 결과를 입력하세요. 문서·사진은 + 버튼으로 첨부할 수 있습니다.",
    submitLabel: "쟁점 정리하기",
    loading: "쟁점을 정리하고 있습니다. 유리한 사실과 불리한 사실을 나눠서 보고 있어요."
  },
  precedent: {
    title: "판례 검색",
    status: "비슷한 사안의 판례, 법령, 기관 근거를 우선 확인합니다.",
    placeholder: "찾고 싶은 판례 쟁점, 사건 유형, 인정받고 싶은 논리를 입력하세요. 관련 문서·사진도 첨부할 수 있습니다.",
    submitLabel: "판례 찾기",
    loading: "판례와 법령 근거를 찾고 있습니다. 관련 쟁점 중심으로 좁혀볼게요."
  },
  qa: {
    title: "법률 Q&A",
    status: "궁금한 점에 바로 답하고, 빠진 사실과 리스크를 짚습니다.",
    placeholder: "궁금한 법률 질문을 그대로 입력하세요. 계약서·문자·진단서 사진도 함께 볼 수 있습니다.",
    submitLabel: "답변 받기",
    loading: "질문을 분석하고 있습니다. 바로 쓸 수 있는 답변으로 정리할게요."
  },
  drafting: {
    title: "문서 작성",
    status: "내용증명, 합의문, 조정 의견서, 소송 전 문구를 초안으로 만듭니다.",
    placeholder: "작성할 문서 종류, 요구사항, 넣고 싶은 사실관계를 입력하세요. 참고 문서 이미지를 첨부할 수 있습니다.",
    submitLabel: "초안 작성하기",
    loading: "문서 초안을 작성하고 있습니다. 위험한 표현과 대체 문구를 함께 보겠습니다."
  }
};

const SOURCE_FALLBACK_TITLES = [
  { host: "easylaw.go.kr", title: "생활법령정보" },
  { host: "law.go.kr", title: "국가법령정보센터" },
  { host: "glaw.scourt.go.kr", title: "대법원 종합법률정보" },
  { host: "scourt.go.kr", title: "대한민국 법원" },
  { host: "moleg.go.kr", title: "법제처" },
  { host: "kca.go.kr", title: "한국소비자원" },
  { host: "consumer.go.kr", title: "소비자24" },
  { host: "klri.re.kr", title: "한국법제연구원" },
  { host: "moel.go.kr", title: "고용노동부" },
  { host: "nlrc.go.kr", title: "중앙노동위원회" },
  { host: "ecrm.police.go.kr", title: "사이버범죄 신고시스템" },
  { host: "police.go.kr", title: "경찰청" },
  { host: "fss.or.kr", title: "금융감독원" }
];

const CASE_TYPE_CONFIG = {
  general: {
    title: "일반",
    status: "먼저 사건을 분류한 뒤 필요한 절차와 증거를 잡습니다.",
    hint: "사건 유형을 잘 모르겠으면 그대로 두고 사실관계부터 적어주세요."
  },
  unfairDismissal: {
    title: "부당해고",
    status: "해고일, 해고통지서, 해고 사유, 노동위원회 기한을 먼저 봅니다.",
    hint: "해고 통보일, 통보 방식, 해고 사유, 회사 규모를 적어주세요."
  },
  unpaidWages: {
    title: "임금체불",
    status: "체불 항목, 금액, 퇴사일, 노동청 진정 가능성을 중심으로 봅니다.",
    hint: "못 받은 월급·퇴직금·수당 금액과 지급일, 근무기간을 적어주세요."
  },
  fraudProperty: {
    title: "사기·재산범죄",
    status: "속인 정황, 피해금, 상대방 특정, 형사와 민사 회수 가능성을 나눠 봅니다.",
    hint: "돈이 오간 날짜, 상대방 말, 입금 내역, 피해금액, 상대방 정보를 적어주세요."
  },
  onlineFraud: {
    title: "인터넷 사기",
    status: "입금 내역, 판매자 정보, 대화 캡처, 형사신고와 회수 가능성을 나눠 봅니다.",
    hint: "거래일, 입금 계좌, 상대방 정보, 대화 내용, 배송/환불 약속을 적어주세요."
  },
  voicePhishing: {
    title: "보이스피싱",
    status: "지급정지, 피해구제 신청, 경찰 신고, 환급 가능성을 시간순으로 봅니다.",
    hint: "이체 시간, 은행, 계좌, 지급정지 여부, 경찰 신고 여부를 적어주세요."
  },
  deposit: {
    title: "전세·보증금",
    status: "계약 종료, 전입·확정일자, 임차권등기, 반환청구 절차를 봅니다.",
    hint: "계약기간, 보증금, 전입신고·확정일자, 집주인 상황을 적어주세요."
  },
  consumer: {
    title: "소비자 피해",
    status: "환불·해지·위약금, 소비자원 절차, 합의 조건을 중심으로 봅니다.",
    hint: "계약일, 결제수단, 환불 요구일, 업체 답변, 약관을 적어주세요."
  },
  medicalBeauty: {
    title: "의료·미용 피해",
    status: "설명의무, 동의서, 시술 전후 사진, 진단서, 손해액 범위를 봅니다.",
    hint: "시술일, 고지 내용, 악화 시점, 진단서 내용, 사진 타임라인을 적어주세요."
  },
  assaultThreatInjury: {
    title: "폭행·협박·상해",
    status: "진단서, CCTV, 쌍방 여부, 합의와 처벌불원 효과를 봅니다.",
    hint: "발생일, 상해 정도, 진단서, CCTV·목격자, 상대방과 합의 여부를 적어주세요."
  },
  defamationInsult: {
    title: "명예훼손·모욕",
    status: "공연성, 특정성, 허위 여부, 캡처 증거와 삭제 전 보전을 봅니다.",
    hint: "게시 위치, 표현 내용, 상대가 누구인지 알 수 있는지, 캡처 여부를 적어주세요."
  },
  sexCrime: {
    title: "성범죄",
    status: "동의 여부, 증거, 피해자 보호 또는 피의자 방어 리스크를 신중히 봅니다.",
    hint: "일시, 장소, 관계, 동의 여부 쟁점, 메시지·녹취·CCTV 등 증거를 적어주세요."
  },
  stalkingDomestic: {
    title: "스토킹·가정폭력",
    status: "반복 연락, 접근금지, 잠정조치, 안전 확보를 우선 봅니다.",
    hint: "반복 연락 횟수, 위협 내용, 주거 접근, 신고 기록, 현재 안전 상태를 적어주세요."
  },
  duiTraffic: {
    title: "음주운전·교통범죄",
    status: "혈중알코올농도, 사고 여부, 면허처분, 합의와 양형자료를 봅니다.",
    hint: "측정 수치, 사고·상해 여부, 과거 전력, 면허 상태, 합의 상황을 적어주세요."
  },
  drugs: {
    title: "마약",
    status: "투약·소지·매매 구분, 검사, 공범, 자수·치료자료를 봅니다.",
    hint: "물질 종류, 횟수, 시기, 검사 여부, 수사 연락 여부, 공범 관계를 적어주세요."
  },
  embezzlementBreach: {
    title: "횡령·배임",
    status: "보관자 지위, 임무위배, 정산자료, 민사와 형사의 경계를 봅니다.",
    hint: "맡긴 돈/회사돈 경위, 사용처, 정산 내역, 회사 규정, 상대방 주장을 적어주세요."
  },
  theftExtortionDamage: {
    title: "절도·공갈·재물손괴",
    status: "점유 침해, 협박을 통한 재산 이전, 손괴 고의와 피해액을 봅니다.",
    hint: "피해 물건, 피해액, CCTV, 협박 내용, 파손 사진, 합의 여부를 적어주세요."
  },
  criminalProcedure: {
    title: "형사절차 대응",
    status: "경찰·검찰 단계, 송치/불송치, 약식명령, 불복 기한을 봅니다.",
    hint: "현재 단계, 받은 통지서, 출석일, 사건번호, 원하는 대응 방향을 적어주세요."
  },
  complaintDrafting: {
    title: "고소장 작성",
    status: "범죄사실, 고소취지, 증거목록, 무고 리스크를 함께 봅니다.",
    hint: "피고소인 정보, 시간순 사실관계, 증거, 처벌을 원하는 이유를 적어주세요."
  },
  suspectInterview: {
    title: "피의자 조사 대응",
    status: "인정/부인 범위, 진술 전략, 조서 수정, 변호인 조력을 봅니다.",
    hint: "혐의명, 출석요구일, 수사기관 연락 내용, 인정하는 사실과 다투는 사실을 적어주세요."
  },
  contract: {
    title: "계약 해지",
    status: "계약서 문구, 해지 사유, 위약금, 내용증명 문구를 중심으로 봅니다.",
    hint: "계약서 조항, 상대방 귀책, 해지 통보 여부, 원하는 결과를 적어주세요."
  },
  criminalComplaint: {
    title: "형사 고소",
    status: "구성요건, 증거, 고소장 구조, 역리스크와 합의 전략을 봅니다.",
    hint: "일시, 장소, 상대방, 증거, 피해 내용, 원하는 처벌/합의 방향을 적어주세요."
  }
};

let mode = "dispute";
let caseType = "general";
let history = [];
let attachedImages = [];
let authRequired = false;
let authMode = "none";
let currentUser = null;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

caseTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCaseType(button.dataset.caseType);
  });
});

setMode(mode);
setCaseType(caseType);
void initializeAuth();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitAuth("login");
});

signupButton.addEventListener("click", async () => {
  await submitAuth("signup");
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  currentUser = null;
  showLogin("로그아웃되었습니다.");
});

clearButton.addEventListener("click", () => {
  history = [];
  clearAttachments();
  chat.innerHTML = "";
  addMessage({
    role: "assistant",
    text: "새 대화를 시작합니다. 사실관계나 문서를 붙여주시면 한국법 기준으로 정리해드릴게요."
  });
  input.focus();
});

attachButton.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", async () => {
  const files = Array.from(imageInput.files || []);
  imageInput.value = "";

  for (const file of files) {
    if (attachedImages.length >= MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      break;
    }

    if (!file.type.startsWith("image/")) {
      alert(`${file.name}은 이미지 파일이 아닙니다.`);
      continue;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      alert(`${file.name}은 8MB를 초과해 첨부하지 않았습니다.`);
      continue;
    }

    attachedImages.push({
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: await readFileAsDataUrl(file)
    });
  }

  renderAttachments();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message && attachedImages.length === 0) return;

  input.value = "";
  const imagesForRequest = attachedImages;
  const selectedCaseType = caseType;
  const selectedCaseConfig = CASE_TYPE_CONFIG[selectedCaseType] || CASE_TYPE_CONFIG.general;
  clearAttachments();
  addMessage({
    role: "user",
    text: message || "첨부 이미지 분석",
    images: imagesForRequest
  });
  history.push({
    role: "user",
    content: [
      `[사건 유형: ${selectedCaseConfig.title}]`,
      imagesForRequest.length ? `${message}\n[이미지 ${imagesForRequest.length}장 첨부]` : message
    ]
      .filter(Boolean)
      .join("\n")
  });
  setBusy(true);

  const loading = addMessage({
    role: "assistant",
    text: deepResearch.checked
      ? "심층 검토 중입니다. 내부 플레이북과 공식 출처를 함께 보면서 쟁점과 가능성을 더 촘촘히 따져보고 있어요."
      : geminiReview.checked
      ? "분석 중입니다. OpenAI 답변을 만든 뒤 Gemini로 한 번 더 검토하고 있어요."
      : MODE_CONFIG[mode].loading
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        images: imagesForRequest,
        mode,
        caseType: selectedCaseType,
        history,
        useKnowledgeBase: knowledgeBase.checked,
        useWebSearch: webSearch.checked,
        useDeepResearch: deepResearch.checked,
        useGeminiReview: geminiReview.checked
      })
    });

    const data = await res.json();
    if (res.status === 401) {
      showLogin("다시 로그인해주세요.");
      throw new Error(data.error || "로그인이 필요합니다.");
    }
    if (!res.ok) throw new Error(data.error || "요청에 실패했습니다.");

    loading.remove();
    const knowledgeSources = (data.knowledgeMatches || []).flatMap((match) => match.sources || []);
    addMessage({
      role: "assistant",
      text: data.text || "응답이 비어 있습니다.",
      citations: dedupeSources([
        ...(data.citations || []),
        ...(data.sources || []),
        ...knowledgeSources
      ])
    });
    history.push({ role: "assistant", content: data.text || "" });
  } catch (error) {
    loading.remove();
    addMessage({
      role: "assistant",
      text: `오류가 발생했습니다.\n\n${error.message}`
    });
  } finally {
    setBusy(false);
  }
});

function addMessage({ role, text, citations = [], images = [] }) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "나" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "assistant") {
    renderRichText(bubble, text);
  } else {
    bubble.textContent = text;
  }

  if (images.length) {
    const imageGrid = document.createElement("div");
    imageGrid.className = "message-images";
    images.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.dataUrl;
      img.alt = image.name || "첨부 이미지";
      imageGrid.append(img);
    });
    bubble.append(imageGrid);
  }

  if (citations.length) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "sources";
    const title = document.createElement("strong");
    title.textContent = "참고 출처";
    sourceBox.append(title);

    citations.slice(0, 8).forEach((source) => {
      const link = document.createElement("a");
      link.href = stripTrackingParams(source.url);
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = formatSourceTitle(source);
      sourceBox.append(link);
    });

    bubble.append(sourceBox);
  }

  article.append(avatar, bubble);
  chat.append(article);
  chat.scrollTop = chat.scrollHeight;
  return article;
}

function setBusy(isBusy) {
  sendButton.disabled = isBusy;
  clearButton.disabled = isBusy;
  logoutButton.disabled = isBusy;
  input.disabled = isBusy;
  attachButton.disabled = isBusy;
  caseTypeButtons.forEach((button) => {
    button.disabled = isBusy;
  });
  knowledgeBase.disabled = isBusy;
  webSearch.disabled = isBusy;
  deepResearch.disabled = isBusy;
  geminiReview.disabled = isBusy;
  sendButton.textContent = isBusy ? "분석 중" : MODE_CONFIG[mode].submitLabel;
}

async function initializeAuth() {
  try {
    const res = await fetch("/api/session");
    const data = await res.json();
    authRequired = data.authRequired === true;
    authMode = data.authMode || "none";
    currentUser = data.user || null;
    configureAuthForm();
    logoutButton.hidden = !authRequired;

    if (!authRequired || data.authenticated) {
      showApp();
    } else {
      showLogin();
    }
  } catch {
    showApp();
  }
}

async function submitAuth(action) {
  loginError.textContent = "";
  setAuthBusy(true);

  try {
    const endpoint = action === "signup" ? "/api/signup" : "/api/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getAuthPayload())
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "인증에 실패했습니다.");

    if (data.needsEmailConfirmation) {
      loginError.textContent = data.message || "이메일 인증 후 로그인해주세요.";
      return;
    }

    currentUser = data.user || null;
    loginPassword.value = "";
    showApp();
  } catch (error) {
    loginError.textContent = error.message;
    getAuthFocusTarget().focus();
  } finally {
    setAuthBusy(false);
  }
}

function getAuthPayload() {
  if (authMode === "supabase") {
    return {
      email: loginEmail.value.trim(),
      password: loginPassword.value
    };
  }

  return { password: loginPassword.value };
}

function configureAuthForm() {
  const usesEmail = authMode === "supabase";
  loginEmail.hidden = !usesEmail;
  signupButton.hidden = !usesEmail;
  loginSubmitButton.textContent = usesEmail ? "로그인" : "입장하기";
  loginDescription.textContent = usesEmail
    ? "이메일로 회원가입하거나 로그인하면 사용할 수 있습니다."
    : "공유 비밀번호를 입력하면 사용할 수 있습니다.";
  loginPassword.placeholder = usesEmail ? "비밀번호" : "공유 비밀번호";
  loginPassword.autocomplete = usesEmail ? "current-password" : "current-password";
}

function setAuthBusy(isBusy) {
  loginEmail.disabled = isBusy;
  loginPassword.disabled = isBusy;
  loginSubmitButton.disabled = isBusy;
  signupButton.disabled = isBusy;
  loginSubmitButton.textContent = isBusy ? "확인 중" : authMode === "supabase" ? "로그인" : "입장하기";
}

function getAuthFocusTarget() {
  return authMode === "supabase" && !loginEmail.value.trim() ? loginEmail : loginPassword;
}

function showApp() {
  loginGate.hidden = true;
  appShell.hidden = false;
  input.focus();
}

function showLogin(message = "") {
  appShell.hidden = true;
  loginGate.hidden = false;
  loginError.textContent = message;
  configureAuthForm();
  getAuthFocusTarget().focus();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function renderAttachments() {
  attachmentPreview.innerHTML = "";
  attachmentPreview.hidden = attachedImages.length === 0;

  attachedImages.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "attachment-item";

    const img = document.createElement("img");
    img.src = image.dataUrl;
    img.alt = image.name;

    const label = document.createElement("span");
    label.textContent = image.name;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "삭제";
    remove.addEventListener("click", () => {
      attachedImages.splice(index, 1);
      renderAttachments();
    });

    item.append(img, label, remove);
    attachmentPreview.append(item);
  });
}

function clearAttachments() {
  attachedImages = [];
  renderAttachments();
}

function setMode(nextMode) {
  mode = nextMode;
  const config = MODE_CONFIG[mode] || MODE_CONFIG.qa;

  modeButtons.forEach((item) => {
    const isActive = item.dataset.mode === mode;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  modeStatusTitle.textContent = config.title;
  modeStatusText.textContent = config.status;
  updateInputPlaceholder();
  if (!sendButton.disabled) {
    sendButton.textContent = config.submitLabel;
  }

  if (mode === "precedent") {
    webSearch.checked = true;
  }
}

function setCaseType(nextCaseType) {
  caseType = nextCaseType;
  const config = CASE_TYPE_CONFIG[caseType] || CASE_TYPE_CONFIG.general;

  caseTypeButtons.forEach((item) => {
    const isActive = item.dataset.caseType === caseType;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  caseStatusText.textContent = config.status;
  updateInputPlaceholder();
}

function updateInputPlaceholder() {
  const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG.qa;
  const caseConfig = CASE_TYPE_CONFIG[caseType] || CASE_TYPE_CONFIG.general;
  input.placeholder = `${modeConfig.placeholder} ${caseConfig.hint}`;
}

function dedupeSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    const normalizedUrl = source?.url ? stripTrackingParams(source.url) : "";
    if (!normalizedUrl || seen.has(normalizedUrl)) return false;
    seen.add(normalizedUrl);
    return true;
  });
}

function renderRichText(container, text) {
  container.textContent = "";
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let cursor = 0;
  let match;

  while ((match = markdownLinkPattern.exec(text)) !== null) {
    appendTextWithBareLinks(container, text.slice(cursor, match.index));
    appendInlineLink(container, match[2], match[1]);
    cursor = match.index + match[0].length;
  }

  appendTextWithBareLinks(container, text.slice(cursor));
}

function appendTextWithBareLinks(container, text) {
  const bareUrlPattern = /https?:\/\/[^\s)]+/g;
  let cursor = 0;
  let match;

  while ((match = bareUrlPattern.exec(text)) !== null) {
    container.append(document.createTextNode(text.slice(cursor, match.index)));
    appendInlineLink(container, match[0], "");
    cursor = match.index + match[0].length;
  }

  container.append(document.createTextNode(text.slice(cursor)));
}

function appendInlineLink(container, url, label) {
  const link = document.createElement("a");
  link.href = stripTrackingParams(url);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.className = "inline-source-link";
  link.textContent = formatInlineSourceTitle(label, link.href);
  container.append(link);
}

function formatInlineSourceTitle(label, url) {
  const cleanedLabel = String(label || "").trim();
  if (
    cleanedLabel &&
    !looksLikeUrl(cleanedLabel) &&
    !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleanedLabel)
  ) {
    return cleanedLabel;
  }

  return formatSourceTitle({ title: cleanedLabel, url });
}

function stripTrackingParams(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    return parsed.toString();
  } catch {
    return url;
  }
}

function formatSourceTitle(source) {
  const rawTitle = String(source.title || "").trim();
  if (rawTitle && !looksLikeUrl(rawTitle)) return rawTitle;

  try {
    const url = new URL(source.url);
    const fallback = SOURCE_FALLBACK_TITLES.find((item) => url.hostname.includes(item.host));
    return fallback?.title || url.hostname.replace(/^www\./, "");
  } catch {
    return rawTitle || "참고 출처";
  }
}

function looksLikeUrl(value) {
  return /^https?:\/\//i.test(value) || value.length > 70;
}

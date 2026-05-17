const loginGate = document.querySelector("#loginGate");
const loginForm = document.querySelector("#loginForm");
const loginDescription = document.querySelector("#loginDescription");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginSubmitButton = document.querySelector("#loginSubmitButton");
const signupButton = document.querySelector("#signupButton");
const privacyConsentWrap = document.querySelector("#privacyConsentWrap");
const privacyConsent = document.querySelector("#privacyConsent");
const privacyDetails = document.querySelector("#privacyDetails");
const loginError = document.querySelector("#loginError");
const appShell = document.querySelector("#appShell");
const sidebarToggle = document.querySelector("#sidebarToggle");
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
const lightThemeButton = document.querySelector("#lightThemeButton");
const darkThemeButton = document.querySelector("#darkThemeButton");
const modeStatusTitle = document.querySelector("#modeStatusTitle");
const modeStatusText = document.querySelector("#modeStatusText");
const caseStatusText = document.querySelector("#caseStatusText");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const caseCategoryButtons = Array.from(document.querySelectorAll(".case-category-button"));
const caseTypeButtons = Array.from(document.querySelectorAll(".case-type-button"));
const quickStartPanel = document.querySelector("#quickStartPanel");
const quickStartCards = Array.from(document.querySelectorAll(".quickstart-card"));
const caseFilePanel = document.querySelector("#caseFilePanel");
const caseFileStatus = document.querySelector("#caseFileStatus");
const caseList = document.querySelector("#caseList");
const newCaseButton = document.querySelector("#newCaseButton");
const saveCaseButton = document.querySelector("#saveCaseButton");
const documentToolbox = document.querySelector("#documentToolbox");
const contentProofType = document.querySelector("#contentProofType");
const contentProofTone = document.querySelector("#contentProofTone");
const contentProofSender = document.querySelector("#contentProofSender");
const contentProofRecipient = document.querySelector("#contentProofRecipient");
const contentProofAmount = document.querySelector("#contentProofAmount");
const contentProofDeadline = document.querySelector("#contentProofDeadline");
const contentProofDemand = document.querySelector("#contentProofDemand");
const contentProofFacts = document.querySelector("#contentProofFacts");
const contentProofEvidence = document.querySelector("#contentProofEvidence");
const contentProofFillButton = document.querySelector("#contentProofFillButton");
const contentProofDraftButton = document.querySelector("#contentProofDraftButton");

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
  { host: "epost.go.kr", title: "인터넷우체국" },
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

const CONTENT_PROOF_CONFIG = {
  refund: {
    title: "계약 해지·환불 요구",
    caseType: "consumer",
    demand: "계약 해지 및 결제대금 환불",
    factsHint: "계약일, 결제금액, 환불 요청일, 업체 답변, 약관/광고 문구를 시간순으로 적어주세요."
  },
  wage: {
    title: "임금체불 지급 요구",
    caseType: "unpaidWages",
    demand: "미지급 임금 및 퇴직금 지급",
    factsHint: "근무기간, 임금 약정, 미지급 기간·금액, 퇴사일, 사업주 답변을 적어주세요."
  },
  deposit: {
    title: "전세·보증금 반환 요구",
    caseType: "deposit",
    demand: "임대차보증금 반환",
    factsHint: "계약기간, 계약 종료 통지일, 보증금, 전입신고·확정일자, 반환 거절 사유를 적어주세요."
  },
  beauty: {
    title: "의료·미용 피해 손해배상 요구",
    caseType: "medicalBeauty",
    demand: "치료비 및 손해배상 협의",
    factsHint: "시술일, 사전 고지 내용, 악화 시점, 진단서 내용, 업체 답변, 사진 타임라인을 적어주세요."
  },
  defamation: {
    title: "게시물 삭제·명예훼손 중단 요청",
    caseType: "defamationInsult",
    demand: "게시물 삭제, 재게시 중단, 사과 또는 정정",
    factsHint: "게시일, 플랫폼/URL, 표현 내용, 특정성, 허위 여부, 삭제 요청 기록을 적어주세요."
  },
  loan: {
    title: "대여금 변제 요구",
    caseType: "general",
    demand: "대여금 변제",
    factsHint: "빌려준 날짜, 금액, 변제기, 송금내역, 일부 변제, 상대방의 변제 약속을 적어주세요."
  },
  settlement: {
    title: "합의서 위험문구 검토",
    caseType: "general",
    demand: "합의 조건 정리 및 위험 문구 대체",
    factsHint: "합의하려는 금액, 지급일, 향후 청구 유보 여부, 상대방이 넣자고 한 문구를 적어주세요."
  },
  complaint: {
    title: "고소장 초안",
    caseType: "complaintDrafting",
    demand: "범죄사실과 증거목록이 분리된 고소장 초안",
    factsHint: "피고소인 정보, 사건 일시·장소, 상대방 말과 행동, 피해 내용, 보유 증거를 시간순으로 적어주세요."
  },
  laborPetition: {
    title: "노동청 진정서",
    caseType: "unpaidWages",
    demand: "미지급 임금에 대한 노동청 진정서 초안",
    factsHint: "회사명, 근무기간, 임금 약정, 체불 항목과 금액, 사업주 답변, 퇴사 여부를 적어주세요."
  },
  consumerApplication: {
    title: "소비자원 피해구제 신청서",
    caseType: "consumer",
    demand: "한국소비자원 피해구제 신청용 사실관계 정리",
    factsHint: "계약일, 결제금액, 상품·서비스 내용, 환불 요구일, 업체 답변, 원하는 합의안을 적어주세요."
  },
  paymentOrder: {
    title: "지급명령 신청 전 정리",
    caseType: "general",
    demand: "채권 금액, 증거, 상대방 주소 확인사항 정리",
    factsHint: "돈을 받을 근거, 금액, 변제기, 상대방 주소, 송금내역·계약서·확인 문자 등 증거를 적어주세요."
  },
  lawsuitFacts: {
    title: "소장용 사실관계 정리",
    caseType: "general",
    demand: "청구취지·청구원인 작성 전 사실관계 정리",
    factsHint: "원고/피고, 청구금액, 사건 경위, 상대방 귀책, 손해액, 증거를 시간순으로 적어주세요."
  }
};

const CONTENT_PROOF_TONE_LABELS = {
  soft: "부드러운 합의 요청",
  balanced: "단호하지만 협상 가능",
  final: "소송 전 최종 통지"
};

let mode = "dispute";
let caseType = "general";
let activeCaseCategory = "all";
let history = [];
let attachedImages = [];
let caseFiles = [];
let currentCaseId = null;
let caseStorageMode = "local";
let authRequired = false;
let authMode = "none";
let currentUser = null;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const PRIVACY_ACCEPTED_KEY = "legalAgentPrivacyAccepted";
const CASE_FILES_KEY = "legalAgentCaseFiles";
const SIDEBAR_STATE_KEY = "legalAgentSidebarState";
const THEME_KEY = "legalAgentTheme";

const CASE_CATEGORY_DEFAULTS = {
  all: "general",
  labor: "unpaidWages",
  housing: "deposit",
  consumer: "consumer",
  criminal: "fraudProperty",
  document: "contract"
};

const QUICKSTART_CONFIG = {
  damage: {
    mode: "dispute",
    caseType: "medicalBeauty",
    text: [
      "피해 사건을 쟁점 정리해줘.",
      "",
      "- 사건 유형:",
      "- 발생일:",
      "- 상대방:",
      "- 피해 내용:",
      "- 현재 가진 증거:",
      "- 상대방 주장 또는 답변:",
      "- 원하는 결과:",
      "",
      "일부승소 가능성, 책임비율, 현실적 합의선, 지금 해야 할 행동을 나눠서 알려줘."
    ].join("\n")
  },
  money: {
    mode: "dispute",
    caseType: "unpaidWages",
    text: [
      "돈을 받기 위한 절차를 정리해줘.",
      "",
      "- 받을 돈의 종류:",
      "- 금액:",
      "- 지급하기로 한 날짜:",
      "- 상대방 정보:",
      "- 계약서/문자/송금내역 등 증거:",
      "- 지금까지 한 요구:",
      "",
      "노동청, 내용증명, 지급명령, 소송 중 어떤 순서가 유리한지 알려줘."
    ].join("\n")
  },
  criminal: {
    mode: "dispute",
    caseType: "fraudProperty",
    text: [
      "형사 고소 또는 형사절차 대응 가능성을 검토해줘.",
      "",
      "- 혐의 또는 사건 유형:",
      "- 발생일과 장소:",
      "- 상대방이 한 말/행동:",
      "- 피해 내용:",
      "- 증거:",
      "- 현재 경찰/검찰 단계:",
      "- 내가 원하는 결과:",
      "",
      "범죄 성립 가능성, 증거 부족한 부분, 고소 전 리스크, 민사와 병행할지 알려줘."
    ].join("\n")
  },
  document: {
    mode: "drafting",
    caseType: "consumer",
    text: [
      "아래 내용을 바탕으로 제출 또는 발송 가능한 문서 초안을 만들어줘.",
      "",
      "- 문서 종류:",
      "- 상대방:",
      "- 요구사항:",
      "- 사실관계:",
      "- 보유 증거:",
      "- 피하고 싶은 문구:",
      "",
      "위험한 표현은 순화하고, 빈 정보는 [확인 필요]로 남겨줘."
    ].join("\n")
  }
};

const RESPONSE_ACTIONS = [
  { id: "nextSteps", label: "다음 행동 제안" },
  { id: "notice", label: "내용증명으로 만들기" },
  { id: "evidence", label: "증거 체크리스트" },
  { id: "rebuttal", label: "상대방 반박 예상" },
  { id: "settlement", label: "합의문 문구 검토" },
  { id: "copy", label: "요약 복사" }
];

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

caseCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCaseCategory(button.dataset.caseCategory, { selectDefault: true });
  });
});

caseTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCaseType(button.dataset.caseType);
  });
});

quickStartCards.forEach((button) => {
  button.addEventListener("click", () => {
    applyQuickStart(button.dataset.quickstart);
  });
});

setMode(mode);
setCaseCategory(activeCaseCategory);
setCaseType(caseType);
applyContentProofPreset();
setTheme(loadTheme(), false);
setSidebarCollapsed(loadSidebarCollapsed(), false);
void initializeAuth();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitAuth();
});

signupButton.addEventListener("click", async () => {
  await submitAuth();
});

sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!appShell.classList.contains("sidebar-collapsed"));
});

lightThemeButton.addEventListener("click", () => {
  setTheme("light");
});

darkThemeButton.addEventListener("click", () => {
  setTheme("dark");
});

privacyConsent.addEventListener("change", () => {
  if (privacyConsent.checked && loginError.textContent === "개인정보 처리 안내 확인이 필요합니다.") {
    loginError.textContent = "";
  }
});

contentProofType.addEventListener("change", () => {
  applyContentProofPreset();
});

contentProofFillButton.addEventListener("click", () => {
  fillContentProofPrompt();
});

contentProofDraftButton.addEventListener("click", () => {
  fillContentProofPrompt();
  form.requestSubmit();
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  currentUser = null;
  caseFiles = [];
  currentCaseId = null;
  renderCaseFiles();
  showLogin("로그아웃되었습니다.");
});

clearButton.addEventListener("click", () => {
  history = [];
  currentCaseId = null;
  clearAttachments();
  chat.innerHTML = "";
  quickStartPanel.hidden = false;
  addMessage({
    role: "assistant",
    text: "새 대화를 시작합니다. 사실관계나 문서를 붙여주시면 한국법 기준으로 정리해드릴게요."
  });
  updateCaseFileStatus("현재 대화는 아직 저장 전입니다.");
  input.focus();
});

newCaseButton.addEventListener("click", () => {
  history = [];
  currentCaseId = null;
  clearAttachments();
  chat.innerHTML = "";
  quickStartPanel.hidden = false;
  addMessage({
    role: "assistant",
    text: "새 사건 파일을 시작합니다. 첫 질문 도우미를 고르거나 사실관계를 바로 입력해주세요."
  });
  renderCaseFiles();
  updateCaseFileStatus("새 사건을 시작했습니다. 첫 답변 이후 자동 저장됩니다.");
  input.focus();
});

saveCaseButton.addEventListener("click", async () => {
  await saveCurrentCaseSnapshot();
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
  const selectedMode = mode;
  const selectedCaseConfig = CASE_TYPE_CONFIG[selectedCaseType] || CASE_TYPE_CONFIG.general;
  clearAttachments();
  quickStartPanel.hidden = true;
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
      : MODE_CONFIG[mode].loading,
    pending: true,
    pendingSteps: buildPendingSteps()
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        images: imagesForRequest,
        mode: selectedMode,
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
      ]),
      actions: true
    });
    history.push({ role: "assistant", content: data.text || "" });
    await persistConversationTurn({
      userText: message || "첨부 이미지 분석",
      assistantText: data.text || "",
      selectedMode,
      selectedCaseType
    });
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

function addMessage({ role, text, citations = [], images = [], pending = false, pendingSteps = [], actions = false }) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  if (pending) article.classList.add("pending");

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "나" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (pending) {
    bubble.classList.add("thinking-bubble");
    renderThinkingBubble(bubble, text, pendingSteps);
  } else if (role === "assistant") {
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

  if (actions && role === "assistant" && !pending) {
    renderResponseActions(bubble, text);
  }

  article.append(avatar, bubble);
  chat.append(article);
  chat.scrollTop = chat.scrollHeight;
  return article;
}

function renderResponseActions(container, answerText) {
  const actions = document.createElement("div");
  actions.className = "response-actions";

  RESPONSE_ACTIONS.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "response-action-button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      handleResponseAction(action.id, answerText);
    });
    actions.append(button);
  });

  container.append(actions);
}

async function handleResponseAction(actionId, answerText) {
  if (actionId === "copy") {
    const summary = answerText.split("\n").slice(0, 8).join("\n").trim();
    try {
      await navigator.clipboard.writeText(summary || answerText);
      updateCaseFileStatus("답변 요약을 클립보드에 복사했습니다.");
    } catch {
      input.value = summary || answerText;
      updateCaseFileStatus("클립보드 복사가 막혀 입력창에 요약을 넣었습니다.");
    }
    return;
  }

  const prompts = {
    nextSteps: [
      "위 답변을 바탕으로 지금 당장 해야 할 행동을 정리해줘.",
      "오늘 할 일, 3일 안에 할 일, 하지 말아야 할 일을 나눠서 제안하고, 각 행동의 이유와 우선순위도 알려줘."
    ],
    notice: [
      "위 답변과 내 사건을 바탕으로 내용증명 초안을 만들어줘.",
      "상대방이 읽어도 과격하지 않게 쓰고, 위험한 문구와 대체 문구도 같이 알려줘."
    ],
    evidence: [
      "위 답변 기준으로 증거 체크리스트를 만들어줘.",
      "이미 있는 증거, 추가로 확보할 증거, 병원/기관에서 받을 자료, 제출 우선순위를 표로 정리해줘."
    ],
    rebuttal: [
      "위 사건에서 상대방이 할 수 있는 반박을 예상해줘.",
      "각 반박에 대한 재반박 논리와 추가로 필요한 증거를 같이 정리해줘."
    ],
    settlement: [
      "위 사건에서 합의문 문구를 검토해줘.",
      "위험한 문구, 넣으면 안 되는 문구, 향후 청구 가능성을 열어두는 대체 문구를 제안해줘."
    ]
  };

  if (actionId === "notice") {
    setMode("drafting");
  }

  input.value = `${prompts[actionId]?.join("\n") || "위 답변을 바탕으로 다음 행동을 정리해줘."}\n\n참고할 이전 답변 요약:\n${answerText.slice(0, 1800)}`;
  input.focus();
}

function buildPendingSteps() {
  if (deepResearch.checked) {
    return ["사실관계 정리", "공식 근거 검색", "전략 범위 계산"];
  }

  if (geminiReview.checked) {
    return ["1차 답변 작성", "Gemini 교차검증", "최종 정리"];
  }

  if (mode === "drafting") {
    return ["사실관계 정리", "위험 문구 점검", "문서 초안 구성"];
  }

  if (mode === "precedent") {
    return ["쟁점 추출", "근거 후보 확인", "판단 요지 정리"];
  }

  return ["사실관계 정리", "플레이북 확인", "답변 구성"];
}

function renderThinkingBubble(container, text, steps = []) {
  container.textContent = "";

  const status = document.createElement("div");
  status.className = "thinking-status";

  const orb = document.createElement("span");
  orb.className = "thinking-orb";
  orb.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = text;

  const dots = document.createElement("span");
  dots.className = "thinking-dots";
  dots.setAttribute("aria-hidden", "true");
  dots.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));

  status.append(orb, label, dots);
  container.append(status);

  if (steps.length) {
    const stepList = document.createElement("div");
    stepList.className = "thinking-steps";
    steps.forEach((step) => {
      const item = document.createElement("span");
      item.textContent = step;
      stepList.append(item);
    });
    container.append(stepList);
  }
}

function setBusy(isBusy) {
  sendButton.disabled = isBusy;
  clearButton.disabled = isBusy;
  logoutButton.disabled = isBusy;
  input.disabled = isBusy;
  attachButton.disabled = isBusy;
  contentProofFillButton.disabled = isBusy;
  contentProofDraftButton.disabled = isBusy;
  newCaseButton.disabled = isBusy;
  saveCaseButton.disabled = isBusy;
  quickStartCards.forEach((button) => {
    button.disabled = isBusy;
  });
  documentToolbox.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = isBusy;
  });
  caseCategoryButtons.forEach((button) => {
    button.disabled = isBusy;
  });
  caseTypeButtons.forEach((button) => {
    button.disabled = isBusy;
  });
  knowledgeBase.disabled = isBusy;
  webSearch.disabled = isBusy;
  deepResearch.disabled = isBusy;
  geminiReview.disabled = isBusy;
  sendButton.textContent = isBusy ? "분석 중" : MODE_CONFIG[mode].submitLabel;
}

function loadSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STATE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function setTheme(nextTheme, persist = true) {
  const theme = nextTheme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  lightThemeButton.classList.toggle("active", theme === "light");
  darkThemeButton.classList.toggle("active", theme === "dark");
  lightThemeButton.setAttribute("aria-pressed", String(theme === "light"));
  darkThemeButton.setAttribute("aria-pressed", String(theme === "dark"));

  if (!persist) return;

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // 테마 저장 실패는 사용 흐름을 막지 않습니다.
  }
}

function setSidebarCollapsed(isCollapsed, persist = true) {
  appShell.classList.toggle("sidebar-collapsed", isCollapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
  sidebarToggle.setAttribute("aria-label", isCollapsed ? "사이드바 열기" : "사이드바 닫기");
  sidebarToggle.title = isCollapsed ? "사이드바 열기" : "사이드바 닫기";

  if (!persist) return;

  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, isCollapsed ? "collapsed" : "open");
  } catch {
    // 사이드바 상태 저장 실패는 사용 흐름을 막지 않습니다.
  }
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
    await loadCaseFiles();

    if (!authRequired || data.authenticated) {
      showApp();
    } else {
      showLogin();
    }
  } catch {
    showApp();
  }
}

async function submitAuth() {
  loginError.textContent = "";

  if (authMode === "supabase" && !privacyConsent.checked) {
    loginError.textContent = "개인정보 처리 안내 확인이 필요합니다.";
    privacyConsent.focus();
    return;
  }

  setAuthBusy(true);

  try {
    const endpoint = authMode === "supabase" ? "/api/auth/continue" : "/api/login";
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
    storePrivacyConsent();
    loginPassword.value = "";
    await loadCaseFiles();
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
      password: loginPassword.value,
      privacyAccepted: privacyConsent.checked
    };
  }

  return { password: loginPassword.value };
}

function configureAuthForm() {
  const usesEmail = authMode === "supabase";
  loginEmail.hidden = !usesEmail;
  privacyConsentWrap.hidden = !usesEmail;
  privacyDetails.hidden = !usesEmail;
  privacyConsent.disabled = !usesEmail;
  if (usesEmail && hasStoredPrivacyConsent()) {
    privacyConsent.checked = true;
  }
  signupButton.hidden = true;
  loginSubmitButton.textContent = usesEmail ? "로그인 / 회원가입" : "입장하기";
  loginDescription.textContent = usesEmail
    ? "이메일과 비밀번호를 입력하면 가입된 계정은 로그인되고, 처음 쓰는 이메일은 회원가입됩니다."
    : "공유 비밀번호를 입력하면 사용할 수 있습니다.";
  loginPassword.placeholder = usesEmail ? "비밀번호" : "공유 비밀번호";
  loginPassword.autocomplete = usesEmail ? "current-password" : "current-password";
}

function setAuthBusy(isBusy) {
  loginEmail.disabled = isBusy;
  loginPassword.disabled = isBusy;
  privacyConsent.disabled = isBusy || authMode !== "supabase";
  loginSubmitButton.disabled = isBusy;
  signupButton.disabled = isBusy;
  loginSubmitButton.textContent = isBusy ? "처리 중" : authMode === "supabase" ? "로그인 / 회원가입" : "입장하기";
}

function hasStoredPrivacyConsent() {
  try {
    return localStorage.getItem(PRIVACY_ACCEPTED_KEY) === "true";
  } catch {
    return false;
  }
}

function storePrivacyConsent() {
  if (authMode !== "supabase" || !privacyConsent.checked) return;

  try {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
  } catch {
    // Local storage can be disabled in private browsing modes.
  }
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

async function loadCaseFiles() {
  const canUseServer = authMode === "supabase" && currentUser?.id;
  caseStorageMode = canUseServer ? "server" : "local";

  if (canUseServer) {
    try {
      const data = await fetchJson("/api/cases");
      caseFiles = normalizeCases(data.cases || []);
      updateCaseFileStatus("사건 파일함이 계정에 연결되었습니다.");
      renderCaseFiles();
      return;
    } catch {
      caseStorageMode = "local";
      updateCaseFileStatus("Supabase 사건 테이블이 없어서 이 브라우저에 임시 저장합니다.");
    }
  }

  caseFiles = loadLocalCases();
  renderCaseFiles();
}

function normalizeCases(cases) {
  return cases.map((item) => ({
    id: item.id,
    title: item.title || "제목 없는 사건",
    mode: item.mode || "dispute",
    caseType: item.caseType || item.case_type || "general",
    updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
    messages: item.messages || []
  }));
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "요청에 실패했습니다.");
  return data;
}

function loadLocalCases() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CASE_FILES_KEY) || "[]");
    return Array.isArray(parsed) ? normalizeCases(parsed) : [];
  } catch {
    return [];
  }
}

function saveLocalCases() {
  try {
    localStorage.setItem(CASE_FILES_KEY, JSON.stringify(caseFiles.slice(0, 50)));
  } catch {
    updateCaseFileStatus("브라우저 저장 공간이 부족해 사건 파일을 저장하지 못했습니다.");
  }
}

function renderCaseFiles() {
  caseList.innerHTML = "";

  caseFiles.slice(0, 12).forEach((caseFile) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-file-item";
    button.classList.toggle("active", caseFile.id === currentCaseId);
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = caseFile.title;
    button.querySelector("span").textContent = `${getCaseTitle(caseFile.caseType)} · ${formatCaseTime(caseFile.updatedAt)}`;
    button.addEventListener("click", () => {
      void openCaseFile(caseFile.id);
    });
    caseList.append(button);
  });
}

async function openCaseFile(caseId) {
  const caseFile = caseFiles.find((item) => item.id === caseId);
  if (!caseFile) return;

  let messages = caseFile.messages || [];
  if (caseStorageMode === "server") {
    try {
      const data = await fetchJson(`/api/cases/${encodeURIComponent(caseId)}/messages`);
      messages = data.messages || [];
      caseFile.messages = messages;
    } catch (error) {
      updateCaseFileStatus(error.message);
    }
  }

  currentCaseId = caseId;
  history = messages.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.content || ""
  }));
  setMode(caseFile.mode || "dispute");
  setCaseType(caseFile.caseType || "general");
  chat.innerHTML = "";

  if (!messages.length) {
    quickStartPanel.hidden = false;
    addMessage({ role: "assistant", text: "이 사건 파일에는 아직 저장된 대화가 없습니다. 사실관계를 입력해 주세요." });
  } else {
    quickStartPanel.hidden = true;
    messages.forEach((item) => {
      addMessage({
        role: item.role === "assistant" ? "assistant" : "user",
        text: item.content || "",
        actions: item.role === "assistant"
      });
    });
  }

  updateCaseFileStatus(`열린 사건: ${caseFile.title}`);
  renderCaseFiles();
  input.focus();
}

async function saveCurrentCaseSnapshot() {
  if (!history.length) {
    updateCaseFileStatus("저장할 대화가 아직 없습니다.");
    return;
  }

  const caseFile = await ensureCurrentCase({
    titleSeed: history.find((item) => item.role === "user")?.content || "새 법률 사건",
    selectedMode: mode,
    selectedCaseType: caseType
  });

  if (!caseFile) return;

  if (caseStorageMode === "local") {
    caseFile.messages = history.map((item) => ({
      role: item.role,
      content: item.content,
      createdAt: new Date().toISOString()
    }));
    caseFile.updatedAt = new Date().toISOString();
    saveLocalCases();
  }

  renderCaseFiles();
  updateCaseFileStatus(`저장됨: ${caseFile.title}`);
}

async function persistConversationTurn({ userText, assistantText, selectedMode, selectedCaseType }) {
  const caseFile = await ensureCurrentCase({
    titleSeed: userText,
    selectedMode,
    selectedCaseType
  });
  if (!caseFile) return;

  const now = new Date().toISOString();
  const messages = [
    { role: "user", content: userText, createdAt: now },
    { role: "assistant", content: assistantText, createdAt: now }
  ];

  if (caseStorageMode === "server") {
    try {
      await fetchJson(`/api/cases/${encodeURIComponent(caseFile.id)}/messages`, {
        method: "POST",
        body: JSON.stringify({ messages })
      });
      caseFile.updatedAt = now;
      updateCaseFileStatus(`자동 저장됨: ${caseFile.title}`);
    } catch (error) {
      caseStorageMode = "local";
      updateCaseFileStatus(`${error.message} 이 브라우저에 임시 저장합니다.`);
    }
  }

  if (caseStorageMode === "local") {
    caseFile.messages = [...(caseFile.messages || []), ...messages];
    caseFile.updatedAt = now;
    saveLocalCases();
    updateCaseFileStatus(`이 브라우저에 저장됨: ${caseFile.title}`);
  }

  sortCaseFiles();
  renderCaseFiles();
}

async function ensureCurrentCase({ titleSeed, selectedMode, selectedCaseType }) {
  if (currentCaseId) {
    return caseFiles.find((item) => item.id === currentCaseId) || null;
  }

  const title = buildCaseTitle(titleSeed);
  const now = new Date().toISOString();

  if (caseStorageMode === "server") {
    try {
      const data = await fetchJson("/api/cases", {
        method: "POST",
        body: JSON.stringify({ title, mode: selectedMode, caseType: selectedCaseType })
      });
      const created = normalizeCases([data.case])[0];
      caseFiles.unshift(created);
      currentCaseId = created.id;
      return created;
    } catch (error) {
      caseStorageMode = "local";
      updateCaseFileStatus(`${error.message} 이 브라우저에 임시 저장합니다.`);
    }
  }

  const localCase = {
    id: `local-${Date.now()}`,
    title,
    mode: selectedMode,
    caseType: selectedCaseType,
    updatedAt: now,
    messages: []
  };
  caseFiles.unshift(localCase);
  currentCaseId = localCase.id;
  saveLocalCases();
  return localCase;
}

function sortCaseFiles() {
  caseFiles.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function buildCaseTitle(seed) {
  const cleaned = String(seed || "새 법률 사건")
    .replace(/\[사건 유형:[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 28) || "새 법률 사건";
}

function getCaseTitle(targetCaseType) {
  return CASE_TYPE_CONFIG[targetCaseType]?.title || "일반";
}

function formatCaseTime(value) {
  if (!value) return "방금";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "방금";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function updateCaseFileStatus(message) {
  caseFileStatus.textContent = message;
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

function applyContentProofPreset() {
  const config = CONTENT_PROOF_CONFIG[contentProofType.value] || CONTENT_PROOF_CONFIG.refund;
  contentProofDemand.value = config.demand;
  contentProofFacts.placeholder = config.factsHint;
}

function fillContentProofPrompt() {
  const config = CONTENT_PROOF_CONFIG[contentProofType.value] || CONTENT_PROOF_CONFIG.refund;
  const targetCaseType = config.caseType || "general";

  setMode("drafting");
  setCaseType(targetCaseType);
  input.value = buildContentProofPrompt(config);
  input.focus();
}

function applyQuickStart(type) {
  const config = QUICKSTART_CONFIG[type];
  if (!config) return;

  setMode(config.mode);
  setCaseType(config.caseType);
  input.value = config.text;
  quickStartPanel.hidden = true;
  input.focus();
}

function buildContentProofPrompt(config) {
  const valueOrBlank = (value) => String(value || "").trim() || "[확인 필요]";
  const toneLabel = CONTENT_PROOF_TONE_LABELS[contentProofTone.value] || CONTENT_PROOF_TONE_LABELS.balanced;
  const isNotice = ["refund", "wage", "deposit", "beauty", "defamation", "loan"].includes(contentProofType.value);

  return [
    `${config.title} 검토용 초안을 작성해줘.`,
    "",
    "문서 작성 조건:",
    `- 문서 유형: ${config.title}`,
    `- 문서 강도: ${toneLabel}`,
    `- 발신인: ${valueOrBlank(contentProofSender.value)}`,
    `- 수신인: ${valueOrBlank(contentProofRecipient.value)}`,
    `- 요구 금액: ${valueOrBlank(contentProofAmount.value)}`,
    `- 답변 기한: ${valueOrBlank(contentProofDeadline.value)}`,
    `- 핵심 요구: ${valueOrBlank(contentProofDemand.value)}`,
    "",
    "사실관계:",
    valueOrBlank(contentProofFacts.value),
    "",
    "첨부 또는 보유 증거:",
    valueOrBlank(contentProofEvidence.value),
    "",
    "작성 방식:",
    "- 첫 줄에 '검토용 초안'이라고 표시해줘.",
    isNotice
      ? "- 제목, 발신인, 수신인, 통지 취지, 사실관계, 요구사항, 답변기한, 미이행 시 조치, 첨부자료, 발송 전 체크리스트 순서로 작성해줘."
      : "- 제목, 작성 목적, 당사자, 사실관계, 핵심 쟁점, 요구사항 또는 신청취지, 증거목록, 제출 전 체크리스트 순서로 작성해줘.",
    "- 비난·협박·모욕 표현은 빼고, 기관이나 법원이 읽어도 차분한 문장으로 써줘.",
    "- 빈 정보는 임의로 만들지 말고 [확인 필요]로 남겨줘.",
    isNotice
      ? "- 내용증명은 권리를 확정하는 문서가 아니라 발송한 내용과 시점을 증명하는 수단이라는 한계를 짧게 설명해줘."
      : "- 이 초안은 제출 전 검토용이고, 실제 제출 형식과 관할 기관 요구사항은 최신 양식으로 확인해야 한다고 설명해줘.",
    "- 위험한 문구 3개와 대체 문구 3개를 마지막에 제시해줘.",
    "- 실제 발송 전 확인할 항목과 변호사 상담이 필요한 경우도 덧붙여줘."
  ].join("\n");
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
  documentToolbox.hidden = mode !== "drafting";
  updateInputPlaceholder();
  if (!sendButton.disabled) {
    sendButton.textContent = config.submitLabel;
  }

  if (mode === "precedent") {
    webSearch.checked = true;
  }
}

function setCaseCategory(nextCategory = "all", options = {}) {
  activeCaseCategory = nextCategory || "all";
  const shouldSelectDefault = options.selectDefault === true;
  const visibleCaseTypes = [];

  caseCategoryButtons.forEach((item) => {
    const isActive = item.dataset.caseCategory === activeCaseCategory;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  caseTypeButtons.forEach((item) => {
    const itemCategory = item.dataset.caseCategory || "all";
    const isVisible = activeCaseCategory === "all" || itemCategory === activeCaseCategory;
    item.hidden = !isVisible;
    if (isVisible) visibleCaseTypes.push(item.dataset.caseType);
  });

  if (shouldSelectDefault && !visibleCaseTypes.includes(caseType)) {
    setCaseType(CASE_CATEGORY_DEFAULTS[activeCaseCategory] || visibleCaseTypes[0] || "general", {
      preserveCategory: true
    });
  }
}

function setCaseType(nextCaseType, options = {}) {
  caseType = nextCaseType;
  const config = CASE_TYPE_CONFIG[caseType] || CASE_TYPE_CONFIG.general;
  const selectedButton = caseTypeButtons.find((item) => item.dataset.caseType === caseType);

  if (!options.preserveCategory && selectedButton?.dataset.caseCategory && activeCaseCategory !== "all") {
    setCaseCategory(selectedButton.dataset.caseCategory);
  }

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

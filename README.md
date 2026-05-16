# 한국법 법률 에이전트 웹앱

한국법 기준의 법률 정보 정리 보조 챗봇입니다. 소송/분쟁 쟁점 정리, 판례 검색, 법률 Q&A, 문서 초안을 일반인이 읽기 쉬운 형식으로 제공합니다.

## 실행

```bash
cd legal-agent-webapp
cp .env.example .env
```

`.env`에 `OPENAI_API_KEY`를 넣은 뒤 실행합니다. 회원가입/로그인을 쓰려면 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AUTH_SECRET`도 설정하세요. Supabase 없이 임시로 공유 비밀번호만 쓰려면 `APP_PASSWORD`를 설정하면 됩니다.

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 배포

Render나 Railway 같은 Node.js 웹 서비스에 배포할 수 있습니다. 자세한 절차는 [DEPLOYMENT.md](/Users/minjae/Documents/New%20project/legal-agent-webapp/DEPLOYMENT.md)를 참고하세요.

## 설계

- `server.js`: 정적 파일 서버와 `/api/chat` API
- `agent-config.js`: 한국법 에이전트 시스템 지침, 검색 도메인, 모드 라벨
- `knowledge/`: 내부 법률 플레이북 Markdown 자료
- `knowledge-base.js`: 질문과 플레이북을 매칭해 답변 컨텍스트에 넣는 로컬 검색 모듈
- `public/`: 웹 UI

## 내부 플레이북

앱은 기본적으로 웹검색 전에 `knowledge/`의 내부 법률 플레이북을 먼저 검색합니다. 플레이북은 사건 유형별 체크리스트와 누락 방지용 자료이며, 최신 법령/판례 자체를 대체하지 않습니다. 자료가 많아지면 OpenAI vector store와 `file_search`로 옮길 수 있습니다.

## 사건 유형 탭

작업 모드와 별도로 부당해고, 임금체불, 인터넷 사기, 보이스피싱, 전세·보증금, 소비자 피해, 의료·미용 피해, 계약 해지, 형사 고소 유형을 선택할 수 있습니다. 선택한 유형은 프롬프트와 플레이북 검색에 함께 전달되어 기한, 증거, 신고/신청 기관, 절차를 유형별로 우선 검토합니다.

## 심층 검토

화면의 `심층 검토`를 켜면 공식 출처 검색을 자동으로 사용하고, 확률·책임비율·인정금액·합의 하한선처럼 불확실성이 큰 항목을 보수적/중간/공격적 범위로 나누어 검토하도록 지시합니다. 답변 시간이 길고 API 비용이 늘 수 있으므로 복잡한 사건에서만 사용하는 것을 권장합니다.

## 이미지 첨부

입력창의 `+` 버튼으로 PNG, JPG, WebP, GIF 이미지를 최대 4장까지 첨부할 수 있습니다. 한 장당 8MB 이하를 권장하며, 주민등록번호·계좌번호·연락처처럼 민감한 정보는 가린 뒤 올리는 것이 좋습니다.

## 검색 출처

OpenAI Responses API의 `web_search` 도구를 사용하며 기본 검색 도메인은 다음 공식/공공 법률 출처로 제한합니다.

- `law.go.kr`
- `glaw.scourt.go.kr`
- `scourt.go.kr`
- `moleg.go.kr`
- `easylaw.go.kr`
- `klri.re.kr`

## Gemini 교차검증

`.env`에 `GEMINI_API_KEY`와 `GEMINI_MODEL`을 설정하면 화면의 `Gemini 검토` 토글로 교차검증을 사용할 수 있습니다. `gemini-2.5-pro`는 계정/프로젝트 상태에 따라 무료 티어 쿼터가 없을 수 있으므로, 쿼터 오류가 나면 앱은 기본적으로 `GEMINI_FALLBACK_MODEL`인 `gemini-2.5-flash-lite`로 한 번 더 검토를 시도합니다.

## 주의

이 앱은 법률 정보 정리 보조 도구이며 변호사의 법률 자문을 대체하지 않습니다. 소송 기한, 형사 사건, 큰 금전 손실, 계약 해지, 강제집행 등 중요한 사안은 변호사 상담을 권장하도록 설계되어 있습니다.

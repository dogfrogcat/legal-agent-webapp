# 배포 가이드

이 앱은 Node.js 서버가 정적 UI와 `/api/chat`을 함께 제공합니다. 공개 배포에서 사용자가 직접 회원가입/로그인하게 하려면 Supabase Auth 설정을 권장합니다.

## 회원가입/로그인 설정

Supabase에서 새 프로젝트를 만든 뒤 `Project Settings > API`에서 아래 값을 확인합니다.

- Project URL: `SUPABASE_URL`
- anon public key: `SUPABASE_ANON_KEY`

Authentication 설정에서는 Email provider를 켜고, 배포 주소를 Site URL과 Redirect URLs에 추가합니다. 이메일 확인을 켜두면 사용자가 회원가입 후 확인 메일을 눌러야 로그인됩니다.

Supabase 설정이 있으면 앱은 이메일 회원가입/로그인 모드로 동작합니다. Supabase 설정이 없고 `APP_PASSWORD`만 있으면 공유 비밀번호 모드로 동작합니다.

## 추천: Render

1. GitHub에 이 폴더를 새 저장소로 올립니다.
2. Render에서 `New Web Service`를 만들고 GitHub 저장소를 연결합니다.
3. 설정값을 입력합니다.
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Environment Variables에 아래 값을 넣습니다.

```env
NODE_ENV=production
HOST=0.0.0.0
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
OPENAI_MAX_OUTPUT_TOKENS=12000
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-pro
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
AUTH_SECRET=긴_무작위_문자열
```

Supabase 없이 임시 공유 비밀번호만 쓰려면 `SUPABASE_URL`, `SUPABASE_ANON_KEY`를 빼고 아래 값을 넣습니다.

```env
APP_PASSWORD=친구들에게_공유할_비밀번호
AUTH_SECRET=긴_무작위_문자열
```

Render와 Railway 모두 외부 공개 웹앱은 `0.0.0.0` 호스트와 플랫폼이 제공하는 `PORT` 환경변수에 바인딩해야 합니다. 이 앱은 `PORT`를 자동으로 사용하고, `NODE_ENV=production`이면 기본 호스트를 `0.0.0.0`으로 사용합니다.

## Railway로 배포할 때

1. Railway에서 GitHub 저장소를 연결합니다.
2. Node 프로젝트로 자동 감지되면 Start Command는 `npm start`를 사용합니다.
3. Variables 탭에 Render와 같은 환경변수를 넣습니다.
4. Public Networking에서 도메인을 생성합니다.

## 배포 전 체크리스트

- `.env` 파일은 GitHub에 올리지 않습니다. 이미 `.gitignore`에 포함되어 있습니다.
- `SUPABASE_URL`/`SUPABASE_ANON_KEY` 또는 `APP_PASSWORD` 중 하나는 반드시 설정합니다. 둘 다 없으면 누구나 접속해 API를 사용할 수 있습니다.
- OpenAI/Gemini 결제 한도를 낮게 설정합니다.
- 공개 회원가입을 열면 Supabase Auth의 이메일 확인, Captcha, rate limit 설정을 같이 검토합니다.
- 법률/의료 이미지가 올라올 수 있으므로 민감정보 가림 안내를 유지합니다.

## 상태 확인

배포 후 아래 주소가 JSON을 반환하면 서버가 살아 있습니다.

```txt
https://배포주소/healthz
```

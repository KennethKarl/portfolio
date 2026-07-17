# korea-care3 개발환경 · SEO/GEO 인벤토리 (다른 경로 재사용용)

> 목표 2번: `korea-care3`에 구현된 **개발환경 + SEO/GEO** 자산을 다른 경로(여기선 `korea-care2`)에 그대로 이식할 수 있도록 목록화.
> 사용자에게 보이는 **디자인·화면·콘텐츠는 `global.carebridge.io`** 를 따른다(목표 1번). 아래 항목은 그 위에 얹는 "엔진"이다.

## A. 개발환경 (빌드·런타임 스택)

| # | 자산 | 파일 | 역할 | 재사용 방법 |
|---|------|------|------|------------|
| A1 | Vite + React 18 | `package.json`, `vite.config.js` | 번들러/런타임 | 그대로 복사 |
| A2 | **vite-react-ssg** 정적 프리렌더 | `vite.config.js ssgOptions`, `src/main.jsx` | 라우트별 정적 HTML 생성(SEO 본문 노출) | `ViteReactSSG({routes, basename: BASE_URL})` |
| A3 | **⚠️ `script:"defer"` 고정** | `vite.config.js` | async 시 SSG 해시 `undefined`→manifest 404→하이드레이션 실패. defer 필수 | 반드시 `defer` |
| A4 | `dirStyle:"nested"` 클린 URL | `vite.config.js` | `/path/index.html` → `/path` | 그대로 |
| A5 | base 경로 env 전환 | `vite.config.js base: VITE_BASE` | 루트("/") vs 서브경로("/korea-care2/") | 빌드 시 `VITE_BASE` 주입 |
| A6 | React Router 데이터 라우트 | `src/App.jsx routes` + `getStaticPaths` | 동적 경로 프리렌더 열거 | 라우트 정의 패턴 복사 |
| A7 | 반응형 헬퍼 | `useIsMobile()` | 모바일 분기 | 복사 |
| A8 | 디자인 토큰 중앙화 | `src/theme.js` | SAFE BLUE #1b59fa·Pretendard·그라디언트·pill | 복사(브랜드 동일) |
| A9 | GitHub Pages 워크플로 | `.github/workflows/deploy.yml` | main push→build→deploy-pages, secrets→VITE_* | 복사(아래 D 참고) |

## B. SEO 자산

| # | 자산 | 파일 | 역할 |
|---|------|------|------|
| B1 | per-route 메타 주입 | `src/seo.jsx <Seo>` (vite-react-ssg `Head`) | title/description/canonical/OG/twitter |
| B2 | canonical/OG env 전환 | `src/config.js SITE_URL = VITE_SITE_URL \|\| 프로덕션루트` | 서브경로 프리뷰도 정확한 canonical |
| B3 | 빌드 사이트맵 | `scripts/gen-sitemap.mjs` (dist 스캔, `VITE_SITE_URL` 사용) | `sitemap.xml` 자동 생성·noindex 제외 |
| B4 | robots | `public/robots.txt` | 크롤 허용 + Sitemap 지정 |
| B5 | SPA 폴백 | gen-sitemap이 `404.html`=index 복사 | deep-link 새로고침 대응 |
| B6 | noindex 라우트 | `<Seo noindex>` (mypage/admin 등) | 비공개 페이지 색인 차단 |

## C. GEO (생성형 엔진 노출) 자산

| # | 자산 | 파일 | 역할 |
|---|------|------|------|
| C1 | JSON-LD 빌더 | `src/seo.jsx`: `orgJsonLd`(Organization/MedicalBusiness+WebSite), `procedureJsonLd`(MedicalProcedure), `faqJsonLd`(FAQPage), `breadcrumbJsonLd`(BreadcrumbList) | 구조화 데이터 = GEO 핵심 신호 |
| C2 | AI 크롤러 허용 | `public/robots.txt` (GPTBot·OAI-SearchBot·PerplexityBot·ClaudeBot·Google-Extended) | LLM 인덱싱 허용 |
| C3 | **llms.txt** | `public/llms.txt` | 생성형 엔진용 사이트 요약(브랜드·서비스·핵심 페이지) |
| C4 | 정적 본문 프리렌더 | A2와 동일 | JS 없이도 본문이 HTML에 존재 → 크롤러 가독 |

## D. 연동(환경변수) — 미설정 시 무에러 폴백

| # | 키 | 파일 | 미설정 시 |
|---|----|------|-----------|
| D1 | `VITE_API_BASE` | `config.js`/`api.js` | mock 성공 반환 |
| D2 | `VITE_GA4_ID` / `VITE_META_PIXEL_ID` / `VITE_CLARITY_ID` / `VITE_CHANNEL_PLUGIN_KEY` | `analytics.js` | no-op |
| D3 | `VITE_GOOGLE_CLIENT_ID` | 로그인 | 데모 로그인 폴백 |
| D4 | `VITE_SITE_URL` | `config.js`/`gen-sitemap` | 프로덕션 루트 기본 |
| D5 | `VITE_BASE` | `vite.config.js` | "/" |

## E. 배포 절차 (다른 경로 = korea-care2 적용)

1. 위 A~D 인프라 파일을 새 경로로 복사(콘텐츠 파일 `App.jsx`/`data.js`/`llms.txt`만 global.carebridge.io 콘텐츠로 교체).
2. 빌드: `VITE_BASE=/korea-care2/ VITE_SITE_URL=https://kennethkarl.github.io/korea-care2 npm run build`
3. `dist/`에서 `CNAME` 제거(도메인 충돌 방지) + `.nojekyll` 추가.
4. 대상 public 레포 `main` 루트로 push, Pages source=`main`/`/`.
5. 검증: python http.server로 `/korea-care2/` 서브경로 마운트(GH Pages 패리티) → Playwright headless로 pageerror·404·canonical 확인.

> 핵심 함정: **A3(defer)**, **B2/B3(canonical·sitemap의 VITE_SITE_URL)**, **CNAME 제거**.

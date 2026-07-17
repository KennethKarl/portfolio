# CareBridge Global (korea-care2) — SEO/GEO 구현 요구사항 (개발팀 핸드오프)

> **목적**: 현 프로토타입(`kennethkarl.github.io/korea-care2`)의 **디자인은 그대로 재사용**하되, 개발팀이 화면을 새로 구축할 때 **SEO(검색엔진 최적화) / GEO(생성형 엔진 최적화 — ChatGPT·Perplexity·Claude·Gemini 등 AI 답변엔진 노출)** 신호가 반드시 함께 구현되도록 하기 위한 요구사항 명세.
>
> **⛔ 핵심 원칙 — "화면만 나오는 것 = 실패."** 브라우저에 픽셀이 그려지는 것과, 크롤러·AI 엔진이 **HTML 소스에서** 메타/구조화 데이터를 읽어가는 것은 별개다. 아래 요구사항은 "보이는 화면"이 아니라 **HTML 응답 바디에 무엇이 들어있어야 하는가**를 규정한다.
>
> 기준 구현 위치(참고용): `projects/carebridge/korea-care2/src/{seo.jsx, langs.js, content.js, config.js, analytics.js}`, `public/{llms.txt, robots.txt}`, `scripts/gen-sitemap.mjs`, `vite.config.js`
>
> 대상 도메인(프로덕션 canonical): `https://global.carebridge.io`

---

## 0. 우선순위 요약 (Must / Should)

| 등급 | 요구사항 |
|------|----------|
| **P0 (필수 — 없으면 SEO/GEO 자체가 무효)** | R1 서버 렌더링/프리렌더, R2 페이지별 메타, R3 다국어 hreflang/canonical, R4 JSON-LD, R5 GEO 아티팩트(llms.txt·robots·sitemap) |
| **P1 (강력 권장)** | R6 페이지별 메타 오버라이드(CMS), R7-1 canonical 정책, R7-2 시맨틱 HTML |
| **P2 (개선)** | R7-3 CWV/성능, R7-4 분석 계측, R7-5 이미지 SEO |

---

## R1. 렌더링 — 크롤러가 읽을 수 있는 HTML을 서버가 내려줘야 한다 (P0)

**가장 중요한 요구사항.** SPA가 클라이언트에서 JS로만 그리면, 크롤러/AI 엔진에는 빈 `<div id="root">`만 보인다. 반드시 **각 라우트마다 완성된 HTML(메타·본문·JSON-LD 포함)을 서버가 응답**해야 한다.

- **R1-1.** 모든 공개 라우트는 **SSR 또는 SSG(라우트별 정적 HTML 프리렌더)** 로 제공한다. 현 구현은 `vite-react-ssg`로 라우트별 `index.html`을 빌드타임 생성(`vite.config.js` → `ssgOptions.dirStyle: "nested"`로 클린 URL). 새 스택(Next.js 등)이면 SSR/SSG/ISR 중 무엇이든 **HTML 소스에 head 메타와 본문 텍스트, JSON-LD가 포함**되면 된다.
- **R1-2.** 프리렌더 대상 라우트 목록(현 `PAGE_ROUTES`, App.jsx):
  `/`, `/service`, `/service/health-checkup`, `/service/health-checkup/:id`(패키지별), `/service/revital`, `/service/transportation`, `/service/accommodation`, `/service/tour`, `/service/association`, `/providers`, `/providers/:id`(병원별), `/treatments`, `/treatments/:id`(시술별), `/pricing`, `/company`, `/contact`, `/faq`, `/blog`, `/blog/:id`(글별), `/legal/:doc`(privacy/terms/refund)
- **R1-3. 동적 상세 페이지는 개별 URL로 프리렌더**한다(`getStaticPaths` 상응). 예: 검진 패키지·병원·시술·블로그 글은 각각 자기 URL을 가진 독립 HTML이어야 한다(목록 페이지 하나로 뭉치면 안 됨).
- **R1-4. 비공개/도구 페이지는 프리렌더/색인에서 제외**한다: `/mypage`, `/booking`, `/cart`, `/account`, `/admin`, `/hospital-admin`, `/404`. (sitemap `EXCLUDE`, `noindex`와 일관)
- **R1-5. 하이드레이션 일관성**: 서버 첫 렌더와 클라이언트 첫 렌더 결과가 동일해야 한다(mismatch 금지). CMS 오버라이드는 마운트 후 주입하는 방식으로 첫 HTML은 시드값으로 렌더(현 `content.js` hydrate 패턴 참고).

**인수 기준**: 임의 라우트에 대해 `curl <url>`(JS 미실행)로 받은 HTML 소스에 ① 해당 페이지 고유 `<title>`·`<meta description>`, ② 본문 텍스트, ③ JSON-LD `<script>`가 모두 존재.

---

## R2. 페이지별 메타 태그 — head 관리 (P0)

각 페이지는 **자기만의** title/description 등 head 메타를 가져야 한다(전 페이지 동일 금지). 기준 구현: `src/seo.jsx`의 `<Seo>` 컴포넌트.

페이지 head에 주입되어야 할 태그:

- **R2-1. `<title>`** — 형식 `"{페이지 제목} | CareBridge Global"`, 홈/제목없음 시 폴백 `"CareBridge Global — Healthcare & Health Checkups in Korea"`.
- **R2-2. `<meta name="description">`** — 페이지별 설명, 폴백은 사이트 기본 설명(seo.jsx `DEFAULT_DESC`).
- **R2-3. `<meta name="keywords">`** — CMS 오버라이드가 있을 때만 출력(선택).
- **R2-4. `<link rel="canonical">`** — 현재 언어 기준 자기 URL(절대경로, `SITE_URL` + 언어접두어 반영).
- **R2-5. `<html lang>` / `<html dir>`** — 현재 언어 코드와 방향(ar=rtl 등) 설정.
- **R2-6. Open Graph** — `og:type`(기본 website, 블로그 글은 `article`), `og:title`, `og:description`, `og:url`, `og:site_name`("CareBridge Global"), `og:locale`(en_US/ko_KR/ar_AR/ja_JP), `og:image`(오버라이드 있을 때).
- **R2-7. Twitter Card** — `<meta name="twitter:card" content="summary_large_image">`.
- **R2-8. `<meta name="robots" content="noindex, nofollow">`** — 비공개 페이지(R1-4)와 `/legal/*`, `/account`, `/404`에 출력. 그 외 공개 페이지엔 출력하지 않음.
- **R2-9. 기본 head 고정 태그**(`index.html`): `charset=UTF-8`, `viewport`, `theme-color=#1B59FA`, 폰트 preconnect/stylesheet(Pretendard).

**주의**: title/description은 index.html에 하드코딩하지 말고 **라우트별로 주입**한다(현 구현은 `index.html` 주석대로 `<Seo>`가 주입).

**인수 기준**: 대표 5개 페이지(홈/검진상세/병원목록/FAQ/블로그글) HTML에서 위 태그가 페이지마다 **서로 다른 값**으로 존재.

---

## R3. 다국어 SEO — 언어별 URL · hreflang · canonical (P0)

지원 언어(현 `langs.js` `LANGS`): **en, ko, ar(RTL), ja**. 기본 언어 en.

- **R3-1. 언어별 URL 구조**: en=루트(`/service`), 그 외=경로 접두어(`/ko/service`, `/ar/service`, `/ja/service`). 각 언어 페이지를 **개별 프리렌더**한다(현 `langTree` × `PREFIX_LANGS`).
- **R3-2. hreflang 대체 링크**: 모든 공개 페이지 head에 지원 언어별 `<link rel="alternate" hreflang="{code}" href="{언어별 절대 URL}">` + `<link rel="alternate" hreflang="x-default" href="{en URL}">` 출력.
- **R3-3. canonical은 자기 언어 URL**을 가리킨다(언어별로 canonical이 다름 — R2-4).
- **R3-4. `dir` 속성 + RTL 미러링**: 아랍어 등 RTL 언어는 `<html dir="rtl">`(langs.js `dirOf`). 방향 아이콘(chevron/arrow)은 `scaleX(-1)` 미러링, `tel/email` 입력은 `direction:ltr`로 예외 처리(App.jsx RTL CSS 참고).
- **R3-5. 번역 소스**: en/ko는 데이터에 물리적으로 존재(base), ar/ja는 오버레이(엑셀 `strings.xlsx` 왕복 / override). 새 스택도 **언어 추가가 한 곳(레지스트리) 수정으로 URL·프리렌더·메타에 전파**되는 구조 권장(langs.js `LANGS` 단일 소스 패턴).
- **R3-6. 언어 미보유 필드 폴백**: 특정 언어 번역이 없으면 기본(en) 값으로 폴백하되, hreflang/URL은 유지.

**인수 기준**: `/service`와 `/ko/service` HTML 각각에 4개 언어 + x-default hreflang이 상호 일관되게 존재하고, canonical이 각자 자기 언어 URL.

---

## R4. 구조화 데이터 (JSON-LD / schema.org) — GEO 핵심 신호 (P0)

AI 답변엔진·리치결과가 콘텐츠를 이해하는 핵심. 각 페이지 head에 `<script type="application/ld+json">`로 출력. 기준: `src/seo.jsx` 빌더들.

**페이지 → 스키마 매핑 (필수):**

| 페이지 | JSON-LD |
|--------|---------|
| **홈 `/`** | `@graph`: `Organization` + `MedicalBusiness`(병합, `@id=#org`) — name, url, description, `areaServed`(South Korea/US/Worldwide), `medicalSpecialty`, `knowsAbout` / + `WebSite`(`@id=#website`, publisher=#org) |
| **`/service`, 각 서비스/회사/블로그 목록** | `BreadcrumbList` |
| **`/service/health-checkup`** | `BreadcrumbList` + 패키지별 `MedicalProcedure`(name/description/url/provider=#org) |
| **검진 상세 `/service/health-checkup/:id`** | `BreadcrumbList` + `MedicalProcedure`. **`mri-scan`**는 추가로 `ItemList` of `MedicalProcedure` + `Offer`(price, `priceCurrency:USD`, availability InStock) |
| **`/service/revital`** | `BreadcrumbList` + 시술별 `MedicalProcedure` |
| **병원 목록 `/providers`** | `BreadcrumbList` + `ItemList` of (`Hospital`+`MedicalOrganization`) — 각 병원 `@id`, name, address(PostalAddress, Seoul/KR), `medicalSpecialty`, `aggregateRating`(ratingValue/reviewCount/best5/worst1) |
| **병원 상세 `/providers/:id`** | `BreadcrumbList` + 단일 `Hospital`(주소·평점 포함) |
| **`/faq`** | `FAQPage` — mainEntity[] of `Question`/`acceptedAnswer`(Answer). AI 답변엔진에 특히 중요 |
| **블로그 글 `/blog/:id`** | `BreadcrumbList` (`og:type=article`) |
| **시술 목록/상세 `/treatments`, `/treatments/:id`** | `BreadcrumbList` + `MedicalProcedure` |

- **R4-1.** 위 매핑대로 각 페이지가 지정된 스키마를 **실제 데이터로 채워** 출력한다(더미 금지).
- **R4-2.** 조직/사이트 엔티티는 `@id`로 상호참조(`provider: {@id: .../#org}`)해 그래프 일관성 유지.
- **R4-3.** 가격은 `Offer`(USD), 평점은 `AggregateRating`으로 구조화(있는 페이지 한정). 가격/평점은 화면 표시값과 JSON-LD 값이 **일치**해야 한다(불일치는 스팸 신호).
- **R4-4.** JSON-LD는 페이지 언어와 무관하게 안정적 식별자(@id/영문 name)를 유지하되, description은 언어 반영 가능.

**인수 기준**: [Google Rich Results Test] 또는 schema.org validator에 각 대표 페이지 URL 통과(Organization/FAQPage/ItemList/MedicalProcedure 인식). curl HTML에 해당 `ld+json` 존재.

---

## R5. GEO 아티팩트 — AI 크롤러/답변엔진 대응 (P0)

- **R5-1. `robots.txt`** (`public/robots.txt`): 전체 허용 + **AI/GEO 크롤러 명시 허용** — `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` 각각 `Allow: /`. 하단에 `Sitemap:` 절대 URL.
- **R5-2. `llms.txt`** (`public/llms.txt`): AI 답변엔진용 사이트 요약 문서. **반드시 유지·최신화**. 포함 내용:
  - 사이트 한줄 요약(`>` blockquote)
  - "무엇인가"(인증 컨텍스트: Medical Korea/보건복지부/KHIDI, 결제 흐름)
  - 서비스 카탈로그(검진 패키지·가격 USD, MRI/CT 메뉴·가격, Revital 전문영역)
  - 파트너 병원 목록(이름·지역·평점·리뷰수·전문·인증·언어지원)
  - "Why Korea" 근거 통계
  - Key pages 절대 URL 목록, "How it works" 5단계, 결제/세금환급/언어 notes
  - **주의**: llms.txt의 가격·병원·통계는 실제 사이트 콘텐츠(정책)와 동기화. 콘텐츠 변경 시 함께 갱신되는 프로세스 필요.
- **R5-3. `sitemap.xml`**: **빌드 산출물(실제 프리렌더된 HTML)을 스캔해 자동 생성**(`scripts/gen-sitemap.mjs`). 라우트 데이터가 바뀌어도 실제 결과와 항상 일치. `EXCLUDE`(R1-4) 경로 제외, 홈 priority 1.0 나머지 0.7, changefreq weekly. **수기 관리 금지** — 라우트 누락 위험.
- **R5-4. 404 폴백**(정적 호스팅 시): `dist/404.html`을 index로 복사해 미지정 경로도 SPA 부트(gen-sitemap.mjs 말미). SSR 스택이면 서버 404 처리로 대체.
- **R5-5.** llms.txt/robots.txt/sitemap.xml은 **사이트 루트(`/`)에서 접근 가능**해야 한다(서브경로 배포 시 base 반영).

**인수 기준**: `/robots.txt`·`/llms.txt`·`/sitemap.xml` 200 응답 + 위 내용 포함. sitemap URL 수 = 실제 공개 라우트 수.

---

## R6. 페이지별 메타 오버라이드 (Admin/CMS) (P1)

운영자가 배포 없이 페이지별 SEO 값을 조정하는 기능. 기준: `/admin`의 "SEO/GEO 관리", `content.js`, `seo.jsx` `getSeoOverride`.

- **R6-1. 편집 대상 필드**(경로별): `path`(대상 경로), `title`(언어별), `description`(언어별), `keywords`(언어별), `ogImage`.
- **R6-2. 오버라이드 적용 규칙**: 해당 **언어 값이 있을 때만** 적용, 비어 있으면 기존(코드 기본값) 유지 → **회귀 없음**. (seo.jsx L20-27)
- **R6-3. 경로 매칭**: 앞뒤 슬래시 정규화 후 매칭(`normPath`).
- **R6-4. 저장/발행 흐름**(현 구현): 우선순위 `API 응답 → localStorage(미발행 프리뷰) → 발행된 content.json → SEED`. 백엔드 미연동 시 `content.json`(레포 커밋 정적 파일, 같은 오리진)만으로 동작. API 연동 시 `GET/PUT /v1/content`, `PUT /v1/content/{collection}`.
- **R6-5. 오버라이드는 SSG 정적 HTML에 반영**되어야 실효(런타임 클라이언트 주입만으로는 크롤러가 못 봄). → **발행 시 재빌드 또는 SSR에서 오버라이드 병합**하는 경로 필요. (현 프로토타입은 클라 프리뷰 + content.json 발행 방식; 새 스택은 발행→재빌드 or 서버 병합으로 정적 HTML에 반영할 것)
- **R6-6.** admin 페이지 자체는 `noindex` + sitemap 제외.

**인수 기준**: admin에서 특정 경로 title 오버라이드 후 발행 → 해당 URL의 **정적 HTML** `<title>`이 바뀜.

---

## R7. 기술 SEO / 보조 신호

### R7-1. Canonical·URL 정책 (P1)
- 절대 URL 사용(`SITE_URL` 기준). 배포 환경별 base(`VITE_BASE`)·도메인(`VITE_SITE_URL`)을 env로 주입, canonical/OG/sitemap이 동일 도메인을 가리키도록.
- 클린 URL(트레일링 슬래시 정책 일관), 언어 접두어 규칙 R3-1 준수.

### R7-2. 시맨틱 HTML / 접근성 (P1)
- 페이지당 `<h1>` 1개, 논리적 heading 위계, 랜드마크(`header/nav/main/footer`), 링크는 실제 `<a href>`(JS onClick 전용 금지 — 크롤러 추적).
- 본문 텍스트가 HTML에 실제로 존재(이미지/아이콘에 텍스트 묻지 말 것).

### R7-3. 성능 / Core Web Vitals (P2)
- 폰트 preconnect + 필요한 웨이트만 로드, 이미지 lazy-load/적정 포맷, 스크립트 defer(현 `ssgOptions.script:"defer"`). LCP/CLS/INP 관리.

### R7-4. 분석·계측 (P2)
- env 키가 있을 때만 로드(없으면 no-op): GA4(`VITE_GA4_ID`), Meta Pixel, MS Clarity, ChannelTalk. `typeof window` 가드(SSR 안전). SPA 라우트 전환 시 `page_view` 수동 트래킹. (`analytics.js`)

### R7-5. 이미지 SEO (P2)
- 의미 있는 `alt`, OG 이미지(`og:image`) 페이지별 지정 가능(R6-1 ogImage), 소셜 카드 1200×630 권장.

---

## R8. 페이지별 요구 매트릭스 (요약 체크리스트)

| 라우트 | title/desc | canonical+hreflang | OG/Twitter | JSON-LD | robots |
|--------|:---:|:---:|:---:|:---:|:---:|
| `/` (홈) | ✅ | ✅ | ✅ | Organization+MedicalBusiness+WebSite | index |
| `/service` | ✅ | ✅ | ✅ | BreadcrumbList | index |
| `/service/health-checkup` | ✅ | ✅ | ✅ | Breadcrumb + MedicalProcedure[] | index |
| `/service/health-checkup/:id` | ✅ | ✅ | ✅ | Breadcrumb + MedicalProcedure (+ItemList/Offer for mri-scan) | index |
| `/service/revital` | ✅ | ✅ | ✅ | Breadcrumb + MedicalProcedure[] | index |
| `/service/{transportation,accommodation,tour,association}` | ✅ | ✅ | ✅ | BreadcrumbList | index |
| `/providers` | ✅ | ✅ | ✅ | Breadcrumb + ItemList(Hospital) | index |
| `/providers/:id` | ✅ | ✅ | ✅ | Breadcrumb + Hospital | index |
| `/treatments`, `/treatments/:id` | ✅ | ✅ | ✅ | Breadcrumb + MedicalProcedure | index |
| `/faq` | ✅ | ✅ | ✅ | **FAQPage** | index |
| `/blog`, `/blog/:id` | ✅ | ✅ | ✅(article) | BreadcrumbList | index |
| `/pricing`, `/company`, `/contact` | ✅ | ✅ | ✅ | (Breadcrumb 선택) | index |
| `/legal/{privacy,terms,refund}` | ✅ | — | — | — | **noindex** |
| `/account`, `/mypage`, `/booking`, `/cart` | title만 | — | — | — | **noindex** |
| `/admin`, `/hospital-admin` | — | — | — | — | **noindex + sitemap 제외** |

---

## R9. 전체 인수 기준 (개발 완료 판정)

개발팀은 아래를 **증거와 함께** 통과해야 "SEO/GEO 반영 완료"로 인정:

1. **크롤러 관점 검증**: 임의 공개 URL 5개를 `curl`(JS 미실행)로 받아 title/description/canonical/hreflang/OG/JSON-LD/본문텍스트가 HTML 소스에 존재. (R1·R2·R3·R4)
2. **구조화 데이터**: Google Rich Results Test에서 홈(Organization)·FAQ(FAQPage)·병원목록(ItemList)·검진상세(MedicalProcedure) 인식·오류 0. (R4)
3. **다국어**: en/ko/ar/ja 각 URL 존재 + hreflang 상호일관 + ar RTL. (R3)
4. **GEO 파일**: `/robots.txt`(AI 크롤러 5종 허용)·`/llms.txt`(콘텐츠 동기화)·`/sitemap.xml`(실제 라우트 = URL 목록) 200. (R5)
5. **오버라이드**: admin에서 메타 변경·발행 → 정적 HTML 반영. (R6)
6. **noindex 경계**: 비공개/legal/admin 페이지에 noindex + sitemap 제외 확인. (R1-4·R2-8·R5-3)

---

### 부록. 참고 파일(기준 구현)
- `src/seo.jsx` — `<Seo>` 컴포넌트 + JSON-LD 빌더(org/procedure/providers/scanMenu/faq/breadcrumb)
- `src/langs.js` — 언어 레지스트리·언어별 URL(hreflang/canonical)
- `src/content.js` — CMS 오버라이드 액세스 레이어(SEED→content.json→API→localStorage)
- `src/config.js` — env(SITE_URL/API_BASE/분석키/ADMIN_TOKEN)
- `src/analytics.js` — GA4/Pixel/Clarity/ChannelTalk 로더(env 가드)
- `public/llms.txt`, `public/robots.txt` — GEO 아티팩트
- `scripts/gen-sitemap.mjs` — dist 스캔 sitemap·404 폴백
- `vite.config.js` — vite-react-ssg 프리렌더 설정
- `src/App.jsx` — 라우트 정의(`PAGE_ROUTES`) + 페이지별 `<Seo>` 사용례

# CareBridge Global (korea-care2) — SEO/GEO 구현 검수 체크리스트

> 개발팀이 화면을 새로 구축한 뒤, **SEO/GEO가 실제로 반영됐는지** 항목별로 확인하는 체크리스트.
> 상세 근거·요구사항 배경은 [seo-geo-requirements.md](seo-geo-requirements.md) 참고.
>
> **검증 원칙 — 브라우저 화면이 아니라 "크롤러가 받는 HTML"을 본다.**
> 대부분 항목은 `curl`(JS 미실행) 또는 브라우저 **"페이지 소스 보기"(Ctrl/Cmd+U)**로 확인한다.
> DevTools의 Elements 탭(=JS 실행 후 DOM)은 크롤러 관점과 다르므로 **1차 판정 근거로 쓰지 않는다.**
>
> 표기: ☐ 미확인 · 검증방법(Method) · 판정(Pass 조건)

---

## 0. 검증 환경 준비 (시작 전)

- ☐ **빌드 산출물 확보** — 프로덕션 빌드 결과(정적 HTML 또는 SSR 응답)로 검증. 개발 dev 서버(HMR)가 아님
- ☐ **JS 미실행 소스 확인 수단** — 터미널 `curl -sL <url>` 또는 브라우저 "페이지 소스 보기". (JS 켜진 DOM 아님)
- ☐ **검증 도구 준비** — [Google Rich Results Test](https://search.google.com/test/rich-results), [Schema Markup Validator](https://validator.schema.org/), Lighthouse(SEO 항목)

---

## 1. 렌더링 — 크롤러가 읽을 HTML을 서버가 내려주는가 (P0, 최우선)

**⛔ 이 섹션이 실패하면 아래 모든 SEO/GEO는 무의미하다. 먼저 통과할 것.**

- ☐ **1-1.** 공개 URL을 `curl`로 받았을 때 HTML 소스에 **본문 텍스트가 실제로 들어있다**
  - Method: `curl -sL https://<host>/service | grep -i "checkup\|health"`
  - Pass: 본문 문구가 소스에 존재(빈 `<div id="root">`만 있으면 **실패**)
- ☐ **1-2.** 동적 상세 페이지가 **각각 독립 URL로 렌더**된다 (목록 하나로 뭉치지 않음)
  - 대상: 검진 패키지 `/service/health-checkup/:id`, 병원 `/providers/:id`, 시술 `/treatments/:id`, 블로그 `/blog/:id`
  - Pass: 각 상세 URL의 HTML `<title>`·본문이 항목별로 다름
- ☐ **1-3.** 전 공개 라우트가 프리렌더/SSR된다 (아래 목록 전부)
  - `/`, `/service`, `/service/health-checkup`(+상세), `/service/revital`, `/service/{transportation,accommodation,tour,association}`, `/providers`(+상세), `/treatments`(+상세), `/pricing`, `/company`, `/contact`, `/faq`, `/blog`(+상세), `/legal/{privacy,terms,refund}`
- ☐ **1-4.** 비공개/도구 페이지는 프리렌더/색인 제외: `/mypage`, `/booking`, `/cart`, `/account`, `/admin`, `/hospital-admin`
- ☐ **1-5.** 하이드레이션 mismatch 경고가 콘솔에 없다 (서버=클라 첫 렌더 동일)

---

## 2. 페이지별 메타 태그 (P0)

대표 페이지 5개(홈/검진상세/병원목록/FAQ/블로그글) 각각에 대해 확인. **페이지마다 값이 달라야 함.**

- ☐ **2-1.** `<title>` — `"{페이지제목} | CareBridge Global"` 형식, 페이지마다 고유
- ☐ **2-2.** `<meta name="description">` — 페이지마다 고유한 설명
- ☐ **2-3.** `<link rel="canonical">` — 절대 URL, 현재 언어/경로와 일치
- ☐ **2-4.** `<html lang>` / `<html dir>` — 언어코드·방향 정확(ar=rtl)
- ☐ **2-5. Open Graph** — `og:type`(블로그글은 `article`), `og:title`, `og:description`, `og:url`, `og:site_name="CareBridge Global"`, `og:locale`(en_US/ko_KR/ar_AR/ja_JP)
- ☐ **2-6.** `<meta name="twitter:card" content="summary_large_image">`
- ☐ **2-7.** 기본 head 태그 — `charset=UTF-8`, `viewport`, `theme-color=#1B59FA`
- ☐ **2-8.** title/description이 index.html에 하드코딩되지 않고 **라우트별 주입**됨
- Method: 각 URL 소스에서 `<head>` 태그 확인 · Pass: 5개 페이지 값이 서로 다름

---

## 3. 다국어 SEO (P0)

- ☐ **3-1.** 언어별 URL 존재 — en=루트, `/ko/*`, `/ar/*`, `/ja/*` 각각 프리렌더
  - Method: `curl -sL https://<host>/ko/service` → 200 + 한국어 콘텐츠
- ☐ **3-2.** **hreflang 상호일관** — 모든 공개 페이지 head에 4개 언어 `<link rel="alternate" hreflang>` + `hreflang="x-default"`(en)
  - Pass: `/service`와 `/ko/service`의 hreflang 세트가 서로 동일하게 4+1개
- ☐ **3-3.** canonical이 **자기 언어 URL**을 가리킴 (언어별로 canonical 다름)
- ☐ **3-4.** ar 페이지 `<html dir="rtl">` + 방향 아이콘 미러링/`tel·email` LTR 예외 정상
- ☐ **3-5.** 특정 언어 번역 누락 시 en으로 폴백하되 URL·hreflang은 유지(깨진 페이지 없음)

---

## 4. 구조화 데이터 (JSON-LD) — GEO 핵심 (P0)

각 페이지 소스에 `<script type="application/ld+json">` 존재 + validator 통과.

- ☐ **4-1. 홈 `/`** — `Organization`+`MedicalBusiness`(@id=#org) + `WebSite`(@id=#website), publisher 상호참조
- ☐ **4-2. `/faq`** — `FAQPage`, mainEntity[]에 실제 Q/A 채워짐 *(AI 답변엔진에 특히 중요)*
- ☐ **4-3. `/providers`** — `ItemList` of (`Hospital`+`MedicalOrganization`), 각 병원 address·`aggregateRating`(평점/리뷰수) 포함
- ☐ **4-4. 검진 상세** — `MedicalProcedure`; **`mri-scan`**은 추가로 `ItemList`+`Offer`(price/`priceCurrency:USD`/InStock)
- ☐ **4-5. `/service/revital`, `/treatments/*`** — `MedicalProcedure`
- ☐ **4-6. Breadcrumb** — 상세/하위 페이지에 `BreadcrumbList`
- ☐ **4-7.** JSON-LD의 **가격·평점이 화면 표시값과 일치**(불일치=스팸 신호)
- ☐ **4-8.** Rich Results Test / Schema Validator에서 오류 0
  - Method: 대표 URL을 validator에 입력 · Pass: 스키마 인식 + 오류 없음

---

## 5. GEO 아티팩트 (P0)

- ☐ **5-1. `/robots.txt`** 200 응답 + AI 크롤러 5종 명시 허용
  - `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` 각 `Allow: /`
  - 하단 `Sitemap:` 절대 URL
- ☐ **5-2. `/llms.txt`** 200 응답 + 사이트 요약/서비스·가격/병원목록/Why Korea/Key pages 포함
  - ☐ llms.txt의 가격·병원·통계가 **실제 사이트 콘텐츠와 일치**(오래된 값 아님)
- ☐ **5-3. `/sitemap.xml`** 200 응답, **빌드 산출물 기반 자동 생성**
  - ☐ 등록 URL 수 = 실제 공개 라우트 수 (비공개 경로 제외)
  - ☐ 홈 priority 1.0, 나머지 0.7, changefreq weekly
  - ☐ 수기 관리가 아님(라우트 추가 시 자동 반영)
- ☐ **5-4.** 정적 호스팅 시 `404.html` SPA 폴백 존재 (또는 SSR 404 처리)
- ☐ **5-5.** 위 3개 파일이 서브경로 배포에서도 루트에서 접근 가능(base 반영)

---

## 6. 페이지별 메타 오버라이드 (Admin/CMS) (P1)

- ☐ **6-1.** /admin "SEO/GEO 관리"에서 경로별 title/description/keywords/ogImage(언어별) 편집 가능
- ☐ **6-2.** 오버라이드는 **해당 언어 값이 있을 때만** 적용, 비면 기존값 유지(회귀 없음)
- ☐ **6-3.** admin에서 메타 변경·발행 → 해당 URL의 **정적 HTML `<title>`이 실제로 바뀜**
  - Method: 오버라이드 발행 후 `curl`로 재확인 · Pass: 소스 반영 확인 *(클라 프리뷰만 되고 정적 HTML 미반영이면 실패)*
- ☐ **6-4.** admin 페이지 자체 `noindex` + sitemap 제외

---

## 7. robots / noindex 경계 (P0)

- ☐ **7-1.** 공개 페이지에는 `noindex`가 **없다**
- ☐ **7-2.** 비공개/legal/account/404에 `<meta name="robots" content="noindex, nofollow">` 존재
  - 대상: `/mypage`, `/booking`, `/cart`, `/account`, `/legal/*`, `/admin`, `/hospital-admin`
- ☐ **7-3.** noindex 페이지는 sitemap.xml에 없다

---

## 8. 기술 SEO / 보조 (P1~P2)

- ☐ **8-1.** 페이지당 `<h1>` 1개 + 논리적 heading 위계
- ☐ **8-2.** 링크가 실제 `<a href>` (JS onClick 전용 아님 — 크롤러 추적 가능)
- ☐ **8-3.** 랜드마크 태그 사용(`header/nav/main/footer/article/section`)
- ☐ **8-4.** 이미지 `alt` 텍스트 존재(의미 있는 설명)
- ☐ **8-5.** OG 이미지(`og:image`) 페이지별 지정 가능(권장 1200×630)
- ☐ **8-6. 성능/CWV** — Lighthouse SEO 90+ , LCP/CLS/INP 양호, 폰트 preconnect, 스크립트 defer
- ☐ **8-7. 분석 계측** — env 키 있을 때만 로드(없으면 no-op), SSR 안전(`typeof window` 가드), SPA 라우트 전환 시 `page_view` 트래킹

---

## 9. 최종 판정 (Definition of Done)

아래 **6개 게이트를 증거와 함께** 통과해야 "SEO/GEO 반영 완료":

- ☐ **G1. 크롤러 관점** — 공개 URL 5개 `curl` 결과에 title/description/canonical/hreflang/OG/JSON-LD/본문 존재 → §1·2·3·4
- ☐ **G2. 구조화 데이터** — Rich Results Test에서 홈(Organization)·FAQ(FAQPage)·병원(ItemList)·검진(MedicalProcedure) 오류 0 → §4
- ☐ **G3. 다국어** — en/ko/ar/ja URL + hreflang 일관 + ar RTL → §3
- ☐ **G4. GEO 파일** — robots(AI 5종)·llms.txt(동기화)·sitemap(라우트=URL) 200 → §5
- ☐ **G5. 오버라이드** — admin 발행 → 정적 HTML 반영 → §6
- ☐ **G6. noindex 경계** — 비공개/legal/admin noindex + sitemap 제외 → §7

---

### 빠른 검증 커맨드 모음
```bash
HOST=https://global.carebridge.io

# 1. HTML에 메타/JSON-LD가 실제로 들어있는지 (크롤러 관점)
curl -sL $HOST/faq | grep -o '<title>[^<]*</title>'
curl -sL $HOST/faq | grep -c 'application/ld+json'          # FAQPage 스크립트 개수
curl -sL $HOST/providers | grep -o '"@type":"[^"]*"' | sort -u   # 스키마 타입 목록

# 2. canonical / hreflang
curl -sL $HOST/ko/service | grep -o 'rel="canonical" href="[^"]*"'
curl -sL $HOST/service | grep -o 'hreflang="[^"]*"'         # en/ko/ar/ja/x-default

# 3. GEO 파일
curl -sI $HOST/robots.txt; curl -sI $HOST/llms.txt; curl -sI $HOST/sitemap.xml
curl -sL $HOST/robots.txt | grep -iE 'GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot|Google-Extended'
curl -sL $HOST/sitemap.xml | grep -c '<loc>'               # URL 개수

# 4. noindex 경계
curl -sL $HOST/legal/privacy | grep -o 'name="robots"[^>]*'   # noindex 있어야
curl -sL $HOST/service | grep -o 'name="robots"[^>]*'         # 없어야(공개)
```

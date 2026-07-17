# korea-care2 — Admin 제어 가능 항목 인벤토리

> 목적: https://kennethkarl.github.io/korea-care2 의 **모든 리스트·콘텐츠를 admin 페이지에서 제어**하기 위한 1단계 — 제어 대상 리스트업.
> 기준 소스: `src/data.js`(정적 콘텐츠 13종 export), `src/store.js`(동적 운영 데이터), `src/functional.jsx`·`src/App.jsx`(하드코딩 잔여분).
> 작성일: 2026-06-26 · 상태: 현재 전부 **코드 하드코딩(localStorage mock)** — admin/백엔드 미연동.

---

## 0. 분류 기준

| 등급 | 의미 |
|------|------|
| **CMS** | 콘텐츠/리스트 — admin에서 CRUD 해야 하는 핵심 대상 |
| **CONFIG** | 사이트 설정값(브랜드·환율·라벨) — 단일 폼으로 관리 |
| **OPS** | 운영 데이터(예약·문의) — 트랜잭션, admin은 상태변경/조회 |
| **CODE** | 현재 코드/JSX에 하드코딩 → 외부화(externalize) 선행 필요 |

---

## 1. CMS — 리스트형 콘텐츠 (admin CRUD 핵심)

| # | 항목 | 소스(export) | 화면/경로 | 건수 | 주요 필드 |
|---|------|-------------|-----------|------|-----------|
| 1 | **시술/예약 상품** | `PROCEDURES` | `/treatments`, `/treatments/:id`, 홈 Hero chips | 6 | id, category, dept, recoveryBand, hospital{name,city,square}, name, hero, before, after, summary, duration, recovery, includes[], options[], steps[], prepare[], **listPrice, price** |
| 2 | **파트너 병원** | `PROVIDERS` | `/providers`, `/providers/:id`, 홈 섹션 | 7 | name, image, area, rating, reviews, accreditation[], departments[], languages[], english_support, international_ward, gallery[], blurb |
| 3 | **건강검진 패키지** | `CHECKUP.packages` | 홈, `/service/health-checkup`, `/:id` | 4 | tag, name, price, image, desc, includes[] |
| 4 | **MRI·CT 스캔 메뉴** | `SCAN_MENU.groups[].items` | 검진 상세(Ezra식) | 5 (MRI 3·CT 2) | name, price, time, tag, desc, includes[], note |
| 5 | **MRI·CT "왜" 포인트** | `SCAN_MENU.why.points` | 검진 상세 | 4 | title, desc |
| 6 | **리바이탈 전문영역** | `REVITAL.items` | 홈, `/service/revital` | 7 | id, en/ko, image, lead |
| 7 | **부가 서비스** | `SERVICES` | 홈, `/service`, `/service/*` | 6 | id, en/ko, icon, path, desc (transportation·accommodation·tour·association은 SimpleServicePage 본문) |
| 8 | **FAQ** | `FAQS` | `/faq`, 홈 미리보기 | 6 | cat, q, a |
| 9 | **방문자 후기** | `REVIEWS` | 홈 Reviews | 3 | rating, image, text, author, source, treatment |
| 10 | **블로그 글** | `BLOG` | `/blog`, `/blog/:id` | 3 | date, image, title, excerpt, body |
| 11 | **Why Korea 통계** | `WHY.stats` | 홈, 회사소개 | 3 | big, label, sub |
| 12 | **정부 인증 기관** | `CERTS.orgs` | 홈 Certifications | 3 | mark, sub |
| 13 | **이용 방법 단계** | `JOURNEY.steps` | 홈 Journey | 5 | icon, en/ko |

## 2. CMS — 필터/분류 옵션(셀렉트 소스)

| # | 항목 | 소스 | 용도 | 건수 |
|---|------|------|------|------|
| 14 | 병원 전문영역 | `PROVIDER_DEPTS` | Providers 필터 | 9 |
| 15 | 병원 통역 언어 | `PROVIDER_LANGS` | Providers 필터 | 7 |
| 16 | 회복기간 밴드 | `RECOVERY_BANDS` | 시술 필터 | 3 |
| 17 | 가격 밴드 | `PRICE_BANDS` (functional.jsx) | 시술 필터 | CODE — 외부화 필요 |
| 18 | FAQ 카테고리 | `FAQ_CATS` | FAQ 필터 | 4 |

## 3. CMS — 섹션 카피(헤더/문구 블록)

각 섹션의 eyebrow/title/sub 묶음. 리스트 아님(싱글톤), 다국어(en/ko) 텍스트 편집.

| # | 항목 | 소스 | 필드 |
|---|------|------|------|
| 19 | 히어로 | `HERO` | image, badge, title1, title2, accent, sub, cta1, cta2 |
| 20 | Journey 헤더 | `JOURNEY` (eyebrow/title/sub) | 3 |
| 21 | Checkup 헤더 | `CHECKUP` (eyebrow/title/sub) | 3 |
| 22 | Revital 헤더 | `REVITAL` (eyebrow/title/sub) | 3 |
| 23 | Why Korea 헤더 | `WHY` (title/sub) | 2 |
| 24 | SCAN "why" 헤더 | `SCAN_MENU.why` (title/note) | 2 |
| 25 | 인증 섹션 타이틀 | `CERTS.title` | 1 |

## 4. CONFIG — 사이트 설정값(단일 폼)

| # | 항목 | 소스 | 비고 |
|---|------|------|------|
| 26 | 브랜드 정보 | `BRAND` | name, short, email, ceo, addrEn/Ko, bizNo |
| 27 | 글로벌 네비게이션 | `NAV` | 8 top + Service 하위 7 (라벨·경로·순서) |
| 28 | UI 라벨(i18n) | `UI` | en/ko 각 ~17개 버튼/라벨 카피 |
| 29 | 푸터 | App.jsx `Footer.cols` + legal 링크 + 회사정보 | CODE — 하드코딩, 외부화 필요 |
| 30 | 환율(KRW→USD) | `KRW_PER_USD` | mock. 실서비스는 환율 API 권장(설정으로 수동 override 옵션) |

## 5. OPS — 운영/트랜잭션 데이터 (admin 조회·상태변경)

> 현재 `store.js` localStorage mock. 실서비스는 백엔드 API 필요. admin은 생성보다 **조회·승인·상태전이** 중심.

| # | 항목 | 소스 | admin 동작 |
|---|------|------|-----------|
| 31 | 예약(bookings) | `store.getBookings` | 상태전이(draft→pending→processing→done→visited/cancelled), 취소요청·수정요청 승인 |
| 32 | 예약 상태 정의 | `store.STATUS` | 6종 라벨/색상(en/ko) — CONFIG 성격 |
| 33 | 문의(leads) | `api.submitLead` / InquiryModal | 접수 목록 조회 |
| 34 | 회원 프로필 | `store.getProfile` | 조회(개인정보 — 권한 주의) |

## 6. CODE — 하드코딩 잔여(외부화 선행 작업)

admin 연동 전, 데이터로 빼내야 제어 가능해지는 항목.

| # | 항목 | 위치 | 조치 |
|---|------|------|------|
| 35 | 회사소개 가치 3종 | App.jsx `CompanyPage.values` | data.js로 이전 |
| 36 | 법적 문서 3종(개인정보·약관·환불) | App.jsx `LegalPage` (현재 placeholder) | 본문 콘텐츠화(리치텍스트) |
| 37 | 푸터 컬럼/회사정보 | App.jsx `Footer` | data.js로 이전 |
| 38 | 가격 밴드 | functional.jsx `PRICE_BANDS` | data.js로 이전 |
| 39 | SimpleServicePage 본문 | 교통·숙박·투어·제휴 상세 | 콘텐츠 필드 추가 |

---

## 요약 (제어 대상 규모)

- **CMS 리스트**: 13종 콘텐츠 + 5종 필터옵션 + 7종 섹션카피 = 핵심 편집 대상
- **CONFIG**: 5종(브랜드·네비·라벨·푸터·환율)
- **OPS**: 4종(예약·상태·문의·프로필 — 백엔드 의존)
- **외부화 선행**: 5종 하드코딩 항목

> **이미지**: 거의 모든 CMS 항목이 Unsplash placeholder URL 사용 → admin에 이미지 업로드/URL 입력 필드 필요(병원 gallery는 다중).
> **다국어**: 대부분 `{en, ko}` 객체 → admin 에디터는 항목마다 EN/KO 2-필드 입력 전제.

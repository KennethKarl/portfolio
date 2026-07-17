/* =========================================================================
   langs.js — 지원 언어 레지스트리 (단일 소스 오브 트루스)
   ---------------------------------------------------------------------------
   언어를 추가하려면 여기 LANGS 에 한 줄만 추가하면
   ① 헤더 언어 드롭다운  ② 엑셀(strings.xlsx) 열  ③ /admin 편집 필드
   가 자동으로 그 언어를 반영한다.
     - code : 언어 코드(en/ko/ar/...). tx()·i18n 키의 언어 축
     - label: 드롭다운에 표시할 이름
     - dir  : "ltr" | "rtl" (아랍어 등 우→좌)
   ※ en/ko 는 data.js 시드에 직접 존재(기본 언어). 그 외(ar, 향후 추가분)는
     엑셀/override 로 채우는 "오버레이" 언어다.
   ========================================================================= */
export const LANGS = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "ja", label: "日本語", dir: "ltr" },
];

export const LANG_CODES = LANGS.map((l) => l.code);
export const DEFAULT_LANG = LANGS[0].code;               // "en"
export const BASE_LANGS = ["en", "ko"];                  // data.js 시드에 물리적으로 존재
export const OVERLAY_LANGS = LANG_CODES.filter((c) => !BASE_LANGS.includes(c)); // 엑셀로 채우는 언어

/* ---------------- 런타임 오버라이드 레이어(/admin '언어 관리') ----------------
   LANGS 는 *빌드타임 시드*(라우트·프리렌더·엑셀 열의 계약). 그 위에 admin 이
   발행한 레지스트리(content.json 의 langs)를 얹어 헤더 드롭다운의 *표시명·순서·
   표시여부·방향* 을 재배포 없이 바꾼다. 라우팅은 시드 기준이라 완전 신규 언어는
   재배포가 필요(→ admin 패널에서 경고). ------------------------------------- */
export const SEED_LANGS = LANGS;                         // admin '시드 복원'·신규여부 판별용
export const SEED_CODES = LANG_CODES;                    // 빌드에 프리렌더된 언어 코드
const normLang = (l) => ({ code: String(l.code || "").trim(), label: (l.label ?? l.code) || "", dir: l.dir === "rtl" ? "rtl" : "ltr", enabled: l.enabled !== false });
let _active = LANGS.map(normLang);                       // 현재 유효 레지스트리(기본=시드)

export function applyLangs(list) {
  _active = Array.isArray(list) && list.length ? list.filter((l) => l && l.code).map(normLang) : LANGS.map(normLang);
}
export function getLangs() { return _active; }           // 전체(비활성 포함) — admin 표시용
export function getEnabledLangs() { return _active.filter((l) => l.enabled !== false); } // 드롭다운용

export const dirOf = (code) => (_active.find((l) => l.code === code)?.dir || "ltr");
export const labelOf = (code) => (_active.find((l) => l.code === code)?.label || code);

/* ---------------- 언어별 URL(SEO) ----------------
   en = 루트, 그 외는 URL 접두어(/ko /ar /ja). 각 언어를 빌드타임 프리렌더. */
export const PREFIX_LANGS = LANG_CODES.filter((c) => c !== "en");

// 경로의 첫 세그먼트로 현재 언어 판별
export function langFromPath(pathname) {
  const seg = (pathname || "/").split("/")[1];
  return PREFIX_LANGS.includes(seg) ? seg : "en";
}
// 언어 접두어 제거 → 기본 경로
export function stripLang(pathname) {
  const seg = (pathname || "/").split("/")[1];
  if (PREFIX_LANGS.includes(seg)) return pathname.slice(seg.length + 1) || "/";
  return pathname || "/";
}
// 기본 경로 + 언어 → 언어별 경로 (en 은 그대로, 쿼리 보존)
export function withLang(path, lang) {
  if (typeof path !== "string" || !path.startsWith("/")) return path; // navigate(-1) 등 통과
  if (!lang || lang === "en") return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

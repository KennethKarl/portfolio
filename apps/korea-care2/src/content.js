/* =========================================================================
   content.js — 콘텐츠 액세스 레이어 (admin 제어 대상 CMS 컬렉션)
   ---------------------------------------------------------------------------
   data.js 의 정적 export 는 *시드(기본값)·스키마 계약* 으로 남고, 실제 노출
   콘텐츠는 이 레이어를 통해 읽는다. 우선순위:
       메모리 캐시(API 응답) → localStorage 오버라이드(admin 프리뷰) → SEED
   - 백엔드 미연동(VITE_API_BASE 미설정): SEED/localStorage 폴백으로 무에러 동작.
   - SSG/하이드레이션 안전: 모듈 로드 시 캐시는 비어 있고 getCollection 은 SEED 를
     동기 반환한다. 클라이언트 마운트 후 hydrateContent() 가 localStorage·API 를
     캐시에 채우고 이벤트를 발행 → 서버/클라 첫 렌더가 동일(SEED)해 mismatch 없음.
   store.js 의 read/write/useStore(이벤트 리렌더) 패턴과 동형.
   ========================================================================= */
import { useEffect, useState } from "react";
import { API_BASE } from "./config.js";
import { applyLangs, getLangs, SEED_LANGS } from "./langs.js";
import {
  PROCEDURES, PROVIDERS, CHECKUP, SCAN_MENU, REVITAL, SERVICES,
  FAQS, REVIEWS, BLOG, WHY, CERTS, JOURNEY, CHANNELS, PROMOS, PRICING, SEO_OVERRIDES, SEED_VERSION,
} from "./data.js";

const LS_KEY = "kc2_content";
const LS_VER = "kc2_content_ver";   // 저장된 오버라이드가 어떤 시드 버전에서 만들어졌는지
const EVENT = "kc2content";
const has = () => typeof window !== "undefined";

/* ---------------- 시드(기본값) — data.js 원본 export 그대로 ---------------- */
export const SEED = {
  procedures: PROCEDURES,
  providers: PROVIDERS,
  checkup: CHECKUP,
  scanMenu: SCAN_MENU,
  revital: REVITAL,
  services: SERVICES,
  faqs: FAQS,
  reviews: REVIEWS,
  blog: BLOG,
  why: WHY,
  certs: CERTS,
  journey: JOURNEY,
  channels: CHANNELS,
  promos: PROMOS,
  pricing: PRICING,
  seo: SEO_OVERRIDES,
};

/* SEO 오버라이드 조회 (seo.jsx) — path 정규화 후 매칭. 없으면 null. */
const normPath = (p) => "/" + String(p == null ? "/" : p).replace(/^\/+|\/+$/g, "");
export function getSeoOverride(path) {
  const list = getCollection("seo");
  if (!Array.isArray(list)) return null;
  const target = normPath(path);
  return list.find((s) => s && normPath(s.path) === target) || null;
}

/* ---------------- 컬렉션 메타 (admin UI·리스트 추출용) ----------------
   listPath: 편집 대상 배열의 위치. null → export 자체가 배열.
             문자열 → export 객체의 해당 키가 배열(나머지 헤더 필드는 보존).
   idField : 항목 식별자(없으면 인덱스 사용).
   title   : 리스트에 표기할 대표 필드 경로(i18n 객체면 tx 로 표시). ----------- */
export const COLLECTIONS = [
  { key: "procedures", label: { en: "Treatments", ko: "시술/예약" }, listPath: null, idField: "id", title: "name" },
  { key: "providers", label: { en: "Providers", ko: "파트너 병원" }, listPath: null, idField: "id", title: "name" },
  { key: "checkup", label: { en: "Check-up packages", ko: "건강검진 패키지" }, listPath: "packages", idField: "id", title: "name" },
  { key: "scanMenu", label: { en: "MRI·CT scan menu", ko: "MRI·CT 스캔 메뉴" }, listPath: "groups", idField: "id", title: "label" },
  { key: "revital", label: { en: "Revital specialties", ko: "리바이탈 전문영역" }, listPath: "items", idField: "id", title: "en" },
  { key: "services", label: { en: "Add-on services", ko: "부가 서비스" }, listPath: null, idField: "id", title: "en" },
  { key: "faqs", label: { en: "FAQ", ko: "FAQ" }, listPath: null, idField: null, title: "q" },
  { key: "reviews", label: { en: "Reviews", ko: "방문자 후기" }, listPath: null, idField: "id", title: "author" },
  { key: "why", label: { en: "Why-Korea stats", ko: "Why Korea 통계" }, listPath: "stats", idField: null, title: "big" },
  { key: "certs", label: { en: "Certifications", ko: "정부 인증" }, listPath: "orgs", idField: null, title: "mark" },
  { key: "journey", label: { en: "Journey steps", ko: "이용 방법 단계" }, listPath: "steps", idField: null, title: "en" },
  { key: "channels", label: { en: "Consultation channels", ko: "상담 채널" }, listPath: null, idField: "id", title: "type" },
  { key: "promos", label: { en: "Promotions & banners", ko: "프로모션·배너" }, listPath: null, idField: "id", title: "id" },
  { key: "pricing", label: { en: "Pricing table", ko: "가격/견적" }, listPath: "rows", idField: "id", title: "name" },
];

const META = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c]));

/* ---------------- 캐시 (클라 런타임 오버라이드) ----------------
   첫 렌더(SSR·하이드레이션)는 비어 있음 → SEED 반환. hydrateContent 후 채워짐. */
let cache = {};

function emit() { if (has()) window.dispatchEvent(new Event(EVENT)); }

function readLS() {
  if (!has()) return {};
  try { const v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : {}; } catch { return {}; }
}
function writeLS(obj) {
  if (!has()) return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
    localStorage.setItem(LS_VER, SEED_VERSION);   // 현재 시드 버전으로 스탬프
  } catch { /* quota/private mode */ }
}

/* ---------------- 읽기 API (소비처에서 사용) ----------------
   getCollection(key) → 해당 export 의 현재 값(배열 또는 객체) 전체. */
export function getCollection(key) {
  return key in cache ? cache[key] : SEED[key];
}

/* admin 용: 편집 대상 배열만 추출 / 재구성 */
export function getList(key) {
  const meta = META[key];
  const val = getCollection(key);
  if (!meta || !meta.listPath) return Array.isArray(val) ? val : [];
  return Array.isArray(val?.[meta.listPath]) ? val[meta.listPath] : [];
}
function rebuild(key, list) {
  const meta = META[key];
  if (!meta || !meta.listPath) return list;               // export 자체가 배열
  return { ...SEED[key], ...getCollection(key), [meta.listPath]: list }; // 헤더 보존
}

/* ---------------- 리렌더 훅 (store.useStore 동형) ---------------- */
export function useContent() {
  const [, set] = useState(0);
  useEffect(() => {
    const on = () => set((n) => n + 1);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return null;
}

/* ---------------- 하이드레이션 (클라 마운트 후 1회) ----------------
   우선순위(낮음→높음): SEED → 발행본 content.json → API(선택) → localStorage 오버라이드.
   - content.json: admin '발행' 으로 레포에 커밋된 정적 파일(같은 오리진 → CORS·도메인 불필요).
   - localStorage: admin 의 로컬 미발행 편집(본인 브라우저). 항상 최상위로 덮어써 즉시 프리뷰.
   모두 없거나 실패해도 SEED 로 동작. */
let hydrated = false;
export async function hydrateContent() {
  if (!has() || hydrated) return;
  hydrated = true;
  // 1) 발행된 정적 content.json (같은 오리진, 도메인/백엔드 불필요)
  try {
    const base = import.meta.env.BASE_URL || "/";
    const res = await fetch(`${base}content.json`, { headers: { Accept: "application/json" }, cache: "no-cache" });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        for (const key of Object.keys(SEED)) if (key in data && data[key] != null) cache[key] = data[key];
        if (Array.isArray(data.langs)) cache.langs = data.langs;      // 언어 레지스트리(특수 키)
      }
    }
  } catch { /* 없으면 시드 유지 */ }
  // 2) API (선택 — VITE_API_BASE 설정 시에만)
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/v1/content`, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") { for (const key of Object.keys(SEED)) if (key in data && data[key] != null) cache[key] = data[key]; if (Array.isArray(data.langs)) cache.langs = data.langs; }
      }
    } catch { /* 폴백 유지 */ }
  }
  // 3) localStorage 오버라이드(admin 로컬 미발행 편집) — 최상위.
  //    단, 시드 버전이 바뀌었으면(=신규 배포) 옛 오버라이드는 폐기해 신규 시드가 우선하게 한다.
  //    (버전 없는 과거 오버라이드도 스테일로 간주 → 자동 정리)
  let ls = {};
  const storedVer = has() ? (() => { try { return localStorage.getItem(LS_VER); } catch { return null; } })() : null;
  if (storedVer === SEED_VERSION) {
    ls = readLS();
  } else if (has()) {
    try { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_VER); } catch { /* private mode */ }
  }
  if (ls && typeof ls === "object") cache = { ...cache, ...ls };
  if (Array.isArray(cache.langs)) applyLangs(cache.langs);            // 언어 레지스트리 반영
  emit();
}

/* admin '발행/다운로드' 용 — 12 컬렉션 + 언어 레지스트리를 현재 값으로 직렬화 */
export function exportContent() {
  const out = {};
  for (const key of Object.keys(SEED)) out[key] = getCollection(key);
  out.langs = getLangsSetting();                    // 언어 레지스트리(특수 키)
  return out;
}

/* ---------------- 언어 레지스트리(특수 키) — /admin '언어 관리' ----------------
   컬렉션(배열 12종)과 달리 langs 는 앱 전역 설정. langs.js 의 런타임 레이어와
   연결(applyLangs). 저장·발행 흐름은 컬렉션과 동일(localStorage→content.json). */
export function getLangsSetting() {
  return Array.isArray(cache.langs) && cache.langs.length ? cache.langs : getLangs();
}
export async function saveLangs(list) {
  cache.langs = list;
  applyLangs(list);
  const ls = readLS(); ls.langs = list; writeLS(ls);
  emit();
  if (!API_BASE) return { ok: true, mock: true };
  const { put } = await import("./api.js");
  return put(`/v1/content/langs`, list);
}
export function resetLangs() {
  delete cache.langs;
  applyLangs(SEED_LANGS);
  const ls = readLS(); delete ls.langs; writeLS(ls);
  emit();
}

/* admin: 모든 로컬 오버라이드 비우기(발행본/시드 상태로 환원) */
export function clearLocalOverrides() {
  cache = {};
  applyLangs(SEED_LANGS);
  writeLS({});
  emit();
}

/* ---------------- 쓰기 API (admin 전용) ----------------
   편집한 배열을 전체 export 값으로 재구성 → localStorage 즉시 반영(프리뷰)
   + API_BASE 설정 시 PUT 영속화. */
export async function saveCollection(key, list) {
  const value = rebuild(key, list);
  cache[key] = value;
  const ls = readLS(); ls[key] = value; writeLS(ls);
  emit();
  if (!API_BASE) return { ok: true, mock: true };
  const { put } = await import("./api.js");
  return put(`/v1/content/${key}`, value);
}

/* admin: 오버라이드 초기화(시드 복원) */
export function resetCollection(key) {
  delete cache[key];
  const ls = readLS(); delete ls[key]; writeLS(ls);
  emit();
}

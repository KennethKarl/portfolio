/* =========================================================================
   api.js — 케어브릿지 백엔드 연동 클라이언트
   VITE_API_BASE 미설정 시 mock 성공을 반환해 정적 프로토타입 UX 를 유지한다.
   엔드포인트/스키마는 docs/SERVER-REQUEST.md 와 일치시킨다.
   ========================================================================= */
import { API_BASE, ADMIN_TOKEN } from "./config.js";

// admin 쓰기 요청 인증 헤더. 백엔드 인증 연동 시 세션/JWT 로 교체(계약 지점).
const authHeaders = () => (ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {});

async function post(path, body) {
  if (!API_BASE) {
    // 백엔드 미연동: 모의 성공 (개발부 서버 준비 전 폴백)
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true, mock: true };
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json().catch(() => ({ ok: true }));
}

/** GET — 미연동 시 null(호출부가 폴백 처리) */
async function get(path) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** PUT (admin 쓰기) — 미연동 시 모의 성공 */
async function put(path, body) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 200));
    return { ok: true, mock: true };
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json().catch(() => ({ ok: true }));
}

export { get, put };

/** 상담/문의 리드 (Contact 폼) */
export const submitLead = (data) => post("/v1/leads", data);

/** 예약 신청 (Reservation 폼) */
export const submitReservation = (data) => post("/v1/reservations", data);

/* -------------------------------------------------------------------------
   Admin 운영 조회 (예약관리 · 리드 Inbox · 유치 분석)
   서버 미연동(API_BASE 미설정) 시 get() 이 null → 호출부가 샘플 데이터로 폴백.
   서버 연동 시 아래 스키마로 응답하면 admin 이 실데이터로 자동 전환된다.
   ------------------------------------------------------------------------- */
/** 예약 목록 — [{ no, status, treatmentName, hospital, customer, dates, party, amount, coordinator, createdAt, memo }] */
export const listReservations = (query = "") => get(`/v1/reservations${query}`);
/** 예약 상태 변경 (admin) */
export const updateReservation = (no, patch) => put(`/v1/reservations/${no}`, patch);
/** 리드/문의 목록 — [{ id, name, email, phone, category, message, source, market, status, owner, createdAt }] */
export const listLeads = (query = "") => get(`/v1/leads${query}`);
/** 리드 상태 변경 (admin) */
export const updateLead = (id, patch) => put(`/v1/leads/${id}`, patch);
/** 유치 분석 집계 — { kpis, funnel, sources, markets, trend, topTreatments } */
export const getAcquisitionAnalytics = (query = "") => get(`/v1/analytics/acquisition${query}`);

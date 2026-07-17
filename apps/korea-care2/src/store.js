/* =========================================================================
   store.js — 정적 프로토타입 상태 (localStorage)
   ⚠️ 실제 서비스는 인증/예약/정산을 백엔드 API로 처리해야 함. 여기서는 mock.
   예약 상태 흐름(Figma): 작성중(draft) → 예약대기(pending) → 예약진행중(processing,
   어드민만 변경) → 예약완료(done) → 방문완료(visited) / 예약취소(cancelled).
   고객은 상태를 직접 변경할 수 없음(취소는 케어브릿지에 요청).
   ========================================================================= */
import { useEffect, useState } from "react";

const K = { user: "kc2_user", profile: "kc2_profile", cart: "kc2_cart", bookings: "kc2_bookings" };
const has = () => typeof window !== "undefined";

function read(key, fallback) {
  if (!has()) return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write(key, val) {
  if (!has()) return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("kc2store"));
}

/* 컴포넌트 리렌더용 — store 변경 시 +1 */
export function useStore() {
  const [, set] = useState(0);
  useEffect(() => {
    const on = () => set((n) => n + 1);
    window.addEventListener("kc2store", on);
    return () => window.removeEventListener("kc2store", on);
  }, []);
  return null;
}

/* ---------------- auth / profile ---------------- */
export const getUser = () => read(K.user, null);
export const getProfile = () => read(K.profile, null);
export function login(user) {
  write(K.user, user);
  if (!getProfile()) {
    const parts = String(user.name || "").trim().split(/\s+/).filter(Boolean);
    write(K.profile, {
      fullName: user.name || "",
      firstName: parts[0] || "", middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "", lastName: parts.length > 1 ? parts[parts.length - 1] : "",
      email: user.email || "", phone: "", countryCode: "+1",
      dob: "", gender: "", interpreter: "", nationality: "",
      passportNo: "", passportFile: "", referralCode: user.referralCode || "",
      history: "", meds: "", allergy: "",
    });
  }
}
export function logout() { write(K.user, null); }
export function saveProfile(p) { write(K.profile, { ...getProfile(), ...p }); }

// 회원가입: 로그인은 하지 않고 프로필만 저장(최초 로그인 시 고객정보 탭으로 유도).
// 데모: 자격증명은 백엔드가 없어 프로필만 보관. write 한 번이라 login 시 profile 보존됨.
export function register(reg) {
  write(K.profile, {
    fullName: [reg.firstName, reg.middleName, reg.lastName].filter(Boolean).join(" "),
    firstName: reg.firstName || "", middleName: reg.middleName || "", lastName: reg.lastName || "",
    email: reg.email || "", phone: reg.phone || "", countryCode: reg.countryCode || "+1",
    dob: "", gender: "", interpreter: "", nationality: "",
    passportNo: "", passportFile: "", referralCode: reg.referralCode || "",
    history: "", meds: "", allergy: "",
  });
}

/* ---------------- cart ----------------
   장바구니 항목: { procedureId, qty?, wanted? }
   - qty(예약 필요 인원수)는 사용자가 직접 입력 — 미입력 시 undefined(빈칸)
   - wanted(예약 신청 희망): 체크박스. qty가 있어야만 체크 가능, qty 비우면 자동 해제
   - 예약신청 페이지로는 wanted 항목만 넘어감 */
export const getCart = () => read(K.cart, []);
export function addToCart(procedureId, qty) {
  const cart = getCart();
  const ex = cart.find((c) => c.procedureId === procedureId);
  if (ex) { if (qty != null) ex.qty = (ex.qty || 0) + qty; }
  else cart.push(qty != null ? { procedureId, qty } : { procedureId });
  write(K.cart, cart);
}
export const inCart = (procedureId) => getCart().some((c) => c.procedureId === procedureId);
export function setCartQty(procedureId, qty) {
  const empty = qty === "" || qty == null;
  const cart = getCart().map((c) => (c.procedureId === procedureId
    ? { ...c, qty: empty ? undefined : Math.max(1, qty), wanted: empty ? false : c.wanted }
    : c));
  write(K.cart, cart);
}
export function setCartWanted(procedureId, wanted) {
  const cart = getCart().map((c) => (c.procedureId === procedureId ? { ...c, wanted } : c));
  write(K.cart, cart);
}
export function removeFromCart(procedureId) { write(K.cart, getCart().filter((c) => c.procedureId !== procedureId)); }
export function clearCart() { write(K.cart, []); }

/* ---------------- bookings ---------------- */
export const getBookings = () => read(K.bookings, []);
let _seq = 0;
function newId() { _seq += 1; return "bk_" + (getBookings().length + _seq) + "_" + (has() ? String(Date.parse(getProfile()?.email || "") || getBookings().length) : "0").slice(-4); }

// 예약 생성/임시저장. status: "draft" | "pending"
export function upsertBooking(b) {
  const list = getBookings();
  const id = b.id || ("bk" + (list.length + 1) + "x" + (list.reduce((s, x) => s + (x.id?.length || 0), 0)));
  const idx = list.findIndex((x) => x.id === id);
  const rec = { ...b, id, updatedAt: "now" };
  if (idx >= 0) list[idx] = rec; else list.unshift(rec);
  write(K.bookings, list);
  return id;
}
export const getBooking = (id) => getBookings().find((b) => b.id === id);
export function requestCancel(id) {
  // 고객은 직접 취소 불가 — "케어브릿지에 취소 요청" 플래그만 (어드민이 처리)
  const list = getBookings().map((b) => (b.id === id ? { ...b, cancelRequested: true } : b));
  write(K.bookings, list);
}
// 고객 수정 요청 — 즉시 반영 금지(어드민 승인 절차). 요청 내용만 보관.
export function requestEdit(id, changes) {
  const list = getBookings().map((b) => (b.id === id ? { ...b, editRequested: true, editRequest: { ...changes, at: "now" } } : b));
  write(K.bookings, list);
}
// 후기 남기기(방문완료) — 프로토타입: 플래그만 저장
export function leaveReview(id) {
  const list = getBookings().map((b) => (b.id === id ? { ...b, reviewed: true } : b));
  write(K.bookings, list);
}
// 예약번호 생성 (제출 시) — SD + 연도 + 6자리
export function genBookingNo() {
  const now = has() ? Date.now() : 0;
  const year = has() ? new Date().getFullYear() : 2026;
  return `SD${year}-${String(now).slice(-6)}`;
}

export const STATUS = {
  draft: { en: "Draft", ko: "작성중", color: "#6f7a90" },
  pending: { en: "Pending", ko: "예약대기", color: "#f5a623" },
  processing: { en: "In progress", ko: "예약진행중", color: "#1b59fa" },
  done: { en: "Confirmed", ko: "예약완료", color: "#1a9e5c" },
  visited: { en: "Visited", ko: "방문완료", color: "#6f7a90" },
  cancelled: { en: "Cancelled", ko: "예약취소", color: "#e5484d" },
};

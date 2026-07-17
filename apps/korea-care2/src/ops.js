/* =========================================================================
   ops.js — admin 운영(OPS) 데모 데이터 · 상태 헬퍼 (localStorage mock)
   ⚠️ 프로토타입: 실서비스는 예약·문의·회원을 백엔드 API + DB 로 처리해야 함.
   여기서는 admin '운영' 화면 데모용 시드 데이터를 브라우저에 심고 조회·상태변경만
   구현한다. 고객 플로우의 store.js(kc2_bookings 등)와 키를 분리(kc2_ops_*)해 충돌 방지.
   상태 흐름(store.js STATUS 재사용): draft→pending→processing→done→visited/cancelled.
   ========================================================================= */
import { useEffect, useState } from "react";

const has = () => typeof window !== "undefined";
const K = {
  bookings: "kc2_ops_bookings",
  leads: "kc2_ops_leads",
  members: "kc2_ops_members",
  reviews: "kc2_ops_reviews",
  messages: "kc2_ops_messages",
  settlements: "kc2_ops_settlements",
  seeded: "kc2_ops_seeded_v2",
};

function read(key, fb) {
  if (!has()) return fb;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
function write(key, val) {
  if (!has()) return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("kc2store"));
}

/* 리렌더 훅 — store.js 와 동일한 "kc2store" 이벤트 구독 */
export function useOps() {
  const [, set] = useState(0);
  useEffect(() => {
    const on = () => set((n) => n + 1);
    window.addEventListener("kc2store", on);
    return () => window.removeEventListener("kc2store", on);
  }, []);
}

/* ---------------- SEED (데모 데이터) ---------------- */
const MEMBERS = [
  { id: "m1", fullName: "Ahmed Al-Farsi", email: "ahmed.f@example.ae", phone: "50 123 4567", countryCode: "+971", nationality: "United Arab Emirates", dob: "1986-04-12", gender: "M", interpreter: "Arabic", passportNo: "N1234567", referralCode: "GULF10", history: "Hypertension", meds: "Amlodipine 5mg", allergy: "Penicillin", joinedAt: "2026-05-30" },
  { id: "m2", fullName: "Sofia Petrova", email: "sofia.p@example.ru", phone: "912 345 6789", countryCode: "+7", nationality: "Russia", dob: "1991-09-03", gender: "F", interpreter: "Russian", passportNo: "72 3456789", referralCode: "", history: "-", meds: "-", allergy: "-", joinedAt: "2026-06-05" },
  { id: "m3", fullName: "John Miller", email: "j.miller@example.com", phone: "202 555 0143", countryCode: "+1", nationality: "United States", dob: "1979-01-22", gender: "M", interpreter: "", passportNo: "51899223", referralCode: "US-REF", history: "-", meds: "-", allergy: "Latex", joinedAt: "2026-06-10" },
  { id: "m4", fullName: "Yuki Tanaka", email: "yuki.t@example.jp", phone: "80 1234 5678", countryCode: "+81", nationality: "Japan", dob: "1994-11-17", gender: "F", interpreter: "Japanese", passportNo: "TK4455667", referralCode: "", history: "-", meds: "-", allergy: "-", joinedAt: "2026-06-18" },
  { id: "m5", fullName: "Linh Nguyen", email: "linh.n@example.vn", phone: "90 123 4567", countryCode: "+84", nationality: "Vietnam", dob: "1997-07-08", gender: "F", interpreter: "Vietnamese", passportNo: "C8091234", referralCode: "VN-SNS", history: "-", meds: "-", allergy: "-", joinedAt: "2026-06-22" },
  { id: "m6", fullName: "Fatima Zahra", email: "fatima.z@example.sa", phone: "55 987 6543", countryCode: "+966", nationality: "Saudi Arabia", dob: "1989-02-25", gender: "F", interpreter: "Arabic", passportNo: "S6677889", referralCode: "GULF10", history: "Asthma", meds: "Ventolin PRN", allergy: "Aspirin", joinedAt: "2026-06-25" },
];

const BOOKINGS = [
  { id: "b1", no: "SD2026-100231", memberId: "m1", procedure: "SMILE LASIK", hospital: "강남서울밝은안과", city: "서울 강남", date: "2026-07-14", qty: 1, priceUsd: 2000, status: "pending", createdAt: "2026-06-30", cancelRequested: false, editRequested: false, editRequest: null, payStatus: "unpaid", payMethod: "-", paidAt: "" },
  { id: "b2", no: "SD2026-100230", memberId: "m2", procedure: "종합 건강검진", hospital: "한강메디컬센터", city: "서울 강남", date: "2026-07-09", qty: 2, priceUsd: 600, status: "processing", createdAt: "2026-06-29", cancelRequested: false, editRequested: false, editRequest: null, payStatus: "paid", payMethod: "Card", paidAt: "2026-06-29" },
  { id: "b3", no: "SD2026-100229", memberId: "m3", procedure: "임플란트", hospital: "압구정 프리미엄 치과", city: "서울 강남", date: "2026-07-21", qty: 2, priceUsd: 1800, status: "done", createdAt: "2026-06-27", cancelRequested: false, editRequested: true, editRequest: { summary: "방문일 변경 요청: 2026-07-21 → 2026-07-28", patch: { date: "2026-07-28" } }, payStatus: "paid", payMethod: "Card", paidAt: "2026-06-27" },
  { id: "b4", no: "SD2026-100228", memberId: "m4", procedure: "전신 MRI", hospital: "송파의료원", city: "서울 송파", date: "2026-07-05", qty: 1, priceUsd: 2000, status: "done", createdAt: "2026-06-26", cancelRequested: false, editRequested: false, editRequest: null, payStatus: "paid", payMethod: "Wire", paidAt: "2026-06-26" },
  { id: "b5", no: "SD2026-100227", memberId: "m5", procedure: "모발이식(FUE)", hospital: "압구정라인성형외과", city: "서울 강남", date: "2026-06-24", qty: 1, priceUsd: 3200, status: "visited", createdAt: "2026-06-15", cancelRequested: false, editRequested: false, editRequest: null, reviewed: true, payStatus: "paid", payMethod: "Card", paidAt: "2026-06-15" },
  { id: "b6", no: "SD2026-100226", memberId: "m6", procedure: "피부 재생 레이저", hospital: "한강메디컬센터", city: "서울 강남", date: "2026-07-11", qty: 1, priceUsd: 250, status: "pending", createdAt: "2026-06-30", cancelRequested: true, editRequested: false, editRequest: null, payStatus: "paid", payMethod: "Card", paidAt: "2026-06-30" },
  { id: "b7", no: "SD2026-100225", memberId: "m1", procedure: "심장 CT 스캔", hospital: "서초성심병원", city: "서울 서초", date: "", qty: 1, priceUsd: 349, status: "draft", createdAt: "2026-07-01", cancelRequested: false, editRequested: false, editRequest: null, payStatus: "unpaid", payMethod: "-", paidAt: "" },
  { id: "b8", no: "SD2026-100224", memberId: "m3", procedure: "전신 MRI", hospital: "신촌대학교병원", city: "서울 서대문", date: "2026-06-20", qty: 1, priceUsd: 2000, status: "cancelled", createdAt: "2026-06-12", cancelRequested: false, editRequested: false, editRequest: null, payStatus: "refunded", payMethod: "Card", paidAt: "2026-06-12" },
];

/* 결제 상태 정의 */
export const PAY_STATUS = {
  paid: { ko: "결제완료", color: "#1a9e5c" },
  unpaid: { ko: "미결제", color: "#f5a623" },
  partial: { ko: "부분결제", color: "#1b59fa" },
  refunded: { ko: "환불", color: "#e5484d" },
};
export const COMMISSION = 0.15;   // 플랫폼 수수료율 (병원 정산 시 차감)
export const amountOf = (b) => (b.priceUsd || 0) * (b.qty || 1);

/* 리뷰(방문완료 고객 후기 — 모더레이션 큐) */
const REVIEWS = [
  { id: "r1", memberId: "m5", procedure: "모발이식(FUE)", hospital: "압구정라인성형외과", rating: 5, text: "Great result and the coordinator handled everything — pickup, hotel, translation. Highly recommend.", status: "pending", createdAt: "2026-06-26" },
  { id: "r2", memberId: "m4", procedure: "전신 MRI", hospital: "송파의료원", rating: 4, text: "빠르고 깔끔했어요. 리포트 영어 번역까지 챙겨주셔서 좋았습니다.", status: "pending", createdAt: "2026-07-01" },
  { id: "r3", memberId: "m2", procedure: "종합 건강검진", hospital: "한강메디컬센터", rating: 5, text: "Very professional staff. Everything was on schedule.", status: "approved", createdAt: "2026-06-20" },
  { id: "r4", memberId: "m3", procedure: "임플란트", hospital: "압구정 프리미엄 치과", rating: 5, text: "Painless and clear pricing. Will come back for the second implant.", status: "published", createdAt: "2026-06-12" },
  { id: "r5", memberId: "m1", procedure: "SMILE LASIK", hospital: "강남서울밝은안과", rating: 2, text: "가격 안내가 처음과 달라 혼선이 있었습니다. 시술 자체는 만족.", status: "pending", createdAt: "2026-07-02" },
];
export const REVIEW_STATUS = {
  pending: { ko: "승인대기", color: "#f5a623" },
  approved: { ko: "승인", color: "#1b59fa" },
  published: { ko: "게시", color: "#1a9e5c" },
  rejected: { ko: "반려", color: "#e5484d" },
};

/* 문자/알림 발송 내역 + 템플릿 */
const MESSAGES = [
  { id: "msg1", to: "Sofia Petrova", phone: "+7 912 345 6789", channel: "알림톡", template: "예약 접수 안내", status: "sent", at: "2026-06-29 10:12" },
  { id: "msg2", to: "John Miller", phone: "+1 202 555 0143", channel: "SMS", template: "예약 확정 안내", status: "sent", at: "2026-06-27 15:40" },
  { id: "msg3", to: "Yuki Tanaka", phone: "+81 80 1234 5678", channel: "알림톡", template: "방문 D-1 안내", status: "sent", at: "2026-07-04 09:00" },
  { id: "msg4", to: "Fatima Zahra", phone: "+966 55 987 6543", channel: "SMS", template: "취소 접수 안내", status: "failed", at: "2026-06-30 18:22" },
  { id: "msg5", to: "Linh Nguyen", phone: "+84 90 123 4567", channel: "이메일", template: "방문 완료·후기 요청", status: "sent", at: "2026-06-24 17:05" },
  { id: "msg6", to: "Ahmed Al-Farsi", phone: "+971 50 123 4567", channel: "알림톡", template: "결제 요청 안내", status: "pending", at: "2026-07-04 11:30" },
];
export const MSG_STATUS = {
  sent: { ko: "발송완료", color: "#1a9e5c" },
  pending: { ko: "발송대기", color: "#f5a623" },
  failed: { ko: "실패", color: "#e5484d" },
};
export const TEMPLATES = [
  { id: "t1", name: "예약 접수 안내", channel: "알림톡", body: "[CareBridge] {name}님, 예약({no}) 접수되었습니다. 담당 코디네이터가 곧 연락드립니다." },
  { id: "t2", name: "예약 확정 안내", channel: "알림톡", body: "[CareBridge] {name}님, {date} {hospital} 예약이 확정되었습니다." },
  { id: "t3", name: "결제 요청 안내", channel: "SMS", body: "[CareBridge] {name}님, 예약({no}) 결제 링크: {payLink}" },
  { id: "t4", name: "방문 D-1 안내", channel: "알림톡", body: "[CareBridge] {name}님, 내일 {hospital} 방문 예정입니다. 준비사항을 확인해 주세요." },
  { id: "t5", name: "취소 접수 안내", channel: "SMS", body: "[CareBridge] {name}님, 예약({no}) 취소 요청이 접수되었습니다." },
  { id: "t6", name: "방문 완료·후기 요청", channel: "이메일", body: "[CareBridge] {name}님, 방문은 어떠셨나요? 후기를 남겨주세요: {reviewLink}" },
];

const LEADS = [
  { id: "l1", name: "Omar Haddad", email: "omar.h@example.jo", phone: "+962 79 000 1122", country: "Jordan", channel: "WhatsApp", interest: "종합 건강검진 + 전신 MRI", message: "가족 3명 검진 패키지 문의드립니다. 8월 초 방문 예정입니다.", status: "new", createdAt: "2026-07-01" },
  { id: "l2", name: "Emily Clark", email: "emily.c@example.co.uk", phone: "+44 7700 900123", country: "United Kingdom", channel: "Email", interest: "SMILE LASIK", message: "Do you offer airport pickup and a hotel package with the LASIK booking?", status: "progress", createdAt: "2026-06-30" },
  { id: "l3", name: "Chen Wei", email: "chen.wei@example.cn", phone: "+86 138 0013 8000", country: "China", channel: "Form", interest: "모발이식(FUE)", message: "3000모 이식 견적과 회복 기간이 궁금합니다.", status: "new", createdAt: "2026-06-30" },
  { id: "l4", name: "Aisha Rahman", email: "aisha.r@example.pk", phone: "+92 300 1234567", country: "Pakistan", channel: "WhatsApp", interest: "건강검진", message: "통역(우르두어) 지원이 가능한가요?", status: "progress", createdAt: "2026-06-28" },
  { id: "l5", name: "David Kim", email: "d.kim@example.com", phone: "+1 213 555 0199", country: "United States", channel: "Email", interest: "임플란트", message: "Full-mouth estimate please. Traveling from LA in September.", status: "done", createdAt: "2026-06-24" },
  { id: "l6", name: "Maria Santos", email: "m.santos@example.ph", phone: "+63 917 000 1234", country: "Philippines", channel: "Form", interest: "피부 재생 레이저", message: "패키지 회당 가격과 세션 수 문의합니다.", status: "new", createdAt: "2026-07-02" },
  { id: "l7", name: "Nurlan Aliyev", email: "nurlan.a@example.kz", phone: "+7 701 234 5678", country: "Kazakhstan", channel: "WhatsApp", interest: "MRI·CT 스캔", message: "심장 CT 검진 후 진료 연계가 되나요?", status: "progress", createdAt: "2026-06-27" },
];

function seedAll() {
  write(K.members, MEMBERS); write(K.bookings, BOOKINGS); write(K.leads, LEADS);
  write(K.reviews, REVIEWS); write(K.messages, MESSAGES); write(K.settlements, {});
  localStorage.setItem(K.seeded, "1");
}
export function seedIfEmpty() {
  if (!has()) return;
  if (localStorage.getItem(K.seeded) === "1") return;
  seedAll();
}
export function resetSeed() { if (has()) seedAll(); }

/* ---------------- 조회 ---------------- */
export const getBookings = () => read(K.bookings, []);
export const getLeads = () => read(K.leads, []);
export const getMembers = () => read(K.members, []);
export const getMember = (id) => getMembers().find((m) => m.id === id) || null;

/* ---------------- 상태 변경 (admin) ---------------- */
export const NEXT = {
  draft: ["pending", "cancelled"],
  pending: ["processing", "cancelled"],
  processing: ["done", "cancelled"],
  done: ["visited", "cancelled"],
  visited: [],
  cancelled: [],
};

export function setBookingStatus(id, status) {
  write(K.bookings, getBookings().map((b) => (b.id === id ? { ...b, status } : b)));
}
export function resolveCancel(id, approve) {
  write(K.bookings, getBookings().map((b) => {
    if (b.id !== id) return b;
    return approve ? { ...b, status: "cancelled", cancelRequested: false } : { ...b, cancelRequested: false };
  }));
}
export function resolveEdit(id, approve) {
  write(K.bookings, getBookings().map((b) => {
    if (b.id !== id) return b;
    if (approve && b.editRequest?.patch) return { ...b, ...b.editRequest.patch, editRequested: false, editRequest: null };
    return { ...b, editRequested: false, editRequest: null };
  }));
}
export function setLeadStatus(id, status) {
  write(K.leads, getLeads().map((l) => (l.id === id ? { ...l, status } : l)));
}

/* ---------------- 리뷰 ---------------- */
export const getReviews = () => read(K.reviews, []);
export function setReviewStatus(id, status) {
  write(K.reviews, getReviews().map((r) => (r.id === id ? { ...r, status } : r)));
}

/* ---------------- 문자/알림 ---------------- */
export const getMessages = () => read(K.messages, []);
export function sendMessage({ to, phone, channel, template }) {
  const list = getMessages();
  const rec = { id: "msg" + (list.length + 1) + "x" + list.reduce((s, m) => s + m.id.length, 0), to, phone, channel, template, status: "sent", at: "방금" };
  write(K.messages, [rec, ...list]);
  return rec.id;
}

/* ---------------- 정산 (병원별 정산 상태) ---------------- */
export const getSettlements = () => read(K.settlements, {});
export function setSettlementStatus(hospital, done) {
  const s = { ...getSettlements(), [hospital]: done ? "done" : "pending" };
  write(K.settlements, s);
}

/* 리드 상태 정의 */
export const LEAD_STATUS = {
  new: { ko: "신규", color: "#1b59fa" },
  progress: { ko: "진행중", color: "#f5a623" },
  done: { ko: "완료", color: "#1a9e5c" },
};

/* =========================================================================
   ops-admin.jsx — admin '운영(OPS)' 화면: 예약 관리 · 문의 관리 · 회원 관리
   프로토타입(localStorage mock, ops.js). 조회 + 상태전이 + 요청 승인/반려.
   ========================================================================= */
import { useState, useEffect } from "react";
import { INK, SUB, MUTE, LINE, BLUE, BG_SOFT, GREEN, STAR, DISPLAY, btn, money } from "./theme.js";
import { STATUS } from "./store.js";
import {
  useOps, seedIfEmpty, resetSeed,
  getBookings, getLeads, getMembers, getMember,
  NEXT, setBookingStatus, resolveCancel, resolveEdit, setLeadStatus, LEAD_STATUS,
  PAY_STATUS, COMMISSION, amountOf,
  getReviews, setReviewStatus, REVIEW_STATUS,
  getMessages, sendMessage, MSG_STATUS, TEMPLATES,
  getSettlements, setSettlementStatus,
} from "./ops.js";

const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 };
const lbl = { fontSize: 10.5, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3, display: "block" };
const mini = (bg, fg) => ({ border: "none", background: bg, color: fg, borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" });
const th = { textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".03em", padding: "8px 10px", borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap" };
const td = { padding: "10px 10px", borderBottom: `1px solid ${LINE}`, fontSize: 13, color: INK, verticalAlign: "middle" };

function Pill({ color, children }) {
  return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, color, background: color + "18", whiteSpace: "nowrap" }}>{children}</span>;
}
function StatusPill({ s }) { const m = STATUS[s] || { ko: s, color: MUTE }; return <Pill color={m.color}>{m.ko}</Pill>; }

function Head({ title, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>{title}</div>
        <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{sub}</div>
      </div>
      {right}
    </div>
  );
}
const DemoNote = () => (
  <div style={{ fontSize: 11.5, color: "#9a6b00", background: "#fff8e6", border: "1px solid #ffe2a8", borderRadius: 8, padding: "7px 11px", marginBottom: 12 }}>
    ⚠ 데모 데이터(브라우저 localStorage). 실서비스는 백엔드 API·DB 연동이 필요합니다.
  </div>
);
function Field({ label, children, mono }) {
  return <div style={{ marginBottom: 10 }}><span style={lbl}>{label}</span><div style={{ fontSize: 13, color: INK, fontFamily: mono ? "ui-monospace,Menlo,monospace" : "inherit", wordBreak: "break-word" }}>{children ?? "—"}</div></div>;
}

/* ===================== 예약 관리 ===================== */
export function BookingsPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const rows = getBookings();
  const counts = rows.reduce((a, b) => ((a[b.status] = (a[b.status] || 0) + 1), a), {});
  const list = filter === "all" ? rows : rows.filter((b) => b.status === filter);
  const chips = [["all", `전체 ${rows.length}`], ...Object.keys(STATUS).map((k) => [k, `${STATUS[k].ko} ${counts[k] || 0}`])];
  const pending = rows.filter((b) => b.cancelRequested || b.editRequested).length;

  return (
    <div>
      <Head title="예약 관리" sub={`총 ${rows.length}건 · 처리 대기 요청 ${pending}건`}
        right={<button onClick={() => { if (confirm("예약 데모 데이터를 초기값으로 되돌릴까요?")) resetSeed(); }} style={btn(BG_SOFT, BLUE)}>↺ 데모 초기화</button>} />
      <DemoNote />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {chips.map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={mini(filter === k ? BLUE : BG_SOFT, filter === k ? "#fff" : SUB)}>{label}</button>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead><tr><th style={th}>예약번호</th><th style={th}>고객</th><th style={th}>시술</th><th style={th}>병원</th><th style={th}>방문일</th><th style={th}>금액</th><th style={th}>상태</th><th style={th}>요청</th></tr></thead>
          <tbody>
            {list.map((b) => {
              const m = getMember(b.memberId);
              const flag = b.cancelRequested ? ["취소요청", "#e5484d"] : b.editRequested ? ["수정요청", "#f5a623"] : null;
              return (
                <tr key={b.id} onClick={() => setSel(b.id)} style={{ cursor: "pointer", background: sel === b.id ? BG_SOFT : "#fff" }}>
                  <td style={{ ...td, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12 }}>{b.no}</td>
                  <td style={td}>{m?.fullName || "—"}</td>
                  <td style={td}>{b.procedure}</td>
                  <td style={{ ...td, color: SUB }}>{b.hospital}</td>
                  <td style={{ ...td, color: SUB }}>{b.date || "—"}</td>
                  <td style={td}>{money(b.priceUsd * (b.qty || 1))}</td>
                  <td style={td}><StatusPill s={b.status} /></td>
                  <td style={td}>{flag ? <Pill color={flag[1]}>{flag[0]}</Pill> : <span style={{ color: MUTE }}>—</span>}</td>
                </tr>
              );
            })}
            {!list.length && <tr><td style={{ ...td, color: MUTE, textAlign: "center" }} colSpan={8}>해당 상태의 예약이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>

      {sel && (() => {
        const b = getBookings().find((x) => x.id === sel); if (!b) return null;
        const m = getMember(b.memberId);
        return (
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, color: INK }}>예약 상세 · <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 13 }}>{b.no}</span></div>
              <button onClick={() => setSel(null)} style={mini(BG_SOFT, MUTE)}>✕ 닫기</button>
            </div>

            {b.cancelRequested && (
              <div style={{ background: "#fdecec", border: "1px solid #f7c5c5", borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, color: "#b42318", fontWeight: 600 }}>고객이 예약 취소를 요청했습니다.</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => resolveCancel(b.id, true)} style={mini("#e5484d", "#fff")}>취소 승인</button>
                  <button onClick={() => resolveCancel(b.id, false)} style={mini(BG_SOFT, SUB)}>요청 반려</button>
                </span>
              </div>
            )}
            {b.editRequested && (
              <div style={{ background: "#fff8e6", border: "1px solid #ffe2a8", borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, color: "#9a6b00", fontWeight: 600 }}>수정 요청: {b.editRequest?.summary}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => resolveEdit(b.id, true)} style={mini(GREEN, "#fff")}>수정 반영</button>
                  <button onClick={() => resolveEdit(b.id, false)} style={mini(BG_SOFT, SUB)}>반려</button>
                </span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 4 }}>
              <Field label="고객">{m?.fullName} {m?.interpreter ? `· 통역 ${m.interpreter}` : ""}</Field>
              <Field label="연락처">{m ? `${m.countryCode} ${m.phone}` : "—"}</Field>
              <Field label="시술">{b.procedure}</Field>
              <Field label="병원">{b.hospital} · {b.city}</Field>
              <Field label="방문일">{b.date || "미정(작성중)"}</Field>
              <Field label="인원">{b.qty}명</Field>
              <Field label="금액">{money(b.priceUsd)} × {b.qty} = <b>{money(b.priceUsd * (b.qty || 1))}</b></Field>
              <Field label="접수일">{b.createdAt}</Field>
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
              <span style={lbl}>상태 변경 (현재: {STATUS[b.status]?.ko})</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {(NEXT[b.status] || []).length
                  ? NEXT[b.status].map((s) => (
                    <button key={s} onClick={() => setBookingStatus(b.id, s)}
                      style={mini(s === "cancelled" ? "#fdecec" : BLUE, s === "cancelled" ? "#e5484d" : "#fff")}>→ {STATUS[s].ko}</button>
                  ))
                  : <span style={{ fontSize: 12, color: MUTE }}>종료 상태 — 추가 전이 없음</span>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ===================== 문의 관리 ===================== */
export function LeadsPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const rows = getLeads();
  const counts = rows.reduce((a, l) => ((a[l.status] = (a[l.status] || 0) + 1), a), {});
  const list = filter === "all" ? rows : rows.filter((l) => l.status === filter);
  const chips = [["all", `전체 ${rows.length}`], ...Object.keys(LEAD_STATUS).map((k) => [k, `${LEAD_STATUS[k].ko} ${counts[k] || 0}`])];
  const chIcon = { WhatsApp: "🟢", Email: "✉️", Form: "📝" };

  return (
    <div>
      <Head title="문의 관리" sub={`총 ${rows.length}건 · 신규 ${counts.new || 0}건`}
        right={<button onClick={() => { if (confirm("문의 데모 데이터를 초기값으로 되돌릴까요?")) resetSeed(); }} style={btn(BG_SOFT, BLUE)}>↺ 데모 초기화</button>} />
      <DemoNote />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {chips.map(([k, label]) => <button key={k} onClick={() => setFilter(k)} style={mini(filter === k ? BLUE : BG_SOFT, filter === k ? "#fff" : SUB)}>{label}</button>)}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {list.map((l) => (
          <div key={l.id} style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, color: INK, fontSize: 14 }}>{l.name}</span>
                <span style={{ fontSize: 12, color: MUTE }}>{l.country}</span>
                <Pill color={LEAD_STATUS[l.status].color}>{LEAD_STATUS[l.status].ko}</Pill>
                <span style={{ fontSize: 12, color: SUB }}>{chIcon[l.channel] || "•"} {l.channel}</span>
              </div>
              <span style={{ fontSize: 11.5, color: MUTE }}>{l.createdAt}</span>
            </div>
            <div style={{ fontSize: 12.5, color: SUB, marginTop: 6 }}>관심: <b style={{ color: INK }}>{l.interest}</b></div>
            <div style={{ fontSize: 13, color: INK, marginTop: 6, background: BG_SOFT, borderRadius: 8, padding: "9px 11px" }}>{l.message}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: MUTE }}>{l.email} · {l.phone}</span>
              <span style={{ display: "flex", gap: 6 }}>
                {Object.keys(LEAD_STATUS).map((s) => (
                  <button key={s} onClick={() => setLeadStatus(l.id, s)} disabled={l.status === s}
                    style={{ ...mini(l.status === s ? LEAD_STATUS[s].color : BG_SOFT, l.status === s ? "#fff" : SUB), opacity: l.status === s ? 1 : .95, cursor: l.status === s ? "default" : "pointer" }}>{LEAD_STATUS[s].ko}</button>
                ))}
              </span>
            </div>
          </div>
        ))}
        {!list.length && <div style={{ ...card, color: MUTE, textAlign: "center" }}>해당 상태의 문의가 없습니다.</div>}
      </div>
    </div>
  );
}

/* ===================== 회원 관리 ===================== */
export function MembersPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const [sel, setSel] = useState(null);
  const [reveal, setReveal] = useState(false);   // 민감정보(여권·병력) 마스킹 해제
  const rows = getMembers();
  const bookings = getBookings();
  const mask = (v) => !v || v === "-" ? "—" : reveal ? v : v.replace(/.(?=.{2})/g, "•");
  const bookingCount = (id) => bookings.filter((b) => b.memberId === id).length;

  return (
    <div>
      <Head title="회원 관리" sub={`총 ${rows.length}명`}
        right={<label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: SUB, fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} /> 민감정보 표시(여권·병력)
        </label>} />
      <div style={{ fontSize: 11.5, color: "#b42318", background: "#fdecec", border: "1px solid #f7c5c5", borderRadius: 8, padding: "7px 11px", marginBottom: 12 }}>
        🔒 여권번호·병력은 개인정보입니다. 실서비스는 접근권한(RBAC)·마스킹·감사로그가 필수이며, 여기 표시는 데모 목적입니다.
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead><tr><th style={th}>이름</th><th style={th}>국적</th><th style={th}>연락처</th><th style={th}>통역</th><th style={th}>예약</th><th style={th}>가입일</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setSel(sel === m.id ? null : m.id)} style={{ cursor: "pointer", background: sel === m.id ? BG_SOFT : "#fff" }}>
                <td style={{ ...td, fontWeight: 700 }}>{m.fullName}</td>
                <td style={{ ...td, color: SUB }}>{m.nationality}</td>
                <td style={{ ...td, color: SUB }}>{m.countryCode} {m.phone}</td>
                <td style={td}>{m.interpreter ? <Pill color={BLUE}>{m.interpreter}</Pill> : <span style={{ color: MUTE }}>—</span>}</td>
                <td style={td}>{bookingCount(m.id)}건</td>
                <td style={{ ...td, color: SUB }}>{m.joinedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (() => {
        const m = rows.find((x) => x.id === sel); if (!m) return null;
        const mb = bookings.filter((b) => b.memberId === m.id);
        return (
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, color: INK }}>{m.fullName}</div>
              <button onClick={() => setSel(null)} style={mini(BG_SOFT, MUTE)}>✕ 닫기</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 4 }}>
              <Field label="이메일">{m.email}</Field>
              <Field label="연락처">{m.countryCode} {m.phone}</Field>
              <Field label="국적">{m.nationality}</Field>
              <Field label="생년월일">{m.dob}</Field>
              <Field label="성별">{m.gender === "M" ? "남성" : m.gender === "F" ? "여성" : "—"}</Field>
              <Field label="통역">{m.interpreter || "—"}</Field>
              <Field label="추천코드">{m.referralCode || "—"}</Field>
              <Field label="가입일">{m.joinedAt}</Field>
              <Field label="여권번호 🔒" mono>{mask(m.passportNo)}</Field>
              <Field label="병력 🔒">{reveal ? m.history : mask(m.history)}</Field>
              <Field label="복용약 🔒">{reveal ? m.meds : mask(m.meds)}</Field>
              <Field label="알레르기 🔒">{reveal ? m.allergy : mask(m.allergy)}</Field>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
              <span style={lbl}>예약 이력 ({mb.length}건)</span>
              <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                {mb.length ? mb.map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12.5, background: BG_SOFT, borderRadius: 8, padding: "7px 11px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 11.5, color: SUB }}>{b.no}</span>
                    <span style={{ flex: 1, color: INK }}>{b.procedure}</span>
                    <span style={{ color: MUTE }}>{b.date || "미정"}</span>
                    <StatusPill s={b.status} />
                  </div>
                )) : <span style={{ fontSize: 12, color: MUTE }}>예약 이력 없음</span>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ===================== 공용 소품 ===================== */
function Stars({ n }) {
  return <span style={{ color: STAR, fontSize: 13, letterSpacing: 1 }}>{"★".repeat(n)}<span style={{ color: LINE }}>{"★".repeat(5 - n)}</span></span>;
}
function Stat({ n, label, sub, color }) {
  return (
    <div style={{ ...card, padding: "14px 16px" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: color || INK, lineHeight: 1.1 }}>{n}</div>
      <div style={{ fontSize: 12, color: SUB, marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub != null && <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "78px 1fr 34px", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: SUB }}>{r.label}</span>
          <span style={{ background: BG_SOFT, borderRadius: 6, height: 14, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${(r.v / max) * 100}%`, background: r.color || BLUE, borderRadius: 6 }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK, textAlign: "right" }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ===================== 대시보드 ===================== */
export function DashboardPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const bookings = getBookings(), leads = getLeads(), reviews = getReviews();
  const paid = bookings.filter((b) => b.payStatus === "paid");
  const revenue = paid.reduce((s, b) => s + amountOf(b), 0);
  const refunded = bookings.filter((b) => b.payStatus === "refunded").reduce((s, b) => s + amountOf(b), 0);
  const unpaid = bookings.filter((b) => b.payStatus === "unpaid").length;
  const active = bookings.filter((b) => !["cancelled", "visited"].includes(b.status)).length;
  const cancelRate = bookings.length ? Math.round((bookings.filter((b) => b.status === "cancelled").length / bookings.length) * 100) : 0;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const reqPending = bookings.filter((b) => b.cancelRequested || b.editRequested).length;
  const reviewPending = reviews.filter((r) => r.status === "pending").length;
  const statusRows = Object.keys(STATUS).map((k) => ({ label: STATUS[k].ko, v: bookings.filter((b) => b.status === k).length, color: STATUS[k].color }));
  const recent = [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <Head title="대시보드" sub="예약·결제·문의·리뷰 현황 한눈에 보기"
        right={<button onClick={() => { if (confirm("모든 운영 데모 데이터를 초기값으로 되돌릴까요?")) resetSeed(); }} style={btn(BG_SOFT, BLUE)}>↺ 데모 초기화</button>} />
      <DemoNote />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 14 }}>
        <Stat n={bookings.length} label="총 예약" sub={`진행중 ${active}건`} />
        <Stat n={money(revenue)} label="결제 완료 매출" sub={`${paid.length}건`} color={GREEN} />
        <Stat n={unpaid} label="미결제" sub="결제 대기" color={unpaid ? "#f5a623" : INK} />
        <Stat n={newLeads} label="신규 문의" sub={`총 ${leads.length}건`} color={newLeads ? BLUE : INK} />
        <Stat n={reqPending} label="처리 대기 요청" sub="취소·수정" color={reqPending ? "#e5484d" : INK} />
        <Stat n={reviewPending} label="리뷰 승인대기" color={reviewPending ? "#f5a623" : INK} />
        <Stat n={`${cancelRate}%`} label="취소율" />
        <Stat n={money(refunded)} label="환불액" color={refunded ? "#e5484d" : INK} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 14 }}>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 14, color: INK, marginBottom: 10 }}>예약 상태 분포</div>
          <Bars rows={statusRows} />
        </div>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 14, color: INK, marginBottom: 10 }}>결제 현황</div>
          <Bars rows={Object.keys(PAY_STATUS).map((k) => ({ label: PAY_STATUS[k].ko, v: bookings.filter((b) => b.payStatus === k).length, color: PAY_STATUS[k].color }))} />
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: SUB }}>플랫폼 수수료(예상, {Math.round(COMMISSION * 100)}%)</span>
            <b style={{ color: INK }}>{money(Math.round(revenue * COMMISSION))}</b>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, padding: "14px 16px 8px" }}>최근 예약</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr><th style={th}>예약번호</th><th style={th}>고객</th><th style={th}>시술</th><th style={th}>금액</th><th style={th}>결제</th><th style={th}>상태</th></tr></thead>
          <tbody>
            {recent.map((b) => {
              const m = getMember(b.memberId), p = PAY_STATUS[b.payStatus] || {};
              return (
                <tr key={b.id}>
                  <td style={{ ...td, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12 }}>{b.no}</td>
                  <td style={td}>{m?.fullName || "—"}</td>
                  <td style={td}>{b.procedure}</td>
                  <td style={td}>{money(amountOf(b))}</td>
                  <td style={td}><Pill color={p.color || MUTE}>{p.ko || "—"}</Pill></td>
                  <td style={td}><StatusPill s={b.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== 정산 관리 ===================== */
export function SettlementPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const bookings = getBookings();
  const settlements = getSettlements();
  const paid = bookings.filter((b) => b.payStatus === "paid");
  const revenue = paid.reduce((s, b) => s + amountOf(b), 0);
  const fee = Math.round(revenue * COMMISSION);
  const payout = revenue - fee;
  const refunded = bookings.filter((b) => b.payStatus === "refunded").reduce((s, b) => s + amountOf(b), 0);

  // 병원별 집계 (결제완료 건만)
  const byHospital = {};
  paid.forEach((b) => {
    const h = byHospital[b.hospital] || (byHospital[b.hospital] = { hospital: b.hospital, count: 0, revenue: 0 });
    h.count += 1; h.revenue += amountOf(b);
  });
  const hospitals = Object.values(byHospital).sort((a, b) => b.revenue - a.revenue);

  return (
    <div>
      <Head title="정산 관리" sub={`결제 완료 ${paid.length}건 · 병원 ${hospitals.length}곳`} />
      <DemoNote />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <Stat n={money(revenue)} label="총 결제액" color={GREEN} />
        <Stat n={money(fee)} label={`플랫폼 수수료 (${Math.round(COMMISSION * 100)}%)`} color={BLUE} />
        <Stat n={money(payout)} label="병원 정산 예정" />
        <Stat n={money(refunded)} label="환불액" color={refunded ? "#e5484d" : INK} />
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, padding: "14px 16px 8px" }}>병원별 정산</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr><th style={th}>병원</th><th style={th}>건수</th><th style={th}>매출</th><th style={th}>수수료</th><th style={th}>정산액</th><th style={th}>상태</th></tr></thead>
          <tbody>
            {hospitals.map((h) => {
              const hFee = Math.round(h.revenue * COMMISSION);
              const done = settlements[h.hospital] === "done";
              return (
                <tr key={h.hospital}>
                  <td style={{ ...td, fontWeight: 700 }}>{h.hospital}</td>
                  <td style={td}>{h.count}건</td>
                  <td style={td}>{money(h.revenue)}</td>
                  <td style={{ ...td, color: MUTE }}>-{money(hFee)}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{money(h.revenue - hFee)}</td>
                  <td style={td}>
                    <button onClick={() => setSettlementStatus(h.hospital, !done)} style={mini(done ? GREEN : BG_SOFT, done ? "#fff" : SUB)}>
                      {done ? "정산완료 ✓" : "정산대기"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!hospitals.length && <tr><td style={{ ...td, color: MUTE, textAlign: "center" }} colSpan={6}>결제 완료 건이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, padding: "14px 16px 8px" }}>결제 내역</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead><tr><th style={th}>예약번호</th><th style={th}>고객</th><th style={th}>병원</th><th style={th}>금액</th><th style={th}>결제상태</th><th style={th}>수단</th><th style={th}>결제일</th></tr></thead>
          <tbody>
            {bookings.map((b) => {
              const m = getMember(b.memberId), p = PAY_STATUS[b.payStatus] || {};
              return (
                <tr key={b.id}>
                  <td style={{ ...td, fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12 }}>{b.no}</td>
                  <td style={td}>{m?.fullName || "—"}</td>
                  <td style={{ ...td, color: SUB }}>{b.hospital}</td>
                  <td style={td}>{money(amountOf(b))}</td>
                  <td style={td}><Pill color={p.color || MUTE}>{p.ko || "—"}</Pill></td>
                  <td style={{ ...td, color: SUB }}>{b.payMethod}</td>
                  <td style={{ ...td, color: SUB }}>{b.paidAt || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== 리뷰 관리 ===================== */
export function ReviewsPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const [filter, setFilter] = useState("all");
  const rows = getReviews();
  const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  const list = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const chips = [["all", `전체 ${rows.length}`], ...Object.keys(REVIEW_STATUS).map((k) => [k, `${REVIEW_STATUS[k].ko} ${counts[k] || 0}`])];

  return (
    <div>
      <Head title="리뷰 관리" sub={`총 ${rows.length}건 · 승인대기 ${counts.pending || 0}건`}
        right={<button onClick={() => { if (confirm("리뷰 데모 데이터를 초기값으로 되돌릴까요?")) resetSeed(); }} style={btn(BG_SOFT, BLUE)}>↺ 데모 초기화</button>} />
      <DemoNote />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {chips.map(([k, label]) => <button key={k} onClick={() => setFilter(k)} style={mini(filter === k ? BLUE : BG_SOFT, filter === k ? "#fff" : SUB)}>{label}</button>)}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {list.map((r) => {
          const m = getMember(r.memberId);
          return (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Stars n={r.rating} />
                  <span style={{ fontWeight: 800, color: INK, fontSize: 14 }}>{m?.fullName || "익명"}</span>
                  <span style={{ fontSize: 12, color: MUTE }}>· {r.procedure} · {r.hospital}</span>
                  <Pill color={REVIEW_STATUS[r.status].color}>{REVIEW_STATUS[r.status].ko}</Pill>
                </div>
                <span style={{ fontSize: 11.5, color: MUTE }}>{r.createdAt}</span>
              </div>
              <div style={{ fontSize: 13, color: INK, marginTop: 8, background: BG_SOFT, borderRadius: 8, padding: "9px 11px", lineHeight: 1.5 }}>{r.text}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {r.rating <= 2 && <span style={{ fontSize: 11.5, color: "#b42318", fontWeight: 600, alignSelf: "center", marginRight: "auto" }}>⚠ 저평점 — VOC 확인 권장</span>}
                {r.status !== "published" && <button onClick={() => setReviewStatus(r.id, "published")} style={mini(GREEN, "#fff")}>게시</button>}
                {r.status === "pending" && <button onClick={() => setReviewStatus(r.id, "approved")} style={mini(BLUE, "#fff")}>승인</button>}
                {r.status !== "rejected" && <button onClick={() => setReviewStatus(r.id, "rejected")} style={mini("#fdecec", "#e5484d")}>반려</button>}
              </div>
            </div>
          );
        })}
        {!list.length && <div style={{ ...card, color: MUTE, textAlign: "center" }}>해당 상태의 리뷰가 없습니다.</div>}
      </div>
    </div>
  );
}

/* ===================== 문자/알림 관리 ===================== */
export function MessagesPanel() {
  useOps();
  useEffect(() => { seedIfEmpty(); }, []);
  const [tpl, setTpl] = useState(TEMPLATES[0].id);
  const [to, setTo] = useState("");
  const rows = getMessages();
  const send = () => {
    const t = TEMPLATES.find((x) => x.id === tpl);
    if (!to.trim()) return alert("수신자(이름/번호)를 입력하세요.");
    sendMessage({ to: to.trim(), phone: "", channel: t.channel, template: t.name });
    setTo("");
  };
  const chIcon = { 알림톡: "🟡", SMS: "💬", 이메일: "✉️" };

  return (
    <div>
      <Head title="문자 · 알림 관리" sub={`발송 ${rows.length}건 · 템플릿 ${TEMPLATES.length}종`} />
      <DemoNote />

      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, marginBottom: 10 }}>빠른 발송 (데모)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
          <div><span style={lbl}>템플릿</span>
            <select value={tpl} onChange={(e) => setTpl(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, background: "#fff" }}>
              {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.channel}</option>)}
            </select>
          </div>
          <div><span style={lbl}>수신자</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="이름 또는 번호" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <button onClick={send} style={btn(BLUE, "#fff")}>발송</button>
        </div>
        <div style={{ fontSize: 12, color: MUTE, marginTop: 8, background: BG_SOFT, borderRadius: 8, padding: "8px 11px" }}>
          {TEMPLATES.find((t) => t.id === tpl)?.body}
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, padding: "14px 16px 8px" }}>발송 내역</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead><tr><th style={th}>수신자</th><th style={th}>채널</th><th style={th}>템플릿</th><th style={th}>상태</th><th style={th}>시각</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td style={{ ...td, fontWeight: 600 }}>{m.to}{m.phone ? <span style={{ color: MUTE, fontWeight: 400 }}> · {m.phone}</span> : null}</td>
                <td style={td}>{chIcon[m.channel] || "•"} {m.channel}</td>
                <td style={{ ...td, color: SUB }}>{m.template}</td>
                <td style={td}><Pill color={MSG_STATUS[m.status].color}>{MSG_STATUS[m.status].ko}</Pill></td>
                <td style={{ ...td, color: MUTE }}>{m.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: INK, marginBottom: 10 }}>템플릿</div>
        <div style={{ display: "grid", gap: 8 }}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={{ background: BG_SOFT, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: INK }}>{t.name}</span>
                <Pill color={BLUE}>{t.channel}</Pill>
              </div>
              <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.5 }}>{t.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

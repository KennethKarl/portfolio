/* =========================================================================
   admin-ops.jsx — 운영(Operations) 패널  (/admin > 운영)
   ---------------------------------------------------------------------------
   3개 리프:
     · 예약 관리      ReservationsPanel  — /booking 접수(submitReservation) 관리
     · 리드/문의 Inbox LeadsPanel        — /contact 접수(submitLead) 관리
     · 유치 분석       AnalyticsPanel     — 유입→문의→예약→완료 퍼널·채널·시장 분석
   서버 연동 전: api.js get() 이 null → 아래 SAMPLE_* 로 폴백. 상태 변경은
   화면 내(useState)에만 반영되며(비영속), 서버 연동 시 update*()로 승격된다.
   상단 배너로 '샘플 데이터' 임을 명시한다.
   ========================================================================= */
import React, { useEffect, useMemo, useState } from "react";
import { listReservations, listLeads, getAcquisitionAnalytics } from "./api.js";
import { API_BASE } from "./config.js";
import {
  BLUE, BLUE_SOFT, INK, SUB, MUTE, LINE, BG_SOFT, GREEN, GREEN_SOFT,
  STAR, ACCENT, DISPLAY, btn,
} from "./theme.js";

/* ---------------- 공통 스타일 ---------------- */
const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 };
const inp = { width: "100%", padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
const chipBtn = (on) => ({ border: `1px solid ${on ? BLUE : LINE}`, background: on ? BLUE : "#fff", color: on ? "#fff" : SUB, borderRadius: 999, padding: "6px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" });
const th = { textAlign: "left", fontSize: 11, fontWeight: 800, color: MUTE, textTransform: "uppercase", letterSpacing: ".04em", padding: "10px 12px", borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap" };
const td = { padding: "12px", borderBottom: `1px solid ${LINE}`, fontSize: 13, color: INK, verticalAlign: "middle" };
const money = (n) => "$" + Number(n || 0).toLocaleString();
const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—");

function SampleBanner({ resource }) {
  return (
    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#9a3412", marginBottom: 14, lineHeight: 1.6 }}>
      <b>샘플 데이터</b> — 개발부 서버 연동 전 데모입니다. 상태 변경은 이 화면에만 반영되며 저장되지 않습니다.
      서버 연동 시 <code>GET {API_BASE || "{API_BASE}"}{resource}</code> 응답으로 자동 교체됩니다.
    </div>
  );
}

function SectionHead({ title, count, unit = "건", desc, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>{title}{count != null && <span style={{ fontSize: 13, color: MUTE, fontWeight: 600 }}> · {count}{unit}</span>}</div>
        {desc && <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function StatusPill({ tone, children }) {
  const map = {
    green: [GREEN_SOFT, GREEN], blue: [BLUE_SOFT, BLUE], amber: ["#fff4dc", "#a8730a"],
    red: ["#fdecec", "#c8321f"], gray: [BG_SOFT, MUTE],
  };
  const [bg, fg] = map[tone] || map.gray;
  return <span style={{ display: "inline-block", background: bg, color: fg, fontSize: 11.5, fontWeight: 800, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>{children}</span>;
}

/* ====================================================================
   샘플 데이터
   ==================================================================== */
const SAMPLE_RESERVATIONS = [
  { no: "SG-260702-014", status: "pending", treatmentName: "프리미엄 종합검진 (PET-CT)", hospital: "데모F 검진센터", customer: { name: "James Carter", nationality: "United States", phone: "+1 415-555-0182", email: "j.carter@example.com" }, party: 1, dates: { arrival: "2026-07-21", departure: "2026-07-26", preferred: "2026-07-22" }, amount: 2480, coordinator: "미배정", createdAt: "2026-07-02T09:12:00", memo: "PET-CT 옵션 문의, 통역(영어) 필요" },
  { no: "SG-260701-009", status: "confirmed", treatmentName: "리쥬란 힐러 3회 패키지", hospital: "데모G 피부과", customer: { name: "Yuki Tanaka", nationality: "Japan", phone: "+81 90-1234-5678", email: "yuki.t@example.jp" }, party: 2, dates: { arrival: "2026-07-15", departure: "2026-07-19", preferred: "2026-07-16" }, amount: 1740, coordinator: "코디A", createdAt: "2026-07-01T14:40:00", memo: "친구 동반(2인) — 인접 시술 희망" },
  { no: "SG-260701-004", status: "confirmed", treatmentName: "임플란트 상담 + 파노라마", hospital: "데모H 치과", customer: { name: "Fatima Al-Rashid", nationality: "UAE", phone: "+971 50-123-4567", email: "fatima.r@example.ae" }, party: 1, dates: { arrival: "2026-07-11", departure: "2026-07-18", preferred: "2026-07-12" }, amount: 620, coordinator: "코디B", createdAt: "2026-07-01T08:05:00", memo: "아랍어 통역 · 여성 코디네이터 요청" },
  { no: "SG-260630-021", status: "completed", treatmentName: "눈밑 지방재배치", hospital: "데모I 성형외과", customer: { name: "Chen Wei", nationality: "China", phone: "+86 138-0013-8000", email: "chen.wei@example.cn" }, party: 1, dates: { arrival: "2026-06-24", departure: "2026-07-01", preferred: "2026-06-25" }, amount: 3300, coordinator: "코디A", createdAt: "2026-06-30T11:20:00", memo: "시술 완료 · 사후관리 1회 예약됨" },
  { no: "SG-260629-018", status: "pending", treatmentName: "종합 건강검진 (기본)", hospital: "데모F 검진센터", customer: { name: "Somchai P.", nationality: "Thailand", phone: "+66 81-234-5678", email: "somchai@example.th" }, party: 3, dates: { arrival: "2026-08-02", departure: "2026-08-07", preferred: "2026-08-03" }, amount: 1950, coordinator: "미배정", createdAt: "2026-06-29T17:55:00", memo: "가족 3인 · 호텔 예약 지원 요청" },
  { no: "SG-260628-011", status: "cancelled", treatmentName: "물광주사 2회", hospital: "데모G 피부과", customer: { name: "Olga Ivanova", nationality: "Russia", phone: "+7 903-123-4567", email: "olga.i@example.ru" }, party: 1, dates: { arrival: "2026-07-09", departure: "2026-07-12", preferred: "2026-07-10" }, amount: 480, coordinator: "코디B", createdAt: "2026-06-28T10:02:00", memo: "일정 변경으로 고객 취소 — 재문의 예정" },
  { no: "SG-260627-006", status: "confirmed", treatmentName: "위·대장 내시경 (수면)", hospital: "데모J 검진센터", customer: { name: "Michael Brown", nationality: "United States", phone: "+1 212-555-0143", email: "m.brown@example.com" }, party: 2, dates: { arrival: "2026-07-13", departure: "2026-07-17", preferred: "2026-07-14" }, amount: 1120, coordinator: "코디A", createdAt: "2026-06-27T13:30:00", memo: "부부 동반 검진" },
];

const RES_STATUS = { pending: ["대기", "amber"], confirmed: ["확정", "blue"], completed: ["완료", "green"], cancelled: ["취소", "red"] };

const SAMPLE_LEADS = [
  { id: "L-2607-231", name: "Aisha Mohammed", email: "aisha.m@example.ae", phone: "+971 55-987-6543", category: "성형외과", message: "Interested in facial contouring. Do you provide Arabic interpreter and female coordinator?", source: "instagram", market: "UAE", status: "new", owner: "미배정", createdAt: "2026-07-03T07:40:00" },
  { id: "L-2607-230", name: "David Kim", email: "d.kim@example.com", phone: "+1 213-555-0199", category: "건강검진", message: "Looking for a premium executive checkup for two, mid-July. What's included and total cost?", source: "search", market: "United States", status: "contacted", owner: "코디A", createdAt: "2026-07-03T02:15:00" },
  { id: "L-2607-228", name: "Mei Lin", email: "mei.lin@example.cn", phone: "+86 139-0013-9000", category: "피부과", message: "리쥬란이랑 물광 같이 받을 수 있나요? 3박 4일 일정입니다.", source: "referral", market: "China", status: "qualified", owner: "코디B", createdAt: "2026-07-02T15:22:00" },
  { id: "L-2607-225", name: "Hiroshi Sato", email: "h.sato@example.jp", phone: "+81 80-9876-5432", category: "치과", message: "임플란트 4개 견적과 체류 기간 문의합니다.", source: "paid", market: "Japan", status: "converted", owner: "코디A", createdAt: "2026-07-02T09:48:00" },
  { id: "L-2607-221", name: "Natalia P.", email: "natalia.p@example.ru", phone: "+7 905-234-5678", category: "안과", message: "Smile LASIK price and recovery time before flying back?", source: "search", market: "Russia", status: "new", owner: "미배정", createdAt: "2026-07-02T06:10:00" },
  { id: "L-2607-218", name: "Somsak T.", email: "somsak.t@example.th", phone: "+66 82-345-6789", category: "종합병원", message: "Full body checkup for a family of 3. Hotel assistance available?", source: "instagram", market: "Thailand", status: "contacted", owner: "코디B", createdAt: "2026-07-01T18:33:00" },
  { id: "L-2607-214", name: "Robert Wilson", email: "r.wilson@example.com", phone: "+1 305-555-0177", category: "정형외과", message: "Knee cartilage consultation + MRI. Second opinion from Seoul.", source: "referral", market: "United States", status: "qualified", owner: "코디A", createdAt: "2026-07-01T11:05:00" },
  { id: "L-2607-209", name: "Layla Hassan", email: "layla.h@example.ae", phone: "+971 52-111-2233", category: "피부과", message: "Acne scar program. How many sessions and total days in Seoul?", source: "instagram", market: "UAE", status: "archived", owner: "코디B", createdAt: "2026-06-30T20:40:00" },
];

const LEAD_STATUS = { new: ["신규", "amber"], contacted: ["연락함", "blue"], qualified: ["상담중", "blue"], converted: ["전환", "green"], archived: ["보관", "gray"] };
const LEAD_SOURCE = { search: "검색", paid: "광고", instagram: "인스타그램", referral: "추천", direct: "직접유입" };

const SAMPLE_ANALYTICS = {
  kpis: { newLeads: 231, reservations: 48, conversion: 20.8, revenue: 128400, avgResponseHrs: 3.4, deltas: { newLeads: 12, reservations: 8, conversion: 1.6, revenue: 15, avgResponseHrs: -0.6 } },
  funnel: [
    { stage: "사이트 방문", value: 8420 },
    { stage: "문의(리드)", value: 231 },
    { stage: "상담 진행", value: 96 },
    { stage: "예약 확정", value: 48 },
    { stage: "시술 완료", value: 31 },
  ],
  sources: [
    { key: "search", label: "검색", leads: 82, reservations: 19 },
    { key: "instagram", label: "인스타그램", leads: 64, reservations: 11 },
    { key: "paid", label: "광고", leads: 41, reservations: 9 },
    { key: "referral", label: "추천", leads: 30, reservations: 7 },
    { key: "direct", label: "직접유입", leads: 14, reservations: 2 },
  ],
  markets: [
    { label: "미국", leads: 61, reservations: 14 },
    { label: "중동(UAE)", leads: 52, reservations: 10 },
    { label: "일본", leads: 43, reservations: 9 },
    { label: "중국", leads: 39, reservations: 8 },
    { label: "동남아", leads: 24, reservations: 5 },
    { label: "기타", leads: 12, reservations: 2 },
  ],
  trend: [
    { label: "5월2주", leads: 38, reservations: 6 },
    { label: "5월3주", leads: 44, reservations: 8 },
    { label: "5월4주", leads: 41, reservations: 7 },
    { label: "6월1주", leads: 49, reservations: 9 },
    { label: "6월2주", leads: 53, reservations: 10 },
    { label: "6월3주", leads: 58, reservations: 11 },
    { label: "6월4주", leads: 62, reservations: 13 },
    { label: "7월1주", leads: 66, reservations: 14 },
  ],
  topTreatments: [
    { name: "프리미엄 종합검진", leads: 47, reservations: 12 },
    { name: "리쥬란·물광 스킨부스터", leads: 39, reservations: 9 },
    { name: "임플란트·치과", leads: 28, reservations: 7 },
    { name: "눈·코 성형", leads: 26, reservations: 6 },
    { name: "스마일 라식", leads: 18, reservations: 4 },
  ],
};

/* 서버 폴백 훅 — API_BASE 있으면 fetch 시도, 없거나 실패 시 sample */
function useOpsData(fetcher, sample) {
  const [data, setData] = useState(sample);
  const [live, setLive] = useState(false);
  useEffect(() => {
    let alive = true;
    if (!API_BASE) return;
    fetcher().then((r) => { if (alive && r) { setData(r); setLive(true); } }).catch(() => {});
    return () => { alive = false; };
  }, []); // eslint-disable-line
  return [data, setData, live];
}

/* ====================================================================
   예약 관리
   ==================================================================== */
export function ReservationsPanel() {
  const [rows, setRows, live] = useOpsData(() => listReservations(), SAMPLE_RESERVATIONS);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // no

  const counts = useMemo(() => rows.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {}), [rows]);
  const filtered = rows.filter((r) => (filter === "all" || r.status === filter) &&
    (!q || `${r.no} ${r.treatmentName} ${r.hospital} ${r.customer?.name} ${r.customer?.nationality}`.toLowerCase().includes(q.toLowerCase())));
  const setStatus = (no, status) => setRows((rs) => rs.map((r) => (r.no === no ? { ...r, status } : r)));
  const cur = open && rows.find((r) => r.no === open);

  const TABS = [["all", "전체"], ["pending", "대기"], ["confirmed", "확정"], ["completed", "완료"], ["cancelled", "취소"]];
  return (
    <div>
      <SectionHead title="예약 관리" count={rows.length} desc="/booking 예약 신청(submitReservation) 접수 관리 — 상태 전환·코디네이터 배정" />
      {!live && <SampleBanner resource="/v1/reservations" />}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        {TABS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={chipBtn(filter === k)}>{l}{k !== "all" && counts[k] ? ` ${counts[k]}` : ""}</button>)}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="예약번호·이름·시술·국가 검색" style={{ ...inp, width: 240, marginLeft: "auto", flex: "0 1 240px" }} />
      </div>

      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead><tr>
            {["예약번호", "고객", "시술 · 병원", "방문일정", "인원", "금액", "코디네이터", "상태"].map((h) => <th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((r) => {
              const [lbl, tone] = RES_STATUS[r.status] || ["—", "gray"];
              return (
                <tr key={r.no} onClick={() => setOpen(r.no)} style={{ cursor: "pointer" }}>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: BLUE }}>{r.no}</td>
                  <td style={td}><div style={{ fontWeight: 700 }}>{r.customer?.name}</div><div style={{ fontSize: 11.5, color: MUTE }}>{r.customer?.nationality}</div></td>
                  <td style={td}><div>{r.treatmentName}</div><div style={{ fontSize: 11.5, color: MUTE }}>{r.hospital}</div></td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDate(r.dates?.arrival)} → {fmtDate(r.dates?.departure)}</td>
                  <td style={td}>{r.party}인</td>
                  <td style={{ ...td, fontWeight: 700 }}>{money(r.amount)}</td>
                  <td style={{ ...td, color: r.coordinator === "미배정" ? ACCENT : INK, fontWeight: r.coordinator === "미배정" ? 700 : 400 }}>{r.coordinator}</td>
                  <td style={td}><StatusPill tone={tone}>{lbl}</StatusPill></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: MUTE, padding: "40px 0" }}>조건에 맞는 예약이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>

      {cur && <Drawer onClose={() => setOpen(null)} title={`예약 ${cur.no}`}>
        <DetailRows rows={[
          ["고객", `${cur.customer?.name} · ${cur.customer?.nationality}`],
          ["연락처", cur.customer?.phone], ["이메일", cur.customer?.email],
          ["시술", cur.treatmentName], ["병원", cur.hospital],
          ["방문 일정", `${fmtDate(cur.dates?.arrival)} → ${fmtDate(cur.dates?.departure)} (희망 시술일 ${fmtDate(cur.dates?.preferred)})`],
          ["인원", `${cur.party}인`], ["예상 금액", money(cur.amount)],
          ["코디네이터", cur.coordinator], ["접수일", fmtDate(cur.createdAt)],
          ["메모", cur.memo],
        ]} />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: MUTE, marginBottom: 8 }}>상태 변경</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(RES_STATUS).map(([k, [lbl]]) => (
              <button key={k} onClick={() => setStatus(cur.no, k)} style={chipBtn(cur.status === k)}>{lbl}</button>
            ))}
          </div>
        </div>
      </Drawer>}
    </div>
  );
}

/* ====================================================================
   리드/문의 Inbox
   ==================================================================== */
export function LeadsPanel() {
  const [rows, setRows, live] = useOpsData(() => listLeads(), SAMPLE_LEADS);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // id

  const counts = useMemo(() => rows.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {}), [rows]);
  const filtered = rows.filter((r) => (filter === "all" || r.status === filter) &&
    (!q || `${r.name} ${r.email} ${r.category} ${r.market} ${r.message}`.toLowerCase().includes(q.toLowerCase())));
  const setStatus = (id, status) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  const cur = open && rows.find((r) => r.id === open);

  const TABS = [["all", "전체"], ["new", "신규"], ["contacted", "연락함"], ["qualified", "상담중"], ["converted", "전환"], ["archived", "보관"]];
  return (
    <div>
      <SectionHead title="리드 · 문의 Inbox" count={rows.length} desc="/contact 상담 신청(submitLead) 접수 — 유입 채널·시장·담당자 분류" />
      {!live && <SampleBanner resource="/v1/leads" />}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        {TABS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={chipBtn(filter === k)}>{l}{k !== "all" && counts[k] ? ` ${counts[k]}` : ""}</button>)}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·이메일·시장·내용 검색" style={{ ...inp, width: 240, marginLeft: "auto", flex: "0 1 240px" }} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((r) => {
          const [lbl, tone] = LEAD_STATUS[r.status] || ["—", "gray"];
          return (
            <button key={r.id} onClick={() => setOpen(r.id)} style={{ ...card, padding: "12px 14px", textAlign: "left", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: INK }}>{r.name}</span>
                  <StatusPill tone={tone}>{lbl}</StatusPill>
                  <span style={{ fontSize: 11.5, color: MUTE }}>{r.market} · {r.category} · {LEAD_SOURCE[r.source] || r.source}</span>
                </div>
                <div style={{ fontSize: 13, color: SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.message}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11.5, color: MUTE, whiteSpace: "nowrap" }}>
                <div>{fmtDate(r.createdAt)}</div>
                <div style={{ color: r.owner === "미배정" ? ACCENT : MUTE, fontWeight: r.owner === "미배정" ? 700 : 400 }}>{r.owner}</div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div style={{ ...card, color: MUTE, fontSize: 13, textAlign: "center", padding: "40px 0" }}>조건에 맞는 문의가 없습니다.</div>}
      </div>

      {cur && <Drawer onClose={() => setOpen(null)} title={cur.name}>
        <DetailRows rows={[
          ["이메일", cur.email], ["연락처", cur.phone],
          ["시장", cur.market], ["관심 진료", cur.category],
          ["유입 채널", LEAD_SOURCE[cur.source] || cur.source],
          ["담당자", cur.owner], ["접수일시", String(cur.createdAt).replace("T", " ").slice(0, 16)],
        ]} />
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: MUTE, marginBottom: 6 }}>문의 내용</div>
          <div style={{ background: BG_SOFT, border: `1px solid ${LINE}`, borderRadius: 10, padding: 12, fontSize: 13.5, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{cur.message}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <a href={`mailto:${cur.email}`} style={{ ...btn(BLUE, "#fff"), padding: "8px 14px", fontSize: 13, textDecoration: "none" }}>✉ 이메일 답장</a>
          <a href={`tel:${(cur.phone || "").replace(/\s/g, "")}`} style={{ ...btn(BG_SOFT, BLUE), padding: "8px 14px", fontSize: 13, textDecoration: "none" }}>📞 전화</a>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: MUTE, marginBottom: 8 }}>상태 변경</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(LEAD_STATUS).map(([k, [lbl]]) => (
              <button key={k} onClick={() => setStatus(cur.id, k)} style={chipBtn(cur.status === k)}>{lbl}</button>
            ))}
          </div>
        </div>
      </Drawer>}
    </div>
  );
}

/* ====================================================================
   유치 분석 대시보드
   ==================================================================== */
export function AnalyticsPanel() {
  const [data, , live] = useOpsData(() => getAcquisitionAnalytics(), SAMPLE_ANALYTICS);
  const k = data.kpis;
  const maxTrend = Math.max(...data.trend.map((t) => t.leads), 1);
  const maxSource = Math.max(...data.sources.map((s) => s.leads), 1);
  const maxMarket = Math.max(...data.markets.map((s) => s.leads), 1);
  const funnelMax = data.funnel[0]?.value || 1;

  const KPIS = [
    { label: "신규 리드", value: k.newLeads.toLocaleString(), delta: k.deltas.newLeads, suffix: "" },
    { label: "예약 확정", value: k.reservations.toLocaleString(), delta: k.deltas.reservations, suffix: "" },
    { label: "리드→예약 전환율", value: k.conversion, delta: k.deltas.conversion, suffix: "%" },
    { label: "유치 매출(예상)", value: money(k.revenue), delta: k.deltas.revenue, suffix: "%", deltaPct: true },
    { label: "평균 응답시간", value: k.avgResponseHrs, delta: k.deltas.avgResponseHrs, suffix: "h", lowerBetter: true },
  ];

  return (
    <div>
      <SectionHead title="유치 분석" desc="유입 → 문의 → 상담 → 예약 → 완료 퍼널과 채널·시장·시술별 유치 성과 (최근 30일)" />
      {!live && <SampleBanner resource="/v1/analytics/acquisition" />}

      {/* KPI 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
        {KPIS.map((c) => {
          const up = c.delta >= 0;
          const good = c.lowerBetter ? !up : up;
          return (
            <div key={c.label} style={card}>
              <div style={{ fontSize: 11.5, color: MUTE, fontWeight: 700, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>{c.value}{c.suffix === "%" && !c.deltaPct ? "%" : c.suffix === "h" ? "h" : ""}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: good ? GREEN : ACCENT, marginTop: 4 }}>
                {up ? "▲" : "▼"} {Math.abs(c.delta)}{c.deltaPct || c.suffix === "%" ? "%p" : c.suffix === "h" ? "h" : ""} <span style={{ color: MUTE, fontWeight: 500 }}>vs 지난달</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14, marginBottom: 14 }} className="ops-2col">
        {/* 퍼널 */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 12 }}>유치 퍼널</div>
          <div style={{ display: "grid", gap: 8 }}>
            {data.funnel.map((f, i) => {
              const pct = Math.round((f.value / funnelMax) * 100);
              const conv = i > 0 ? Math.round((f.value / data.funnel[i - 1].value) * 100) : 100;
              return (
                <div key={f.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: SUB, fontWeight: 600 }}>{f.stage}</span>
                    <span style={{ color: INK, fontWeight: 700 }}>{f.value.toLocaleString()} {i > 0 && <span style={{ color: MUTE, fontWeight: 500 }}>({conv}%)</span>}</span>
                  </div>
                  <div style={{ height: 22, background: BG_SOFT, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${BLUE}, #4f80ff)`, borderRadius: 6, transition: "width .4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 주간 추이 (SVG 그룹 막대) */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>주간 추이</span>
            <span style={{ fontSize: 11, color: MUTE }}><b style={{ color: BLUE }}>■</b> 리드 &nbsp;<b style={{ color: GREEN }}>■</b> 예약</span>
          </div>
          <TrendChart data={data.trend} max={maxTrend} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="ops-2col">
        {/* 채널별 */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 12 }}>유입 채널별 유치</div>
          {data.sources.map((s) => <BarRow key={s.key} label={s.label} leads={s.leads} reservations={s.reservations} max={maxSource} />)}
        </div>
        {/* 시장별 */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 12 }}>시장(국가)별 유치</div>
          {data.markets.map((s) => <BarRow key={s.label} label={s.label} leads={s.leads} reservations={s.reservations} max={maxMarket} />)}
        </div>
      </div>

      {/* 인기 시술 */}
      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ padding: "14px 16px 4px", fontSize: 13, fontWeight: 800, color: INK }}>시술별 유치 성과</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead><tr>{["시술", "문의", "예약", "전환율"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.topTreatments.map((t) => (
              <tr key={t.name}>
                <td style={{ ...td, fontWeight: 600 }}>{t.name}</td>
                <td style={td}>{t.leads}</td>
                <td style={td}>{t.reservations}</td>
                <td style={td}><StatusPill tone="blue">{Math.round((t.reservations / t.leads) * 100)}%</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@media(max-width:760px){.ops-2col{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* 채널/시장 막대 한 줄 (리드 배경 + 예약 오버레이) */
function BarRow({ label, leads, reservations, max }) {
  const lp = Math.round((leads / max) * 100);
  const rp = Math.round((reservations / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: SUB, fontWeight: 600 }}>{label}</span>
        <span style={{ color: MUTE }}>리드 <b style={{ color: INK }}>{leads}</b> · 예약 <b style={{ color: GREEN }}>{reservations}</b></span>
      </div>
      <div style={{ position: "relative", height: 16, background: BG_SOFT, borderRadius: 5, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${lp}%`, background: BLUE_SOFT }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${rp}%`, background: GREEN, opacity: .85 }} />
      </div>
    </div>
  );
}

/* 주간 추이 SVG 그룹 막대 */
function TrendChart({ data, max }) {
  const W = 340, H = 150, pad = 22, n = data.length;
  const bw = (W - pad * 2) / n;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={y(max * g)} y2={y(max * g)} stroke={LINE} strokeWidth="1" />)}
      {data.map((d, i) => {
        const cx = pad + bw * i + bw / 2;
        const w = Math.min(9, bw / 3);
        return (
          <g key={i}>
            <rect x={cx - w - 1} y={y(d.leads)} width={w} height={H - pad - y(d.leads)} fill={BLUE} rx="2" />
            <rect x={cx + 1} y={y(d.reservations)} width={w} height={H - pad - y(d.reservations)} fill={GREEN} rx="2" />
            <text x={cx} y={H - 6} fontSize="7.5" fill={MUTE} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* 우측 슬라이드 상세 패널 */
function Drawer({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,15,44,.28)", zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 92vw)", height: "100%", background: "#fff", boxShadow: "-8px 0 30px rgba(0,15,44,.16)", padding: 22, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: INK }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: BG_SOFT, borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: SUB }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailRows({ rows }) {
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 10, padding: "8px 0", borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
          <span style={{ color: MUTE, fontWeight: 700 }}>{k}</span>
          <span style={{ color: INK }}>{v || "—"}</span>
        </div>
      ))}
    </div>
  );
}

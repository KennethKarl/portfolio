import React, { useState, useEffect } from "react";
import { t as tr } from "./i18n.js";
import { useNavigate, useParams, useOutletContext, useSearchParams } from "react-router-dom";
import { ClientOnly } from "vite-react-ssg";
import {
  ChevronRight, ChevronDown, Star, MapPin, Clock, Check, Heart, ArrowLeft,
  Filter, Calendar, User, Trash2, Plus, Minus, CheckCircle2, AlertCircle, Building2,
  Pencil, X, Hourglass, Search, ArrowDownUp,
} from "lucide-react";
import { Seo } from "./seo.jsx";
import {
  BLUE, BLUE_SOFT, BLUE_100, EDGE, FAINT, INK, SUB, MUTE, LINE, BG_SOFT, CLOUD, ACCENT, STAR, GREEN, NAVY, SECTION_TINT, DISPLAY, btn, viewMoreBtn,
} from "./theme.js";
import { RECOVERY_BANDS, UI, tx, usd, KRW_PER_USD } from "./data.js";
import { getCollection, useContent } from "./content.js";
import * as store from "./store.js";

const WRAP = { maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" };
const won = (n) => "₩" + Number(n).toLocaleString();
const byId = (id) => getCollection("procedures").find((p) => p.id === id);

/* 금액 규칙(Figma 공통): USD 기준 표기(정가 취소선+케어브릿지 강조) + KRW 보조 병기 + 할인율 */
function Money({ p, lang, size = "md" }) {
  const dc = Math.round((1 - p.price / p.listPrice) * 100);
  const big = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: big ? 14 : 12.5, color: "#9aa7bd", textDecoration: "line-through" }}>${usd(p.listPrice).toLocaleString()}</span>
      <span style={{ fontFamily: DISPLAY, fontSize: big ? 30 : 20, fontWeight: 800, color: BLUE }}>${usd(p.price).toLocaleString()}</span>
      <span style={{ fontSize: big ? 14 : 12, color: SUB }}>≈ {won(p.price)}</span>
      <span style={{ fontSize: big ? 13 : 11.5, fontWeight: 800, color: ACCENT }}>{dc}%↓</span>
    </div>
  );
}

/* =====================================================================
   시술 리스트 (Figma 보드 스펙 18: 검색·진료과/금액대 필터·정렬·결과수·장바구니)
   ===================================================================== */
const PRICE_BANDS = [
  { id: "all", label: { en: "Any", ko: "전체" }, test: () => true },
  { id: "u500", label: { en: "Under $500", ko: "$500 미만" }, test: (u) => u < 500 },
  { id: "500-1500", label: { en: "$500 – $1,500", ko: "$500 – $1,500" }, test: (u) => u >= 500 && u < 1500 },
  { id: "1500-3000", label: { en: "$1,500 – $3,000", ko: "$1,500 – $3,000" }, test: (u) => u >= 1500 && u < 3000 },
  { id: "3000", label: { en: "$3,000+", ko: "$3,000+" }, test: (u) => u >= 3000 },
];
// 예약·리뷰 정렬용 결정적 mock 지표 (실제 데이터는 어드민 연동 필요)
const mockMetric = (id, salt) => { let h = salt; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000; return h; };
export function TreatmentListPage() {
  const { lang, navigate } = useOutletContext();
  store.useStore();
  useContent();
  const PROCEDURES = getCollection("procedures");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [cat, setCat] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [q, setQ] = useState("");
  const cats = ["all", ...Array.from(new Set(PROCEDURES.map((p) => p.category)))];
  const catCount = (c) => (c === "all" ? PROCEDURES.length : PROCEDURES.filter((p) => p.category === c).length);
  const catLabel = (c) => (c === "all" ? UI[lang].all : (tx(PROCEDURES.find((x) => x.category === c)?.dept, lang) || c));
  let list = PROCEDURES.filter((p) => {
    const u = usd(p.price);
    const band = PRICE_BANDS.find((b) => b.id === price) || PRICE_BANDS[0];
    const text = `${tx(p.name, lang)} ${tx(p.hospital.name, lang)} ${tx(p.dept, lang)} ${tx(p.summary, lang)}`.toLowerCase();
    return (cat === "all" || p.category === cat) && band.test(u) && (!q || text.includes(q.toLowerCase()));
  });
  if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "booked") list = [...list].sort((a, b) => mockMetric(b.id, 7) - mockMetric(a.id, 7));
  else if (sort === "reviewed") list = [...list].sort((a, b) => mockMetric(b.id, 13) - mockMetric(a.id, 13));
  const Pill = ({ on, onClick, children }) => (
    <button onClick={onClick} style={{ fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 999, padding: "8px 15px", background: on ? BLUE : "#fff", color: on ? "#fff" : SUB, border: `1px solid ${on ? BLUE : LINE}`, display: "inline-flex", alignItems: "center", gap: 7 }}>{children}</button>
  );
  const SORTS = [["recommended", tr("Recommended", lang)], ["price", tr("Price", lang)], ["booked", tr("Most booked", lang)], ["reviewed", tr("Most reviewed", lang)]];
  return (
    <>
      <Seo title={tr("Treatments", lang)} description={tr("Browse treatments at accredited Korean hospitals — bilingual descriptions, transparent pricing.", lang)} path="/treatments" />
      {/* #1 페이지명 */}
      <div style={{ background: BG_SOFT, borderBottom: `1px solid ${LINE}` }}>
        <div data-spec="tl-title" style={{ ...WRAP, padding: "44px 28px" }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: INK, margin: "0 0 8px" }}>{tr("Treatments", lang)}</h1>
          <p style={{ fontSize: 15, color: SUB, margin: 0, maxWidth: 620 }}>{tr("Browse every treatment across our partner hospitals — bilingual descriptions, transparent pricing, hospital details on each card.", lang)}</p>
        </div>
      </div>
      <div style={{ ...WRAP, padding: "28px 28px 80px" }}>
        {/* #3 검색창 */}
        <div data-spec="tl-search" style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${LINE}`, borderRadius: 12, padding: "4px 6px 4px 16px", background: "#fff", marginBottom: 22, maxWidth: 560 }}>
          <Search size={17} color={MUTE} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search treatments, hospitals, specialties", lang)} style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, padding: "11px 8px", color: INK, background: "transparent", minWidth: 0 }} />
          {q && <button onClick={() => setQ("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE, padding: 6 }}><X size={16} /></button>}
        </div>
        {/* #4 진료과 필터 (개수) */}
        <div data-spec="tl-catfilter" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: MUTE, minWidth: 64 }}><Filter size={14} />{tr("Category", lang)}</span>
          {cats.map((c) => (
            <Pill key={c} on={cat === c} onClick={() => setCat(c)}>
              {catLabel(c)} <span style={{ fontSize: 11, fontWeight: 800, color: cat === c ? "rgba(255,255,255,.85)" : MUTE, background: cat === c ? "rgba(255,255,255,.2)" : CLOUD, borderRadius: 999, padding: "1px 7px" }}>{catCount(c)}</span>
            </Pill>
          ))}
        </div>
        {/* #5 금액대 필터 */}
        <div data-spec="tl-pricefilter" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTE, minWidth: 64 }}>{lang === "ko" ? "금액대" : "Price"}</span>
          {PRICE_BANDS.map((b) => <Pill key={b.id} on={price === b.id} onClick={() => setPrice(b.id)}>{tx(b.label, lang)}</Pill>)}
        </div>
        {/* #6 정렬 + #8 결과 수 */}
        <div data-spec="tl-sort" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowDownUp size={15} color={MUTE} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 9, padding: "9px 12px", fontSize: 13.5, fontWeight: 600, color: INK, background: "#fff", cursor: "pointer" }}>
              {SORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: MUTE, letterSpacing: ".08em", textTransform: "uppercase" }}>{lang === "ko" ? `${list.length}개 시술` : `${list.length} treatments matched`}</span>
        </div>
        {/* 카드 그리드 */}
        <div data-spec="tl-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 22 }}>
          {list.map((p) => {
            const inCart = mounted && store.inCart(p.id);
            return (
              <div key={p.id} onClick={() => navigate(`/treatments/${p.id}`)} style={{ cursor: "pointer", background: "#fff", border: "1px solid #e7ecf5", borderRadius: 18, overflow: "hidden", boxShadow: "0 6px 22px rgba(15,23,42,.05)", display: "flex", flexDirection: "column" }}>
                {/* #10 이미지 + #9 진료과 태그 + #11 병원명 #12 시술명 오버레이 */}
                <div style={{ position: "relative", height: 190 }}>
                  <img src={p.hero} alt={tx(p.name, lang)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,15,44,.8), rgba(0,15,44,0) 56%)" }} />
                  <span style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 800, color: "#fff", background: "rgba(27,89,250,.92)", borderRadius: 999, padding: "4px 11px" }}>{tx(p.dept, lang)}</span>
                  <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10.5, fontWeight: 800, color: BLUE, background: "rgba(255,255,255,.95)", borderRadius: 999, padding: "4px 10px" }}>{tx(p.recovery, lang)}</span>
                  <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", opacity: .85 }}>{tx(p.hospital.name, lang)}</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{tx(p.name, lang)}</div>
                  </div>
                </div>
                <div style={{ padding: "15px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, margin: "0 0 12px" }}>{tx(p.summary, lang)}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: MUTE, marginBottom: 12 }}><MapPin size={12} /> {tx(p.hospital.city, lang)}</div>
                  <Money p={p} lang={lang} />
                  {/* #16/#17 장바구니 토글 (#18 카드 클릭과 분리 — stopPropagation) */}
                  <div style={{ marginTop: 14 }}>
                    {inCart ? (
                      <button onClick={(e) => { e.stopPropagation(); store.removeFromCart(p.id); }} style={{ ...btn("#eaf7ee", GREEN), width: "100%", border: `1px solid ${GREEN}`, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={16} /> {tr("Saved", lang)}</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); store.addToCart(p.id); }} style={{ ...btn(BLUE, "#fff"), width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Heart size={16} /> {tr("Save", lang)}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: MUTE }}>{tr("No treatments match your filters.", lang)}</div>}
      </div>
    </>
  );
}

/* =====================================================================
   시술 상세 (Figma 25개 요구사항)
   ===================================================================== */
export function TreatmentDetailPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const { id } = useParams();
  const p = byId(id);
  if (!p) return <NotFoundBlock lang={lang} navigate={navigate} />;
  return (
    <>
      {/* SEO/hreflang 은 프리렌더되도록 ClientOnly 밖에서 (실제 상품 페이지) */}
      <Seo title={`${tx(p.name, lang)} — ${tx(p.hospital.name, lang)}`} description={tx(p.summary, lang)} path={`/treatments/${p.id}`} />
      <ClientOnly>{() => <TreatmentDetailInner p={p} lang={lang} navigate={navigate} />}</ClientOnly>
    </>
  );
}
const NOTICES = {
  en: ["English medical report within 5 business days", "Phone consultation available after your visit", "CareBridge coordinator support throughout"],
  ko: ["영문 진료 리포트 영업일 5일 내 제공", "방문 후 전화 상담 가능", "전 과정 CareBridge 코디네이터 지원"],
};
function TreatmentDetailInner({ p, lang, navigate }) {
  store.useStore();
  useContent();
  const PROCEDURES = getCollection("procedures");
  const [qty, setQty] = useState(1);                 // #25 예약 수 입력
  const isIn = store.inCart(p.id);
  // #15 같은 병원의 다른 시술. 데이터상 병원당 시술 1개라 없으면 다른 시술로 fallback (어드민 연동 시 실제 병원 시술로 대체)
  const sameHospital = PROCEDURES.filter((x) => tx(x.hospital.name, lang) === tx(p.hospital.name, lang) && x.id !== p.id);
  const othersAtHospital = sameHospital.length > 0;
  const others = othersAtHospital ? sameHospital : PROCEDURES.filter((x) => x.id !== p.id).slice(0, 3);
  const dc = Math.round((1 - p.price / p.listPrice) * 100);
  const usdKrw = (n) => `$${usd(n).toLocaleString()} (≈ ₩${Number(n).toLocaleString()})`;
  const Card = ({ title, spec, children }) => (
    <div data-spec={spec} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
      {title && <h3 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: "0 0 14px" }}>{title}</h3>}
      {children}
    </div>
  );
  return (
    <>
      {/* #1-4 히어로: 병원 이미지 가로 배너 + 진료과 태그·병원명·시술명 오버레이 */}
      <div data-spec="td-hero" style={{ position: "relative", background: NAVY }}>
        <img src={p.hero} alt={tx(p.name, lang)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,15,44,.88), rgba(0,15,44,.4))" }} />
        <div style={{ ...WRAP, position: "relative", padding: "36px 28px 44px" }}>
          <button onClick={() => navigate("/treatments")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,.75)", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}><ArrowLeft size={15} /> {tr("All treatments", lang)}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "20px 0 14px" }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "#fff", background: "rgba(27,89,250,.92)", borderRadius: 999, padding: "5px 12px" }}>{tx(p.dept, lang)}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)" }}><MapPin size={14} /> {tx(p.hospital.name, lang)}</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 4.4vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>{tx(p.name, lang)}</h1>
        </div>
      </div>
      <div style={{ ...WRAP, padding: "28px 28px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "start" }} className="g-2">
          {/* main */}
          <div>
            {/* #5 시술 설명 (Overview) */}
            <Card title="Overview" spec="td-overview">
              <p style={{ fontSize: 15.5, color: SUB, lineHeight: 1.75, margin: 0 }}>{tx(p.summary, lang)}</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: MUTE, marginTop: 14 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={14} /> {tx(p.duration, lang)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {tx(p.hospital.city, lang)}</span>
              </div>
            </Card>
            {/* #6-9 비포/애프터 (등록된 경우만) + 소요기간 */}
            {p.before && p.after && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <figure style={{ margin: 0, position: "relative" }}><img src={p.before} alt="before" style={baImg} /><figcaption style={baCap}>{tr("BEFORE", lang)}</figcaption></figure>
                <figure style={{ margin: 0, position: "relative" }}><img src={p.after} alt="after" style={baImg} /><figcaption style={{ ...baCap, color: GREEN }}>{tx(p.recovery, lang)}</figcaption></figure>
              </div>
            )}
            {/* #10 포함항목 */}
            <Card title={tr("What's included", lang)} spec="td-includes">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 18px" }} className="g-2">{tx(p.includes, lang).map((x, i) => <div key={i} style={incl}><Check size={16} color={BLUE} /> {x}</div>)}</div>
            </Card>
            {/* #11 옵션항목 (그룹별 선택 개수 + 항목) */}
            {p.options?.length > 0 && (
              <Card title={tr("Options", lang)} spec="td-options">
                {p.options.map((g, i) => (
                  <div key={i} style={{ background: SECTION_TINT, border: `1px solid #dbe5fb`, borderRadius: 12, padding: 16, marginBottom: i < p.options.length - 1 ? 10 : 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 8 }}>{tx(g.group, lang)} <span style={{ color: BLUE, fontWeight: 800 }}>· {lang === "ko" ? `${g.pick}개 선택` : `pick ${g.pick}`}</span></div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{tx(g.items, lang).map((it, j) => <span key={j} style={{ fontSize: 12.5, color: SUB, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 999, padding: "5px 12px" }}>{it}</span>)}</div>
                  </div>
                ))}
              </Card>
            )}
            {/* #12 진행 순서 */}
            <Card title={tr("How the day(s) flow", lang)} spec="td-steps">
              <div style={{ display: "grid", gap: 12 }}>
                {tx(p.steps, lang).map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: SECTION_TINT, color: BLUE, fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center" }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: SUB, lineHeight: 1.5, paddingTop: 2 }}>{s}</span>
                  </div>
                ))}
              </div>
            </Card>
            {/* #13 도착 전 준비사항 + #14 안내사항 */}
            <div data-spec="td-prep" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="g-2">
              <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: "0 0 14px" }}>{tr("Prepare before you arrive", lang)}</h3>
                <div style={{ display: "grid", gap: 10 }}>{tx(p.prepare, lang).map((x, i) => <div key={i} style={{ ...incl, alignItems: "flex-start" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 7 }} /> {x}</div>)}</div>
              </div>
              <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: "0 0 14px" }}>{tr("Good to know", lang)}</h3>
                <div style={{ display: "grid", gap: 10 }}>{(NOTICES[lang] || NOTICES.en).map((x, i) => <div key={i} style={{ ...incl, alignItems: "flex-start" }}><Check size={15} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} /> {x}</div>)}</div>
              </div>
            </div>
            {/* #15 해당 병원에 등록된 다른 시술 (진료과·시술명·금액) */}
            {others.length > 0 && (
              <div data-spec="td-others" style={{ marginTop: 18 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: "0 0 14px" }}>{othersAtHospital
                  ? (lang === "ko" ? `이 병원의 다른 시술 · ${tx(p.hospital.name, lang)}` : `Other treatments at this hospital · ${tx(p.hospital.name, lang)}`)
                  : (tr("Other treatments you may like", lang))}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                  {others.map((o) => (
                    <button key={o.id} onClick={() => navigate(`/treatments/${o.id}`)} style={{ textAlign: "start", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, cursor: "pointer" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em" }}>{tx(o.dept, lang)}</div>
                      <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: INK, margin: "4px 0 6px" }}>{tx(o.name, lang)}</div>
                      {!othersAtHospital && <div style={{ fontSize: 11.5, color: MUTE, marginBottom: 8 }}><MapPin size={11} /> {tx(o.hospital.name, lang)}</div>}
                      <Money p={o} lang={lang} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* #24 우측 고정(플로팅) 금액·CTA 카드 */}
          <div data-spec="td-book" style={{ position: "sticky", top: 90 }}>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 18, padding: 24, boxShadow: "0 8px 28px rgba(15,23,42,.08)" }}>
              {/* #16 금액: 정가 취소선 + 케어브릿지 강조 + USD 병기 + 할인율 */}
              <div style={{ fontSize: 11, fontWeight: 800, color: MUTE, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>{tr("Your rate", lang)}</div>
              <div style={{ fontSize: 13, color: "#9aa7bd", textDecoration: "line-through" }}>{tr("List ", lang)}{usdKrw(p.listPrice)}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600 }}>{tr("CareBridge rate", lang)}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: BLUE }}>{usdKrw(p.price)}</span>
                  {dc > 0 && <span style={{ fontSize: 12.5, fontWeight: 800, color: ACCENT }}>{dc}%↓</span>}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: MUTE, marginTop: 6 }}>{lang === "ko" ? `당일 환율 ₩${KRW_PER_USD.toLocaleString()}/USD` : `at ₩${KRW_PER_USD.toLocaleString()}/USD`}</div>
              {/* #25 예약 수 입력 (가족 동반 예약) */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 8 }}>{tr("How many bookings do you need?", lang)}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: `1px solid ${LINE}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: SUB }}>{tr("Bookings", lang)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={stepBtn}><Minus size={14} /></button>
                    <span style={{ fontSize: 15, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} style={stepBtn}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              {/* #19-20 장바구니 버튼 (담김 → 장바구니 보기) */}
              {isIn ? (
                <button onClick={() => navigate("/cart")} style={{ ...btn("#eaf7ee", GREEN), width: "100%", border: `1px solid ${GREEN}`, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Check size={16} /> {tr("Saved — View saved", lang)} <ChevronRight size={15} /></button>
              ) : (
                <button onClick={() => store.addToCart(p.id, qty)} style={{ ...btn("#fff", BLUE), width: "100%", border: `1px solid ${BLUE}`, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Heart size={16} /> {tr("Save", lang)}</button>
              )}
              {/* #21 예약신청 → 예약 페이지 */}
              <button onClick={() => navigate(`/booking?treatment=${p.id}&qty=${qty}`)} style={{ ...btn(BLUE, "#fff"), width: "100%", marginTop: 10 }}>{tr("Book this treatment now", lang)} <ChevronRight size={15} /></button>
            </div>
            {/* #23 PERFORMED AT — 병원 상세 이동 (정사각 이미지·병원명·위치) */}
            <button data-spec="td-hospital" onClick={() => navigate("/providers")} style={{ width: "100%", textAlign: "start", cursor: "pointer", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, marginTop: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <img src={p.hospital.square} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: MUTE, letterSpacing: ".1em", textTransform: "uppercase" }}>{tr("Performed at", lang)}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{tx(p.hospital.name, lang)}</div>
                <div style={{ fontSize: 12, color: SUB }}>{tx(p.hospital.city, lang)}</div>
              </div>
              <ChevronRight size={18} color={MUTE} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
const baImg = { width: "100%", height: 220, objectFit: "cover", borderRadius: 12, display: "block" };
const baCap = { fontSize: 11, fontWeight: 800, color: INK, marginTop: 6 };
const incl = { display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: SUB };
const backLink = { border: "none", background: "transparent", cursor: "pointer", color: SUB, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 16, padding: 0 };
const stepBtn = { width: 28, height: 28, borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center", color: INK };

function NotFoundBlock({ lang, navigate }) {
  return <div style={{ ...WRAP, padding: "90px 28px", textAlign: "center" }}><p style={{ color: MUTE }}>{tr("Treatment not found.", lang)}</p><button onClick={() => navigate("/treatments")} style={{ ...btn(BLUE, "#fff") }}>{tr("Back to list", lang)}</button></div>;
}

/* =====================================================================
   장바구니 (Figma: 항목·수량·금액·예약 버튼 활성/비활성·삭제)
   ===================================================================== */
export function CartPage() {
  const { lang, navigate } = useOutletContext();
  return <ClientOnly>{() => <CartInner lang={lang} navigate={navigate} />}</ClientOnly>;
}
const hasCount = (c) => c.qty != null && c.qty !== "" && Number(c.qty) >= 1;
function CartInner({ lang, navigate }) {
  store.useStore();
  const [warnId, setWarnId] = useState(null);
  const cart = store.getCart();
  const items = cart.map((c) => ({ ...c, p: byId(c.procedureId) })).filter((c) => c.p);
  const ko = lang === "ko";

  // 예약 신청 희망(체크 + 인원수 입력) 항목
  const wanted = items.filter((c) => c.wanted && hasCount(c));
  const subtotal = wanted.reduce((s, c) => s + c.p.price * (c.qty || 1), 0);

  // 병원 단위 그룹 = 생성될 예약번호 (같은 병원은 하나로 번들)
  const groups = [];
  wanted.forEach((c) => {
    const key = tx(c.p.hospital.name, "en");
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, name: c.p.hospital.name, count: 0 }; groups.push(g); }
    g.count += 1;
  });

  const toggleWanted = (c) => {
    if (c.wanted) { store.setCartWanted(c.procedureId, false); return; }
    if (!hasCount(c)) { setWarnId(c.procedureId); return; }   // ⑤ 인원수 먼저 입력 안내
    store.setCartWanted(c.procedureId, true); setWarnId(null);
  };
  const onCount = (c, raw) => {
    const v = String(raw).replace(/[^0-9]/g, "");            // ⑦ 숫자만
    store.setCartQty(c.procedureId, v === "" ? "" : parseInt(v, 10));
    if (v !== "") setWarnId((w) => (w === c.procedureId ? null : w));
  };

  const canContinue = wanted.length > 0;                       // ⑫ 희망 1개 이상이어야 활성
  const countLabel = ko ? "몇 명의 예약이 필요한가요?" : "How many reservations?";

  return (
    <>
      <Seo title={UI[lang].cart} path="/cart" noindex />
      <div style={{ ...WRAP, maxWidth: 1100, padding: "44px 28px 80px" }}>
        <div data-spec="cr-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, color: INK, margin: 0 }}>{ko ? "관심시술" : "Saved treatments"}</h1>
            {items.length > 0 && (
              <p style={{ fontSize: 13.5, color: MUTE, margin: "8px 0 0", maxWidth: 560, lineHeight: 1.5 }}>
                {ko ? "예약을 원하는 시술을 선택하고 인원수를 입력하세요. 같은 병원의 시술은 하나의 예약번호로 묶입니다." : "Select the treatments you want and enter how many reservations you need. Treatments at the same hospital are bundled into one reservation number."}
              </p>
            )}
          </div>
          {items.length > 0 && (   /* ⑩ 장바구니 총 상품 수 */
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: BLUE_SOFT, color: BLUE, fontWeight: 700, fontSize: 12.5, padding: "7px 13px", borderRadius: 999, whiteSpace: "nowrap" }}>
              {items.length} · {ko ? "시술" : "Treatments"}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTE }}>
            <Heart size={40} style={{ opacity: .4 }} />
            <p>{ko ? "관심시술이 비어 있습니다." : "No saved treatments yet."}</p>
            <button onClick={() => navigate("/treatments")} style={{ ...btn(BLUE, "#fff") }}>{ko ? "시술 둘러보기" : "Browse treatments"}</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px, 340px)", gap: 24, alignItems: "start" }}>
            {/* 좌측: 시술 카드 목록 */}
            <div data-spec="cr-items" style={{ display: "grid", gap: 14, minWidth: 0 }}>
              {items.map((c) => {
                const checkable = hasCount(c);
                const on = Boolean(c.wanted) && checkable;
                const lineTotal = c.p.price * (c.qty || 1);
                return (
                  <div key={c.procedureId} style={{ background: "#fff", border: `1px solid ${on ? BLUE : LINE}`, borderRadius: 14, padding: 16, transition: "border-color .15s", boxShadow: on ? "0 0 0 1px " + BLUE : "none" }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <img src={c.p.hospital.square} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />{/* ① 정사각 병원 이미지 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: MUTE, textTransform: "uppercase" }}>{tx(c.p.dept, lang)}</div>{/* ② 카테고리 */}
                        <div style={{ fontSize: 16, fontWeight: 800, color: INK, margin: "2px 0 2px" }}>{tx(c.p.name, lang)}</div>{/* ④ 시술명 */}
                        <div style={{ fontSize: 12.5, color: SUB }}>{tx(c.p.hospital.name, lang)}</div>{/* ③ 병원명 */}
                      </div>
                      {/* ⑤ 예약 신청 희망 체크박스 + ⑥ 제거 */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
                        <button onClick={() => toggleWanted(c)} aria-pressed={on} title={ko ? "예약 신청 희망" : "Request this"}
                          style={{ width: 26, height: 26, borderRadius: 7, border: `2px solid ${on ? BLUE : (checkable ? EDGE : LINE)}`, background: on ? BLUE : "#fff", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                          {on && <Check size={16} strokeWidth={3.2} />}
                        </button>
                        <button onClick={() => store.removeFromCart(c.procedureId)} title={ko ? "삭제" : "Remove"}
                          style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, padding: 0 }}>
                          <Trash2 size={15} /> {ko ? "삭제" : "Remove"}
                        </button>
                      </div>
                    </div>
                    {/* 하단: ⑦ 인원수 입력 + ⑧ 금액 */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: SUB, fontWeight: 600, marginBottom: 6 }}>{countLabel}</label>
                        <input type="text" inputMode="numeric" value={c.qty ?? ""} onChange={(e) => onCount(c, e.target.value)} placeholder={ko ? "인원수" : "e.g. 1"}
                          style={{ width: 120, padding: "10px 12px", border: `1px solid ${warnId === c.procedureId ? ACCENT : EDGE}`, borderRadius: 8, fontSize: 14, color: INK, outline: "none", fontFamily: DISPLAY }} />
                        {warnId === c.procedureId && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: ACCENT, fontSize: 11.5, marginTop: 6 }}>
                            <AlertCircle size={13} /> {ko ? "예약 인원수를 먼저 입력해 주세요." : "Enter the number of reservations first."}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: BLUE }}>${usd(lineTotal).toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: SUB }}>≈ {won(lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 우측: 예약 그룹핑 + 합계 (sticky) */}
            <aside style={{ position: "sticky", top: 20, display: "grid", gap: 16, minWidth: 0 }}>
              {/* ⑨⑪ RESERVATION GROUPING */}
              <div data-spec="cr-grouping" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: MUTE, textTransform: "uppercase", marginBottom: 10 }}>{ko ? "예약번호 묶음" : "Reservation grouping"}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: groups.length ? BLUE : FAINT }}>{groups.length}</span>
                  <span style={{ fontSize: 13, color: SUB }}>{ko ? "개의 예약번호가 생성됩니다" : groups.length === 1 ? "reservation number will be created" : "reservation number(s) will be created"}</span>
                </div>
                <p style={{ fontSize: 12, color: MUTE, margin: "0 0 14px" }}>{ko ? "같은 병원의 시술끼리 묶입니다." : "Bundled by hospital."}</p>
                {groups.length === 0 ? (
                  <div style={{ background: BG_SOFT, border: `1px dashed ${EDGE}`, borderRadius: 12, padding: "16px 14px", fontSize: 12.5, color: MUTE, textAlign: "center" }}>
                    {ko ? "예약을 원하는 시술을 체크하세요." : "Check the treatments you'd like to reserve."}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {groups.map((g, i) => (
                      <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 12, background: BLUE_SOFT, border: `1px solid ${BLUE_100}`, borderRadius: 12, padding: "12px 14px" }}>
                        <span style={{ width: 24, height: 24, borderRadius: 999, background: BLUE, color: "#fff", fontSize: 12.5, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx(g.name, lang)}</div>
                          <div style={{ fontSize: 11.5, color: SUB }}>{g.count} × {ko ? "시술" : "Treatments"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 합계 + ⑫ 진행 버튼 */}
              <div data-spec="cr-total" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: SUB, marginBottom: 10 }}>
                  <span>{ko ? "상품 합계" : "Items subtotal"}</span>
                  <span style={{ fontWeight: 600, color: INK }}>${usd(subtotal).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{ko ? "예상 합계" : "Estimated grand total"}</span>
                  <span style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: INK }}>${usd(subtotal).toLocaleString()}</span>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: SUB, marginTop: 2 }}>≈ {won(subtotal)}</div>
                <button disabled={!canContinue} onClick={() => canContinue && navigate(`/booking?from=cart`)}
                  style={{ ...btn(canContinue ? BLUE : CLOUD, canContinue ? "#fff" : MUTE), width: "100%", marginTop: 16, cursor: canContinue ? "pointer" : "not-allowed" }}>
                  {canContinue ? UI[lang].reserve : (ko ? "예약할 시술을 선택하세요" : "Select treatments to continue")}
                </button>
                <p style={{ fontSize: 11, color: MUTE, margin: "12px 0 0", lineHeight: 1.5 }}>
                  {ko ? "방문 희망일은 다음 예약신청 단계에서 선택합니다. 결제 안내는 병원 확정 후 CareBridge CS가 발송합니다." : "Pick your visit date in the next step. Payment instructions are sent by CareBridge CS after hospital confirmation."}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

/* =====================================================================
   예약 신청 (Figma 38개 — 복수 카드·자동입력·임시저장·항공/관광 제거·공항픽업)
   ===================================================================== */
const NATIONALITIES = [
  { en: "United States", ko: "미국" }, { en: "Korea", ko: "한국" }, { en: "Japan", ko: "일본" }, { en: "China", ko: "중국" },
  { en: "Thailand", ko: "태국" }, { en: "Russia", ko: "러시아" }, { en: "UAE", ko: "UAE" }, { en: "Other", ko: "기타" },
];
const INTERPRETERS = [
  { en: "English", ko: "영어" }, { en: "Japanese", ko: "일본어" }, { en: "Chinese", ko: "중국어" },
  { en: "Russian", ko: "러시아어" }, { en: "Thai", ko: "태국어" }, { en: "Vietnamese", ko: "베트남어" }, { en: "Arabic", ko: "아랍어" },
];
const GENDERS = { en: ["Male", "Female", "Transgender (MtF)", "Transgender (FtM)"], ko: ["남성", "여성", "트랜스젠더(남→여)", "트랜스젠더(여→남)"] };
const blankCustomer = (profile) => ({
  bookingFor: "self", fullName: profile?.fullName || "", email: profile?.email || "", phone: profile?.phone || "", countryCode: profile?.countryCode || "+1",
  dob: "", gender: "", nationality: "", passportNo: "", interpreter: "", history: "", meds: "", allergy: "", memo: "",
  arrival: "", departure: "", d1: "", t1: "any", d2: "", t2: "any", selectedOptions: {}, airportPickup: false, hotel: false,
});
// #12 여권번호는 선택항목 — 작성완료 조건에서 제외 (주요 이탈 원인)
const cardComplete = (c) => Boolean(c.fullName && c.d1);
// #20 옵션 그룹별 정확한 개수 선택 여부
const optionsSatisfied = (c, proc) => (proc.options || []).every((g, gi) => (c.selectedOptions?.[gi]?.length || 0) === g.pick);

export function BookingPage() {
  const { lang, navigate } = useOutletContext();
  return <ClientOnly>{() => <BookingInner lang={lang} navigate={navigate} />}</ClientOnly>;
}
function BookingInner({ lang, navigate }) {
  store.useStore();
  const [sp] = useSearchParams();
  const profile = store.getProfile();
  // 예약 대상 = treatment 쿼리 또는 장바구니 전체
  const fromCart = sp.get("from") === "cart";
  const tId = sp.get("treatment");
  const targets = fromCart ? store.getCart().filter((c) => c.wanted).map((c) => ({ p: byId(c.procedureId), qty: c.qty || 1 })).filter((t) => t.p)
    : (byId(tId) ? [{ p: byId(tId), qty: Math.max(1, parseInt(sp.get("qty") || "1", 10)) }] : []);
  const totalCards = targets.reduce((s, t) => s + t.qty, 0) || 1;
  // 카드별 입력 (예약 수만큼)
  const [cards, setCards] = useState(() => Array.from({ length: totalCards }, () => blankCustomer(profile)));
  const [active, setActive] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [err, setErr] = useState("");
  if (targets.length === 0) return <NotFoundBlock lang={lang} navigate={navigate} />;
  // 카드 인덱스 → 시술 매핑
  const cardProc = [];
  targets.forEach((t) => { for (let i = 0; i < t.qty; i++) cardProc.push(t.p); });
  const proc = cardProc[active] || targets[0].p;
  const setField = (k, v) => setCards((cs) => cs.map((c, i) => (i === active ? { ...c, [k]: v } : c)));
  const cur = cards[active];

  // 자동 저장(임시저장) — 입력 변경 시 draft 로 보관
  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => store.upsertBooking({ id: "draft_current", status: "draft", procedureId: targets[0].p.id, cards, totalCards, createdAt: "now" }), 600);
    return () => clearTimeout(t);
  }, [cards]); // eslint-disable-line

  const submit = () => {
    // #20 옵션 그룹별 선택 개수가 맞지 않으면 예약완료 불가
    const badIdx = cards.findIndex((c, i) => !optionsSatisfied(c, cardProc[i] || targets[0].p));
    if (badIdx >= 0) {
      setActive(badIdx);
      setErr(lang === "ko" ? `예약 ${badIdx + 1}의 옵션 항목을 그룹별 지정 개수만큼 선택해 주세요.` : `Select the required number of options for each group in Reservation ${badIdx + 1}.`);
      return;
    }
    setErr("");
    const id = store.upsertBooking({ status: "pending", no: store.genBookingNo(), procedureId: targets[0].p.id, treatmentName: tx(targets[0].p.name, lang), cards, totalCards, createdAt: "now" });
    if (fromCart) store.clearCart();
    setSubmitted(id);
  };

  if (submitted) {
    const usdKrw = (n) => `$${usd(n).toLocaleString()} (≈ ₩${Number(n).toLocaleString()})`;
    return (
      <div data-spec="bk-success" style={{ ...WRAP, maxWidth: 920, padding: "70px 28px 90px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: SECTION_TINT, color: GREEN, display: "grid", placeItems: "center", margin: "0 auto 18px" }}><CheckCircle2 size={32} /></div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: INK }}>{tr("Reservations submitted", lang)}</h1>
        <p style={{ fontSize: 14.5, color: SUB, lineHeight: 1.6, marginTop: 8 }}>{tr("Each reservation will be confirmed by the hospital separately.", lang)}</p>

        <div style={{ display: "grid", gridTemplateColumns: cards.length > 1 ? "repeat(auto-fit, minmax(360px, 1fr))" : "minmax(360px, 560px)", gap: 18, marginTop: 30, justifyContent: "center", textAlign: "start" }}>
          {cards.map((c, i) => {
            const cp = cardProc[i] || targets[0].p;
            return (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 18 }}>
                {/* 1. 병원 대표 이미지 (정사각형) */}
                <img src={cp.hospital.square} alt="" style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 2. 예약 상태 */}
                  <span style={{ display: "inline-block", fontSize: 12, fontWeight: 800, color: "#9a6a00", background: "#fdf2d8", borderRadius: 999, padding: "4px 12px" }}>{tr("Waiting for hospital", lang)}</span>
                  {/* 4. 금액: 정가 취소선 + 케어브릿지 금액 강조 (USD 병기) */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12.5, color: "#9aa7bd", textDecoration: "line-through" }}>{tr("List ", lang)}{usdKrw(cp.listPrice)}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: INK, marginTop: 2 }}>{tr("CareBridge price ", lang)}<span style={{ color: BLUE }}>{usdKrw(cp.price)}</span></div>
                  </div>
                  {/* 5. 병원명 */}
                  <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginTop: 12 }}>{tx(cp.hospital.name, lang)}</div>
                  {/* 6. 예약희망일 (1지망) */}
                  <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>{c.d1 || (tr("Date TBD", lang))}</div>
                  {/* 7. 고객명 (예약 페이지에서 작성한 병원 방문 고객명) */}
                  <div style={{ fontSize: 13, color: SUB, marginTop: 2 }}>{c.fullName || (tr("Name not provided", lang))}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 8. 예약내역 페이지로 이동 */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <button onClick={() => navigate("/mypage?tab=bookings")} style={{ ...btn(BLUE, "#fff"), padding: "14px 28px", display: "inline-flex", alignItems: "center", gap: 8 }}>{tr("View all reservations", lang)} <ChevronRight size={18} /></button>
        </div>
      </div>
    );
  }

  const Field = ({ label, children, hint }) => (
    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: INK }}>{label}
      <div style={{ marginTop: 6 }}>{children}</div>
      {hint && <div style={{ fontSize: 11.5, color: MUTE, marginTop: 4 }}>{hint}</div>}
    </label>
  );
  const inp = { width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <>
      <Seo title={tr("Booking request", lang)} path="/booking" noindex />
      <div style={{ ...WRAP, maxWidth: 1000, padding: "36px 28px 80px" }}>
        <button onClick={() => navigate(-1)} style={backLink}><ArrowLeft size={16} /> {tr("Back", lang)}</button>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 800, color: INK, marginBottom: 6 }}>{tr("Booking request", lang)}</h1>
        <p style={{ fontSize: 13.5, color: SUB, margin: "0 0 8px" }}>{tx(targets[0].p.name, lang)} · {tx(targets[0].p.hospital.name, lang)} — <b style={{ color: BLUE }}>${usd(targets[0].p.price).toLocaleString()}</b> <span style={{ color: SUB }}>≈ {won(targets[0].p.price)}</span></p>
        <p style={{ fontSize: 12.5, color: GREEN, margin: "0 0 22px" }}><Check size={13} /> {tr("Your entries autosave as a draft in My bookings.", lang)}</p>

        {/* 예약 신청 개수 + 카드별 작성 완료 표기 */}
        <div data-spec="bk-tabs" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {cards.map((c, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, cursor: "pointer", background: active === i ? BLUE : "#fff", color: active === i ? "#fff" : INK, border: `1px solid ${active === i ? BLUE : LINE}` }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{lang === "ko" ? `예약 ${i + 1}` : `Reservation ${i + 1}`}</span>
              {cardComplete(c) ? <CheckCircle2 size={15} color={active === i ? "#fff" : GREEN} /> : <span style={{ width: 9, height: 9, borderRadius: "50%", background: active === i ? "rgba(255,255,255,.6)" : "#f5a623" }} />}
            </button>
          ))}
          <span style={{ fontSize: 12.5, color: MUTE, alignSelf: "center" }}>{lang === "ko" ? `총 ${cards.length}건` : `${cards.length} total`}</span>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: BLUE, marginBottom: 14 }}>{lang === "ko" ? `예약 ${active + 1} · ${tx(proc.name, lang)}` : `Reservation ${active + 1} · ${tx(proc.name, lang)}`}</div>
          {/* #5 본인/대리 예약 구분 */}
          <SubTitle>{tr("Who is this booking for?", lang)}</SubTitle>
          <div data-spec="bk-who" style={{ display: "inline-flex", background: CLOUD, borderRadius: 10, padding: 3, marginBottom: 18 }}>
            {[["self", tr("For myself", lang)], ["proxy", tr("For someone else", lang)]].map(([v, label]) => {
              const on = (cur.bookingFor || "self") === v;
              return <button key={v} onClick={() => setField("bookingFor", v)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: on ? "#fff" : "transparent", color: on ? BLUE : SUB, boxShadow: on ? "0 1px 3px rgba(15,23,42,.1)" : "none" }}>{label}</button>;
            })}
          </div>
          {/* 고객 정보 (로그인 시 자동 입력) */}
          <SubTitle>{lang === "ko" ? (cur.bookingFor === "proxy" ? "방문자 정보" : "고객 정보") : (cur.bookingFor === "proxy" ? "Visitor info" : "Customer info")}</SubTitle>
          <div data-spec="bk-customer" style={grid2}>
            <Field label={tr("Full name (passport)", lang)}><input style={inp} value={cur.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="GILDONG HONG" /></Field>
            <Field label="Email"><input type="email" style={inp} value={cur.email} onChange={(e) => setField("email", e.target.value)} /></Field>
            <Field label={tr("Phone", lang)}><input type="tel" style={inp} value={cur.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+1 555 0100" /></Field>
            <Field label={tr("Date of birth", lang)}><input type="date" style={inp} value={cur.dob} onChange={(e) => setField("dob", e.target.value)} /></Field>
            <Field label={tr("Gender", lang)}><select style={inp} value={cur.gender} onChange={(e) => setField("gender", e.target.value)}><option value="">—</option>{(GENDERS[lang] || GENDERS.en).map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label={tr("Citizenship", lang)} hint={cur.nationality === "Korea" ? (tr("Korean nationals: national health insurance guidance applies.", lang)) : null}>
              <select style={inp} value={cur.nationality} onChange={(e) => setField("nationality", e.target.value)}><option value="">—</option>{NATIONALITIES.map((n) => <option key={n.en} value={n.en}>{tx(n, lang)}</option>)}</select>
            </Field>
            <Field label={tr("Passport no. (optional)", lang)}><input style={inp} value={cur.passportNo} onChange={(e) => setField("passportNo", e.target.value)} /></Field>
            <Field label={tr("Interpreter language", lang)}><select style={inp} value={cur.interpreter} onChange={(e) => setField("interpreter", e.target.value)}><option value="">—</option>{INTERPRETERS.map((n) => <option key={n.en} value={n.en}>{tx(n, lang)}</option>)}</select></Field>
          </div>
          <div style={{ ...grid2, marginTop: 12 }}>
            <Field label={tr("Medical & surgical history", lang)}><textarea rows={2} style={inp} value={cur.history} onChange={(e) => setField("history", e.target.value)} /></Field>
            <Field label={tr("Current medications", lang)}><textarea rows={2} style={inp} value={cur.meds} onChange={(e) => setField("meds", e.target.value)} /></Field>
            <Field label={tr("Allergies", lang)}><textarea rows={2} style={inp} value={cur.allergy} onChange={(e) => setField("allergy", e.target.value)} /></Field>
            <Field label={tr("Memo (optional)", lang)}><textarea rows={2} style={inp} value={cur.memo} onChange={(e) => setField("memo", e.target.value)} /></Field>
          </div>

          {/* #19 해당 시술 포함항목 */}
          {tx(proc.includes, lang)?.length > 0 && (
            <>
              <SubTitle style={{ marginTop: 22 }}>{tr("What's included", lang)}</SubTitle>
              <div data-spec="bk-includes" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", background: SECTION_TINT, border: `1px solid #dbe5fb`, borderRadius: 12, padding: 16 }}>
                {tx(proc.includes, lang).map((x, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: SUB }}><Check size={15} color={BLUE} /> {x}</div>)}
              </div>
            </>
          )}
          {/* #20 해당 시술 옵션항목 — 그룹별 정확한 개수 선택 (미선택 시 예약완료 불가) */}
          {proc.options?.length > 0 && (
            <>
              <SubTitle style={{ marginTop: 22 }}>{tr("Options (selection required)", lang)}</SubTitle>
              {proc.options.map((g, gi) => {
                const sel = cur.selectedOptions?.[gi] || [];
                const done = sel.length === g.pick;
                const toggle = (it) => {
                  let next;
                  if (sel.includes(it)) next = sel.filter((x) => x !== it);
                  else if (g.pick === 1) next = [it];
                  else if (sel.length < g.pick) next = [...sel, it];
                  else next = sel;
                  setField("selectedOptions", { ...(cur.selectedOptions || {}), [gi]: next });
                };
                return (
                  <div key={gi} style={{ border: `1px solid ${done ? GREEN : "#dbe5fb"}`, background: SECTION_TINT, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{tx(g.group, lang)} <span style={{ color: BLUE, fontWeight: 800 }}>· {lang === "ko" ? `${g.pick}개 선택` : `pick ${g.pick}`}</span></span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: done ? GREEN : "#9a6a00" }}>{sel.length}/{g.pick}{done ? " ✓" : ""}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {tx(g.items, lang).map((it, ii) => {
                        const on = sel.includes(it);
                        return <button key={ii} type="button" onClick={() => toggle(it)} style={{ fontSize: 12.5, fontWeight: 600, cursor: "pointer", borderRadius: 999, padding: "6px 13px", background: on ? BLUE : "#fff", color: on ? "#fff" : SUB, border: `1px solid ${on ? BLUE : LINE}` }}>{on && <Check size={12} style={{ marginRight: 4 }} />}{it}</button>;
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 병원 예약 희망일 1·2지망 + 시간대 */}
          <SubTitle style={{ marginTop: 22 }}>{tr("Hospital reservation", lang)}</SubTitle>
          <div data-spec="bk-schedule" style={grid2}>
            <Field label={tr("Preferred date (1st)", lang)}><input type="date" style={inp} value={cur.d1} onChange={(e) => setField("d1", e.target.value)} /></Field>
            <Field label={tr("Time (1st)", lang)}><TimeSel lang={lang} v={cur.t1} on={(v) => setField("t1", v)} /></Field>
            <Field label={tr("Preferred date (2nd)", lang)}><input type="date" style={inp} value={cur.d2} onChange={(e) => setField("d2", e.target.value)} /></Field>
            <Field label={tr("Time (2nd)", lang)}><TimeSel lang={lang} v={cur.t2} on={(v) => setField("t2", v)} /></Field>
          </div>

          {/* 한국 체류 일정 */}
          <SubTitle style={{ marginTop: 22 }}>{tr("Stay in Korea", lang)}</SubTitle>
          <div data-spec="bk-stay" style={grid2}>
            <Field label={tr("Arrival in Korea", lang)}><input type="date" style={inp} value={cur.arrival} onChange={(e) => setField("arrival", e.target.value)} /></Field>
            <Field label={tr("Departure from Korea", lang)}><input type="date" style={inp} value={cur.departure} onChange={(e) => setField("departure", e.target.value)} /></Field>
          </div>

          {/* #22 부가 서비스: 호텔 예약 + 공항 픽업 (항공/관광 미지원) */}
          <SubTitle style={{ marginTop: 22 }}>{tr("Add-ons (optional)", lang)}</SubTitle>
          <div data-spec="bk-addons" style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: INK, background: SECTION_TINT, border: `1px solid #dbe5fb`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
              <input type="checkbox" checked={cur.hotel} onChange={(e) => setField("hotel", e.target.checked)} />
              {tr("I need hotel booking assistance", lang)}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: INK, background: SECTION_TINT, border: `1px solid #dbe5fb`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
              <input type="checkbox" checked={cur.airportPickup} onChange={(e) => setField("airportPickup", e.target.checked)} />
              {tr("I need airport pickup assistance", lang)}
            </label>
          </div>
        </div>

        {err && <p style={{ fontSize: 13, color: ACCENT, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={15} /> {err}</p>}
        <div data-spec="bk-submit" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: MUTE }}>{tr("You can edit from My bookings after submitting.", lang)}</span>
          <button onClick={submit} style={{ ...btn(BLUE, "#fff"), padding: "14px 28px" }}>{tr("Submit booking request", lang)}</button>
        </div>
      </div>
    </>
  );
}
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
function SubTitle({ children, style }) { return <div style={{ fontSize: 12, fontWeight: 800, color: MUTE, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12, ...style }}>{children}</div>; }
function TimeSel({ lang, v, on }) {
  const opts = lang === "ko" ? { any: "무관", am: "오전", pm: "오후" } : { any: "Any", am: "Morning", pm: "Afternoon" };
  return <select style={{ width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, boxSizing: "border-box" }} value={v} onChange={(e) => on(e.target.value)}>{Object.entries(opts).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>;
}

/* =====================================================================
   마이페이지 (회원정보 / 예약내역 / 장바구니) + 예약내역 상세(상태흐름)
   ===================================================================== */
export function MyPage() {
  const { lang, navigate } = useOutletContext();
  return <ClientOnly>{() => <MyPageInner lang={lang} navigate={navigate} />}</ClientOnly>;
}
function MyPageInner({ lang, navigate }) {
  store.useStore();
  const [sp, setSp] = useSearchParams();
  const user = store.getUser();
  if (!user) { navigate("/account"); return null; }
  const tab = sp.get("tab") || "info";
  const setTab = (t) => setSp({ tab: t });
  const detailId = sp.get("booking");
  if (detailId) return <BookingDetail id={detailId} lang={lang} navigate={navigate} onBack={() => setSp({ tab: "bookings" })} />;
  const TABS = [["bookings", tr("My Reservations", lang)], ["cart", lang === "ko" ? "관심시술" : "Saved"], ["info", tr("My Profile", lang)]];
  return (
    <>
      <Seo title={UI[lang].myaccount} path="/mypage" noindex />
      <div style={{ ...WRAP, maxWidth: 980, padding: "40px 28px 80px" }}>
        <div data-spec="my-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 800, color: INK, margin: 0 }}>{tr("My Page", lang)}</h1>
            {user?.email && <div style={{ fontSize: 13.5, color: MUTE, marginTop: 4 }}>{user.email}</div>}
          </div>
          <button onClick={() => { store.logout(); navigate("/"); }} style={{ ...viewMoreBtn }}>{tr("Sign out", lang)}</button>
        </div>
        <div data-spec="my-tabs" style={{ display: "flex", gap: 6, borderBottom: `1px solid ${LINE}`, marginBottom: 26 }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "12px 16px", fontSize: 14, fontWeight: 700, color: tab === id ? BLUE : SUB, borderBottom: `2px solid ${tab === id ? BLUE : "transparent"}`, marginBottom: -1 }}>{label}</button>
          ))}
        </div>
        {tab === "info" && <MemberInfo lang={lang} />}
        {tab === "bookings" && <BookingsList lang={lang} onOpen={(id) => setSp({ tab: "bookings", booking: id })} navigate={navigate} />}
        {tab === "cart" && <CartInner lang={lang} navigate={navigate} />}
      </div>
    </>
  );
}

/* 회원가입 정보 연동 / 수정 불가 필드 라벨 */
const lockTag = (lang) => (tr("from sign-up · locked", lang));
const GENDER_OPTS = [
  ["male", { ko: "남성", en: "Male" }], ["female", { ko: "여성", en: "Female" }],
  ["trans_mf", { ko: "트랜스젠더 (남→여)", en: "Transgender (M→F)" }], ["trans_fm", { ko: "트랜스젠더 (여→남)", en: "Transgender (F→M)" }],
];
const INTERP_OPTS = [
  ["en", { ko: "영어", en: "English" }], ["zh", { ko: "중국어", en: "Chinese" }], ["ja", { ko: "일본어", en: "Japanese" }],
  ["ru", { ko: "러시아어", en: "Russian" }], ["th", { ko: "태국어", en: "Thai" }], ["ar", { ko: "아랍어", en: "Arabic" }],
  ["none", { ko: "통역 필요 없음", en: "No interpreter needed" }],
];
const NATION_OPTS = [
  ["us", { ko: "미국", en: "USA" }], ["kr", { ko: "한국", en: "Korea" }], ["jp", { ko: "일본", en: "Japan" }],
  ["cn", { ko: "중국", en: "China" }], ["th", { ko: "태국", en: "Thailand" }], ["ru", { ko: "러시아", en: "Russia" }],
  ["ae", { ko: "UAE", en: "UAE" }], ["etc", { ko: "기타", en: "Other" }],
];

function MemberInfo({ lang }) {
  store.useStore();
  const p = store.getProfile() || {};
  const [edit, setEdit] = useState({});
  const [saved, setSaved] = useState(false);
  const val = (key) => (key in edit ? edit[key] : (p[key] ?? ""));
  const set = (key, v) => { setEdit((x) => ({ ...x, [key]: v })); setSaved(false); };

  // 회원가입 시 입력 — 분리 저장본 우선, 없으면 fullName 분해
  const nameParts = String(p.fullName || "").trim().split(/\s+/).filter(Boolean);
  const lockedName = { firstName: p.firstName || nameParts[0] || "", middleName: p.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : ""), lastName: p.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "") };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: INK, display: "block", marginBottom: 7 };
  const fieldBase = { width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, color: INK, fontFamily: "inherit", background: "#fff" };
  const lockedStyle = { ...fieldBase, background: BG_SOFT, color: MUTE, cursor: "not-allowed" };
  const opt = (t) => t[lang] ?? t.en;

  // ── 헬퍼는 컴포넌트가 아닌 "함수 호출"로 사용 (input 포커스 유지 목적) ──
  const lockedField = (label, value) => (
    <div>
      <label style={labelStyle}>{label} <span style={{ fontSize: 11, fontWeight: 600, color: MUTE }}>· {lockTag(lang)}</span></label>
      <input value={value || ""} disabled readOnly style={lockedStyle} />
    </div>
  );
  const textField = (label, fk, { type = "text", placeholder } = {}) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={val(fk)} placeholder={placeholder} onChange={(e) => set(fk, e.target.value)} style={fieldBase} />
    </div>
  );
  const selectField = (label, fk, opts, { note, placeholder } = {}) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={val(fk)} onChange={(e) => set(fk, e.target.value)} style={{ ...fieldBase, cursor: "pointer", appearance: "auto", color: val(fk) ? INK : MUTE }}>
        <option value="">{placeholder ?? "—"}</option>
        {opts.map(([v, t]) => <option key={v} value={v} style={{ color: INK }}>{opt(t)}</option>)}
      </select>
      {note && <div style={{ fontSize: 11.5, color: ACCENT, marginTop: 6, fontWeight: 600 }}>{note}</div>}
    </div>
  );
  const areaField = (label, fk, { rows = 3, span } = {}) => (
    <div style={span ? { gridColumn: "1 / -1" } : undefined}>
      <label style={labelStyle}>{label}</label>
      <textarea value={val(fk)} rows={rows} onChange={(e) => set(fk, e.target.value)} style={{ ...fieldBase, resize: "vertical", lineHeight: 1.5 }} />
    </div>
  );

  const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px 22px" };

  return (
    <div data-spec="my-info" style={{ maxWidth: 1000, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: "26px 28px" }}>
      <p style={{ fontSize: 14, color: SUB, margin: "0 0 22px", lineHeight: 1.6 }}>
        {tr("Complete your profile so coordinators can match covered programs and confirm coverage.", lang)}
      </p>

      {/* 이름 (가입정보 연동, 수정 불가) */}
      <div style={{ ...grid3, marginBottom: 20 }}>
        {lockedField("First name", lockedName.firstName)}
        {lockedField("Middle name", lockedName.middleName)}
        {lockedField("Last name", lockedName.lastName)}
      </div>

      {/* 이메일 · 연락처 · 생년월일 */}
      <div style={{ ...grid3, marginBottom: 20 }}>
        {lockedField(tr("Email (= account ID)", lang), p.email)}
        {textField(tr("Phone (with country code)", lang), "phone", { type: "tel", placeholder: "+1 010-0000-0000" })}
        <div>
          <label style={labelStyle}>{tr("Date of birth", lang)}</label>
          <input type="date" value={val("dob")} onChange={(e) => set("dob", e.target.value)} style={fieldBase} />
        </div>
      </div>

      {/* 성별 · 통역언어 · 국적 */}
      <div style={{ ...grid3, marginBottom: 20 }}>
        {selectField(tr("Gender", lang), "gender", GENDER_OPTS, { note: tr("※ Gender categories under review", lang) })}
        {selectField(tr("Interpreter language", lang), "interpreter", INTERP_OPTS, { placeholder: tr("e.g. English", lang) })}
        {selectField(tr("Citizenship", lang), "nationality", NATION_OPTS)}
      </div>

      {/* 여권번호 · 여권사본 · 추천코드 */}
      <div style={{ ...grid3, marginBottom: 20 }}>
        {textField(tr("Passport number", lang), "passportNo")}
        <div>
          <label style={labelStyle}>{tr("Passport copy", lang)}</label>
          <input type="file" accept="image/*,.pdf" onChange={(e) => set("passportFile", e.target.files?.[0]?.name || "")} style={{ ...fieldBase, padding: "9px 11px", cursor: "pointer" }} />
          {val("passportFile") && <div style={{ fontSize: 12, color: SUB, marginTop: 6 }}>{val("passportFile")}</div>}
        </div>
        {lockedField(tr("Referral code", lang), p.referralCode)}
      </div>

      {/* 병력/수술 이력 (전폭) */}
      <div style={{ marginBottom: 20 }}>
        {areaField(tr("Medical / surgical history", lang), "history", { rows: 4, span: true })}
      </div>

      {/* 복용약 · 알레르기 */}
      <div style={{ ...grid3, marginBottom: 24 }}>
        {areaField(lang === "ko" ? "현재 복용 중인 약" : "Current medications", "meds", { rows: 2 })}
        {areaField(tr("Allergies", lang), "allergy", { rows: 2 })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => { store.saveProfile(edit); setEdit({}); setSaved(true); }} style={{ ...btn(BLUE, "#fff") }}>{tr("Save profile", lang)}</button>
        {saved && <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>✓ {lang === "ko" ? "저장되었습니다" : "Saved"}</span>}
      </div>
    </div>
  );
}

function BookingsList({ lang, onOpen }) {
  store.useStore();
  const [draftOnly, setDraftOnly] = useState(false);   // #10 임시저장내역 필터
  const all = store.getBookings().filter((b) => b.id !== "draft_current" || (b.cards && b.cards.some((c) => c.fullName)));
  const draftCount = all.filter((b) => b.status === "draft").length;
  const bookings = draftOnly ? all.filter((b) => b.status === "draft") : all;
  const usdKrw = (n) => `$${usd(n).toLocaleString()} (≈ ₩${Number(n).toLocaleString()})`;
  const lab = (ko, en) => (lang === "ko" ? ko : en);
  const Row = ({ k, v }) => (
    <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}><span style={{ color: MUTE }}>{k} : </span>{v || "—"}</div>
  );
  return (
    <>
      {/* #10 임시저장내역 (논의 필요 — 현재는 draft 필터 토글로 구현) */}
      <div data-spec="my-bookings" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={() => setDraftOnly((v) => !v)} style={{ ...viewMoreBtn, background: draftOnly ? SECTION_TINT : "#fff", color: draftOnly ? BLUE : INK, borderColor: draftOnly ? BLUE : LINE }}>{lab("임시저장내역", "Drafts")}{draftCount ? ` (${draftCount})` : ""}</button>
      </div>
      {bookings.length === 0 ? (
        <div style={{ color: MUTE, padding: "40px 0", textAlign: "center" }}>{draftOnly ? lab("임시저장 내역이 없습니다.", "No drafts.") : lab("예약 내역이 없습니다.", "No bookings yet.")}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {bookings.map((b) => {
            const p = byId(b.procedureId); const st = store.STATUS[b.status] || store.STATUS.pending;
            const c0 = b.cards?.[0] || {};
            const total = (p?.price || 0) * (b.totalCards || 1);
            const totalList = (p?.listPrice || 0) * (b.totalCards || 1);
            const confirmed = b.status === "done" || b.status === "visited";
            return (
              <button key={b.id} onClick={() => onOpen(b.id)} style={{ textAlign: "start", display: "flex", gap: 16, alignItems: "flex-start", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, cursor: "pointer" }}>
                {/* #3 병원 대표 이미지 (정사각형) */}
                {p && <img src={p.hospital.square} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* #1 예약 상태 + 예약번호 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: st.color, borderRadius: 999, padding: "3px 10px" }}>{tx(st, lang)}</span>
                    {b.no && <span style={{ fontSize: 11.5, fontWeight: 700, color: MUTE }}>{b.no}</span>}
                    {b.status === "draft" && <span style={{ fontSize: 11, color: MUTE }}>{lab("임시저장 — 이어서 작성", "Draft — continue")}</span>}
                  </div>
                  {/* #4 시술명 */}
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: INK }}>{p ? tx(p.name, lang) : b.treatmentName}</div>
                  {/* #5 병원명 (+다건 표기) */}
                  <div style={{ fontSize: 12.5, color: SUB, marginBottom: 8 }}>{p ? tx(p.hospital.name, lang) : ""}{b.totalCards > 1 ? ` · ${lab(`${b.totalCards}건`, `${b.totalCards} people`)}` : ""}</div>
                  {/* #6·7·8·9 예약 희망일 1·2지망 / 확정일시 / 방문자 성함 */}
                  <Row k={lab("예약 희망일(1지망)", "Preferred date 1")} v={c0.d1} />
                  <Row k={lab("예약 희망일(2지망)", "Preferred date 2")} v={c0.d2} />
                  <Row k={lab("예약 확정 일시", "Confirmed")} v={confirmed ? `${c0.d1 || "—"} (KST)` : lab("확정 전", "Pending")} />
                  <Row k={lab("방문자 성함", "Visitor")} v={c0.fullName} />
                </div>
                {/* #2 금액: 정가 취소선 + 케어브릿지 강조 + USD 병기 */}
                {p && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 10.5, color: "#9aa7bd", textDecoration: "line-through", whiteSpace: "nowrap" }}>{usdKrw(totalList)}</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 800, color: BLUE, whiteSpace: "nowrap", marginTop: 2 }}>{usdKrw(total)}</div>
                    <ChevronRight size={18} color={MUTE} style={{ marginTop: 8 }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* 예약내역 상세 (스펙 1~7: 예약번호·상태·예약정보 전체·방문자정보 전체·플로우 메시지·수정요청·금액 KRW/USD) */
const TLABEL = (t, lang) => ({ any: tr("Any time", lang), am: tr("Morning", lang), pm: tr("Afternoon", lang) }[t] || (tr("Any time", lang)));
const dtLine = (d, t, lang) => (d ? `${d} · ${TLABEL(t, lang)}` : "—");
const FLOW = ["pending", "processing", "done", "visited"];
function flowMessage(status, lang) {
  return {
    pending: tr("CareBridge is reviewing your booking request.", lang),
    processing: tr("CareBridge is checking the schedule with the hospital.", lang),
    done: tr("Your hospital schedule is confirmed.", lang),
    visited: tr("How was your visit? Please leave a review.", lang),
    cancelled: tr("This booking was cancelled.", lang),
    draft: tr("Draft — please continue your booking.", lang),
  }[status] || "";
}

function BookingDetail({ id, lang, navigate, onBack }) {
  store.useStore();
  const b = store.getBooking(id);
  const [visitorIdx, setVisitorIdx] = useState(0);
  const [editForm, setEditForm] = useState(null);   // null = 닫힘
  if (!b) return <div style={{ color: MUTE, padding: "40px 0" }}>—</div>;
  const p = byId(b.procedureId);
  const st = store.STATUS[b.status] || store.STATUS.pending;
  const cards = b.cards?.length ? b.cards : [{}];
  const vi = Math.min(visitorIdx, cards.length - 1);
  const c = cards[vi] || {};
  const curIdx = FLOW.indexOf(b.status);
  const bookingNo = String(b.no || b.id || "—").toUpperCase();
  const total = (p?.price || 0) * (b.totalCards || 1);
  const confirmed = b.status === "done" || b.status === "visited";
  const isLive = !["cancelled", "visited", "draft"].includes(b.status);   // 수정·취소 가능 상태

  const openEdit = () => setEditForm({
    options: c.optionNote || "", d1: c.d1 || "", t1: c.t1 || "any", d2: c.d2 || "", t2: c.t2 || "any",
    history: c.history || "", meds: c.meds || "", allergy: c.allergy || "", memo: c.memo || "",
    arrival: c.arrival || "", departure: c.departure || "",
  });
  const submitEdit = () => { store.requestEdit(b.id, { visitorIdx: vi, ...editForm }); setEditForm(null); };

  /* 라벨/값 행 */
  const Row = ({ label, value, full, ltr }) => (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 12, padding: "10px 0", borderTop: `1px solid ${LINE}`, fontSize: 13.5, gridColumn: full ? "1 / -1" : "auto" }}>
      <span style={{ color: MUTE, fontWeight: 700 }}>{label}</span>
      <span dir={ltr ? "ltr" : undefined} style={{ color: value && value !== "—" ? INK : "#aab4c5", lineHeight: 1.5, whiteSpace: "pre-wrap", unicodeBidi: ltr ? "isolate" : undefined }}>{value || "—"}</span>
    </div>
  );
  const SectionTitle = ({ children, action }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 4px" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0 }}>{children}</h3>{action}
    </div>
  );
  const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16 };

  // 선택항목(있을시) — 시술에 옵션 그룹이 있으면 노출
  const optionText = p?.options?.length
    ? p.options.map((g) => `${tx(g.group, lang)} (${lang === "ko" ? `${g.pick}개 선택` : `pick ${g.pick}`})`).join("\n")
    : "—";

  return (
    <div style={{ ...WRAP, maxWidth: 980, padding: "32px clamp(20px, 4vw, 40px) 80px" }}>
      <button onClick={onBack} style={backLink}><ArrowLeft size={16} /> {tr("My bookings", lang)}</button>

      {/* 1. 예약번호 + 2. 예약상태 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: ".04em" }}>{tr("Booking no.", lang)}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>{bookingNo}</div>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff", background: st.color, borderRadius: 999, padding: "6px 14px" }}>{tx(st, lang)}</span>
      </div>

      {/* 5. 예약 플로우 (진행 순서·현재·남은 단계) + 상태별 메시지 */}
      {b.status === "cancelled" ? (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, background: "#fdeced", borderColor: "#f6c9cc" }}>
          <X size={18} color={st.color} /><span style={{ fontSize: 14, fontWeight: 700, color: st.color }}>{flowMessage("cancelled", lang)}</span>
        </div>
      ) : b.status === "draft" ? (
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: SECTION_TINT, borderColor: "#dbe5fb" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{flowMessage("draft", lang)}</span>
          <button onClick={() => navigate(`/booking?treatment=${b.procedureId}`)} style={{ ...btn(BLUE, "#fff"), padding: "10px 18px" }}>{tr("Continue", lang)}</button>
        </div>
      ) : (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 16, flexWrap: "wrap" }}>
            {FLOW.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, background: i < curIdx ? BLUE : i === curIdx ? BLUE : "#e7ecf5", color: i <= curIdx ? "#fff" : MUTE, boxShadow: i === curIdx ? "0 0 0 4px rgba(27,89,250,.15)" : "none" }}>
                    {i < curIdx ? <Check size={15} /> : i + 1}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: i <= curIdx ? INK : MUTE, textAlign: "center" }}>{tx(store.STATUS[s], lang)}</span>
                </div>
                {i < FLOW.length - 1 && <span style={{ flex: 1, height: 2, minWidth: 24, background: i < curIdx ? BLUE : "#e7ecf5", alignSelf: "flex-start", marginTop: 14 }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: SECTION_TINT, borderRadius: 10, padding: "12px 14px" }}>
            {b.status === "visited" ? <Star size={17} color={STAR} fill={STAR} /> : <Hourglass size={16} color={BLUE} />}
            <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{flowMessage(b.status, lang)}</span>
            {b.status === "visited" && (b.reviewed
              ? <span style={{ marginLeft: "auto", fontSize: 12.5, color: GREEN, fontWeight: 700 }}><Check size={13} /> {tr("Thanks for the review", lang)}</span>
              : <button onClick={() => store.leaveReview(b.id)} style={{ ...btn(BLUE, "#fff"), marginLeft: "auto", padding: "8px 16px", fontSize: 13 }}>{tr("Leave a review", lang)}</button>)}
          </div>
        </div>
      )}

      {/* 시술 헤더 + 7. 금액(원화기준 + 환율 USD 병기) */}
      <div style={{ ...card, display: "flex", gap: 16, alignItems: "center" }}>
        {p && <img src={p.hospital.square} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{p ? tx(p.name, lang) : b.treatmentName}</div>
          <div style={{ fontSize: 13, color: SUB }}>{p ? tx(p.hospital.name, lang) : ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: BLUE }}>${usd(total).toLocaleString()}</div>
          <div style={{ fontSize: 12.5, color: SUB }}>≈ {won(total)}</div>
          <div style={{ fontSize: 10.5, color: MUTE, marginTop: 2 }}>{lang === "ko" ? `당일 환율 ₩${KRW_PER_USD.toLocaleString()}/USD` : `at ₩${KRW_PER_USD.toLocaleString()}/USD`}</div>
        </div>
      </div>

      {/* 방문자 선택 (다건 예약 시) */}
      {cards.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {cards.map((cc, i) => (
            <button key={i} onClick={() => { setVisitorIdx(i); setEditForm(null); }} style={{ fontSize: 12.5, fontWeight: 700, cursor: "pointer", borderRadius: 999, padding: "7px 14px", background: vi === i ? BLUE : "#fff", color: vi === i ? "#fff" : SUB, border: `1px solid ${vi === i ? BLUE : LINE}` }}>
              {cc.fullName || (lang === "ko" ? `방문자 ${i + 1}` : `Visitor ${i + 1}`)}
            </button>
          ))}
        </div>
      )}

      {/* 3. 예약 정보 (전체 노출) */}
      <div data-spec="my-bkinfo" style={card}>
        <SectionTitle>{tr("Reservation", lang)}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="g-2">
          <Row label={lang === "ko" ? "카테고리" : "Category"} value={p ? tx(p.dept, lang) : "—"} />
          <Row label={tr("Hospital", lang)} value={p ? tx(p.hospital.name, lang) : "—"} />
          <Row label={tr("Treatment", lang)} value={p ? tx(p.name, lang) : b.treatmentName} />
          <Row label={tr("Reservations", lang)} value={`${b.totalCards || 1}`} />
          <Row label={tr("Included", lang)} value={p ? tx(p.includes, lang).join(", ") : "—"} full />
          <Row label={lang === "ko" ? "선택항목" : "Options"} value={optionText} full />
          <Row label={tr("Preferred date / time", lang)} value={dtLine(c.d1, c.t1, lang)} />
          <Row label={tr("Preferred date 2 / time", lang)} value={dtLine(c.d2, c.t2, lang)} />
          <Row label={tr("Confirmed date / time", lang)} value={confirmed ? dtLine(c.d1, c.t1, lang) : (tr("Pending", lang))} full />
        </div>
      </div>

      {/* 4. 방문자 정보 (전체 노출) */}
      <div data-spec="my-bkvisitor" style={card}>
        <SectionTitle>{tr("Visitor", lang)}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="g-2">
          <Row label={tr("Full name", lang)} value={c.fullName} />
          <Row label={tr("Email", lang)} value={c.email} ltr />
          <Row label={tr("Phone", lang)} value={c.phone ? `${c.countryCode || ""} ${c.phone}`.trim() : "—"} ltr />
          <Row label={tr("Date of birth", lang)} value={c.dob} />
          <Row label={tr("Gender", lang)} value={c.gender} />
          <Row label={tr("Citizenship", lang)} value={c.nationality} />
          <Row label={tr("Interpreter", lang)} value={c.interpreter} />
          <Row label={tr("Arrival in Korea", lang)} value={c.arrival} />
          <Row label={tr("Departure from Korea", lang)} value={c.departure} />
          <Row label={lang === "ko" ? "병력 / 수술이력" : "Medical / surgical history"} value={c.history} full />
          <Row label={lang === "ko" ? "현재 복용중인 약" : "Current medications"} value={c.meds} full />
          <Row label={tr("Allergies", lang)} value={c.allergy} full />
          <Row label={tr("Memo", lang)} value={c.memo} full />
        </div>
      </div>

      {/* 6. 수정하기 (어드민 승인 절차) */}
      {b.editRequested && !editForm && (
        <p style={{ fontSize: 13, color: BLUE, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}><Hourglass size={14} /> {tr("Edit request received — applied after admin approval.", lang)}</p>
      )}
      {isLive && !editForm && (
        <div data-spec="my-bkactions" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <button onClick={openEdit} style={{ ...btn(BLUE, "#fff"), padding: "11px 20px" }}><Pencil size={15} /> {tr("Request edit", lang)}</button>
          {b.cancelRequested
            ? <span style={{ fontSize: 13, color: ACCENT, alignSelf: "center" }}><AlertCircle size={14} /> {tr("Cancellation requested", lang)}</span>
            : <button onClick={() => store.requestCancel(b.id)} style={{ ...viewMoreBtn, color: ACCENT, borderColor: ACCENT, padding: "10px 18px" }}>{tr("Request cancellation", lang)}</button>}
        </div>
      )}
      {isLive && !editForm && (
        <p style={{ fontSize: 11.5, color: MUTE, marginTop: 4 }}>{tr("Customers can't change status directly. Edits and cancellations go through admin approval.", lang)}</p>
      )}

      {/* 수정 요청 폼 — 스펙 6의 수정 가능 항목만 */}
      {editForm && (
        <div style={card}>
          <SectionTitle action={<button onClick={() => setEditForm(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE }}><X size={18} /></button>}>{tr("Request an edit", lang)}</SectionTitle>
          <p style={{ fontSize: 12, color: MUTE, margin: "0 0 14px" }}>{tr("Only these fields can be edited; changes apply after admin approval.", lang)}</p>
          {(() => {
            const set = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
            const ei = { width: "100%", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, boxSizing: "border-box", fontFamily: "inherit" };
            const EF = ({ label, children }) => <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: INK, marginBottom: 12 }}>{label}<div style={{ marginTop: 6 }}>{children}</div></label>;
            return (
              <>
                <EF label={lang === "ko" ? "선택항목" : "Options"}><input style={ei} value={editForm.options} onChange={set("options")} placeholder={tr("Option change request", lang)} /></EF>
                <div style={grid2}>
                  <EF label={tr("Preferred date 1", lang)}><input type="date" style={ei} value={editForm.d1} onChange={set("d1")} /></EF>
                  <EF label={tr("Time 1", lang)}><TimeSel lang={lang} v={editForm.t1} on={(v) => setEditForm((f) => ({ ...f, t1: v }))} /></EF>
                  <EF label={tr("Preferred date 2", lang)}><input type="date" style={ei} value={editForm.d2} onChange={set("d2")} /></EF>
                  <EF label={tr("Time 2", lang)}><TimeSel lang={lang} v={editForm.t2} on={(v) => setEditForm((f) => ({ ...f, t2: v }))} /></EF>
                  <EF label={tr("Arrival in Korea", lang)}><input type="date" style={ei} value={editForm.arrival} onChange={set("arrival")} /></EF>
                  <EF label={tr("Departure from Korea", lang)}><input type="date" style={ei} value={editForm.departure} onChange={set("departure")} /></EF>
                </div>
                <EF label={lang === "ko" ? "병력 / 수술이력" : "Medical / surgical history"}><textarea rows={2} style={ei} value={editForm.history} onChange={set("history")} /></EF>
                <EF label={lang === "ko" ? "현재 복용중인 약" : "Current medications"}><textarea rows={2} style={ei} value={editForm.meds} onChange={set("meds")} /></EF>
                <EF label={tr("Allergies", lang)}><textarea rows={2} style={ei} value={editForm.allergy} onChange={set("allergy")} /></EF>
                <EF label={tr("Memo", lang)}><textarea rows={2} style={ei} value={editForm.memo} onChange={set("memo")} /></EF>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button onClick={() => setEditForm(null)} style={{ ...viewMoreBtn, padding: "10px 18px" }}>{tr("Cancel", lang)}</button>
                  <button onClick={submitEdit} style={{ ...btn(BLUE, "#fff"), padding: "11px 22px" }}>{tr("Submit edit request", lang)}</button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

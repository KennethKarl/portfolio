import React, { useState, useEffect } from "react";
import { t as tr } from "./i18n.js";
import {
  Search, User, Globe, ChevronDown, ChevronRight, Menu, X,
  Folder, CalendarDays, CalendarCheck, MessageSquare, MapPin,
  Stethoscope, Sparkles, Car, Hotel, Map, Handshake, Check,
  Phone, Mail, Send, Star, ArrowLeft, MessageCircle,
  Heart, MapPinned, SlidersHorizontal, ArrowDownUp, ArrowRight, Shield,
} from "lucide-react";
import { Outlet, useNavigate, useLocation, useParams, useOutletContext } from "react-router-dom";
import { ClientOnly } from "vite-react-ssg";
import { Seo, orgJsonLd, faqJsonLd, breadcrumbJsonLd, providersJsonLd } from "./seo.jsx";
import { initAnalytics, trackPageView } from "./analytics.js";
import { submitLead } from "./api.js";
import { SITE_URL } from "./config.js";
import {
  BLUE, BLUE_SOFT, BLUE_100, EDGE, INK, SUB, MUTE, FAINT, LINE, BG_SOFT, CLOUD, ACCENT, STAR, GREEN,
  NAVY, NAVY_LINE, FOOTER_BG, FOOTER_LINE, BRAND_GRAD, SECTION_TINT, AQUA,
  DISPLAY, btn, viewMoreBtn,
} from "./theme.js";
import {
  BRAND, NAV, HERO, JOURNEY, WHY,
  REVIEWS, FAQ_CATS, FAQS, CERTS, BLOG, BLOG_CATS, UI, tx, PROCEDURES, usd, KRW_PER_USD,
  PROVIDERS, PROVIDER_DEPTS, PROVIDER_LANGS,
} from "./data.js";
import { TreatmentListPage, TreatmentDetailPage, BookingPage, CartPage, MyPage } from "./functional.jsx";
import * as store from "./store.js";
import { getCollection, useContent, hydrateContent } from "./content.js";
import { getEnabledLangs, dirOf, langFromPath, withLang, stripLang, PREFIX_LANGS } from "./langs.js";
import AdminPage from "./admin.jsx";
import SpecOverlay from "./spec-overlay.jsx";

const ICONS = { Folder, CalendarDays, CalendarCheck, MessageSquare, MapPin, Stethoscope, Sparkles, Car, Hotel, Map, Handshake };
// 프로토타입 max-w-wide = 1280, 좌우 패딩 데스크톱40/모바일20(clamp)
const WRAP = { maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" };

/* responsive helper */
function useIsMobile(maxWidth = 960) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(`(max-width:${maxWidth}px)`).matches);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${maxWidth}px)`);
    const on = () => setM(mq.matches); on();
    mq.addEventListener("change", on); return () => mq.removeEventListener("change", on);
  }, [maxWidth]);
  return m;
}

/* ========================================================================
   LAYOUT
   ======================================================================== */
/* 데모 안내 배너 — 포트폴리오 목업임을 상단 중앙에 강조 (전 페이지·admin 포함) */
function DemoBanner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 16px", background: "#fff" }}>
      <div style={{ maxWidth: 760, textAlign: "center", background: "#FDE68A", border: "1px solid #F3CD57", borderRadius: 12, padding: "9px 22px", fontSize: 13.5, fontWeight: 800, color: "#7A5B0B", lineHeight: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        ⚠️ 데모(포트폴리오) 페이지입니다 · 모든 데이터는 목업(mockup)이며 실제와 무관합니다
      </div>
    </div>
  );
}

function Layout() {
  const isMobile = useIsMobile(960);
  const location = useLocation();
  const lang = langFromPath(location.pathname);          // 언어 = URL 접두어에서 파생
  const rawNavigate = useNavigate();
  // 내부 이동은 현재 언어 접두어를 자동 유지(전 링크 lang-aware)
  const navigate = (to, opts) => rawNavigate(typeof to === "string" ? withLang(to, lang) : to, opts);
  // 언어 전환 = 같은 페이지의 다른 언어 URL 로 이동(쿼리 보존)
  const switchLang = (code) => rawNavigate(withLang(stripLang(location.pathname), code) + (location.search || ""));
  useEffect(() => { initAnalytics(); hydrateContent(); }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dirOf(lang);
  }, [lang]);
  useEffect(() => {
    trackPageView(location.pathname);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);
  return (
    <div style={{ fontFamily: "Pretendard, system-ui, sans-serif", background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LandingStyles />
      <DemoBanner />
      <Nav lang={lang} onLang={switchLang} isMobile={isMobile} navigate={navigate} pathname={location.pathname} />
      <PromoBanner lang={lang} navigate={navigate} />
      <main style={{ flex: 1 }}>
        <Outlet context={{ lang, isMobile, navigate }} />
      </main>
      <Footer lang={lang} navigate={navigate} />
      {/* 전역 문의하기 플로팅 버튼 (Figma: 모든 화면 상시 노출) */}
      <ClientOnly>{() => <FloatingInquiry lang={lang} />}</ClientOnly>
      <ClientOnly>{() => <PromoPopup lang={lang} navigate={navigate} />}</ClientOnly>
      {/* 기획 모드 오버레이 (전 화면, client-only) — 우하단 토글 / ?spec=1 */}
      <ClientOnly>{() => <SpecOverlay />}</ClientOnly>
    </div>
  );
}

/* 전역 문의 플로팅 버튼 + 상담 접수 모달 (Figma 문의) */
function FloatingInquiry({ lang }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button data-spec="g2" onClick={() => setOpen(true)} style={{ position: "fixed", right: 22, bottom: 22, zIndex: 50, display: "inline-flex", alignItems: "center", gap: 8, background: BRAND_GRAD, color: "#fff", border: "none", borderRadius: 999, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(27,89,250,.4)" }}>
        <MessageCircle size={18} /> {tr("Contact", lang)}
      </button>
      {open && <InquiryModal lang={lang} onClose={() => setOpen(false)} />}
    </>
  );
}
function InquiryModal({ lang, onClose }) {
  const profile = store.getProfile();
  const [sent, setSent] = useState(false);
  const cats = lang === "ko"
    ? ["건강검진", "종합병원", "피부과", "성형외과", "안과", "치과", "산부인과", "비뇨기과", "정형외과"]
    : ["Health check-up", "General hospital", "Dermatology", "Plastic surgery", "Ophthalmology", "Dental", "Obstetrics", "Urology", "Orthopedics"];
  const inp = { width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,15,44,.5)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 460, maxHeight: "90vh", overflow: "auto", padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: INK, margin: 0 }}>{tr("Get in touch", lang)}</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE }}><X size={20} /></button>
        </div>
        {sent ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: SECTION_TINT, color: BLUE, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Check size={26} /></div>
            <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{tr("Received", lang)}</div>
            <p style={{ fontSize: 13, color: SUB }}>{tr("A confirmation email was sent and our global team was notified.", lang)}</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submitLead({ source: "inquiry" }).catch(() => {}); setSent(true); }} style={{ display: "grid", gap: 12 }}>
            <input style={inp} required placeholder={tr("Name", lang)} defaultValue={profile?.fullName || ""} />
            <input style={inp} required type="email" placeholder="Email" defaultValue={profile?.email || ""} />
            <input type="tel" style={inp} placeholder={tr("Phone (with country code)", lang)} defaultValue={profile?.phone || ""} />
            <select style={inp} required defaultValue=""><option value="" disabled>{tr("Select category", lang)}</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
            <textarea style={inp} rows={3} placeholder={tr("Tell us about the treatment you're considering", lang)} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: SUB }}><input type="checkbox" required /> {tr("I'm not a robot", lang)}</label>
            <button type="submit" style={{ ...btn(BLUE, "#fff"), width: "100%" }}>{UI[lang].send}</button>
            {/* 자동화: 접수 시 고객 이메일 + 글로벌팀 슬랙 알림 (백엔드 연동 필요) */}
          </form>
        )}
      </div>
    </div>
  );
}

function LandingStyles() {
  return (
    <style>{`
      .g-journey{display:flex;align-items:stretch;gap:0}
      .g-step{flex:1;min-width:0}
      .g-chev{display:flex;align-items:center;color:#bcd0ff;flex:0 0 auto;padding:0 4px}
      .g-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
      .g-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
      .g-rev-bento{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
      .g-rev-bento .span2{grid-column:span 2}
      .g-hero{display:grid;grid-template-columns:1.05fr .95fr;align-items:stretch}
      .g-svc{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
      .g-list{display:grid;grid-template-columns:1fr 1fr;gap:30px 44px}
      .g-dd{opacity:0;visibility:hidden;transform:translateY(6px);transition:all .15s ease}
      .g-nav-item:hover .g-dd{opacity:1;visibility:visible;transform:translateY(0)}
      /* RTL(아랍어 등): 방향성 아이콘(chevron/arrow)만 좌우 미러. 체크·별·핀 등 비방향 아이콘은 유지 */
      [dir="rtl"] .lucide-chevron-right,[dir="rtl"] .lucide-chevron-left,[dir="rtl"] .lucide-arrow-right,[dir="rtl"] .lucide-arrow-left{transform:scaleX(-1)}
      [dir="rtl"] .lb-nav .lucide-chevron-right{transform:none}  /* 이미지 갤러리 좌우 nav는 공간(좌=이전) 기준 유지 */
      /* RTL: 본질적으로 LTR인 값(전화·이메일·비밀번호·숫자·URL·날짜)은 왼쪽부터 LTR 표시 */
      [dir="rtl"] input[type="tel"],[dir="rtl"] input[type="email"],[dir="rtl"] input[type="password"],[dir="rtl"] input[type="number"],[dir="rtl"] input[type="url"],[dir="rtl"] input[type="date"],[dir="rtl"] input[inputmode="numeric"],[dir="rtl"] input[inputmode="tel"]{direction:ltr;text-align:left}
      .h-row{display:flex;gap:20px;overflow-x:auto;padding:6px 2px 16px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
      .h-row::-webkit-scrollbar{height:8px}
      .h-row::-webkit-scrollbar-track{background:transparent}
      .h-row::-webkit-scrollbar-thumb{background:#dde3ec;border-radius:999px}
      .h-card{flex:0 0 300px;max-width:300px;scroll-snap-align:start}
      .h-card-lg{flex:0 0 330px;max-width:330px;scroll-snap-align:start}
      @media(max-width:560px){.h-card{flex-basis:80%;max-width:80%}.h-card-lg{flex-basis:84%;max-width:84%}}
      /* Creatrip식 병원 사진 모자이크 (큰 메인 + 2x2 썸네일) */
      .gal-mosaic{position:relative;display:grid;grid-template-columns:1.6fr 1fr 1fr;grid-template-rows:repeat(2,minmax(0,1fr));gap:10px;height:440px}
      .gal-cell{position:relative;overflow:hidden;border-radius:14px;cursor:pointer;background:#eef2f8;border:1px solid #e7ecf5}
      .gal-cell img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
      .gal-cell:hover img{transform:scale(1.05)}
      .gal-cell.main{grid-row:1 / span 2}
      .gal-viewall{position:absolute;right:14px;bottom:14px;display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.95);color:#0b1f3a;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(15,23,42,.18);z-index:2}
      .gal-more{position:absolute;inset:0;display:grid;place-items:center;background:rgba(7,18,38,.52);color:#fff;font-size:20px;font-weight:800;letter-spacing:.02em}
      @media(max-width:760px){
        .gal-mosaic{grid-template-columns:1fr 1fr;grid-template-rows:190px repeat(2,108px);height:auto}
        .gal-cell.main{grid-column:1 / -1;grid-row:1}
      }
      /* 라이트박스(전체 보기) */
      .lb-ov{position:fixed;inset:0;z-index:1000;background:rgba(6,12,26,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
      .lb-stage{position:relative;max-width:1000px;width:100%;display:flex;align-items:center;justify-content:center}
      .lb-stage img{max-width:100%;max-height:72vh;border-radius:12px;object-fit:contain;background:#0b1426}
      .lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:none;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;cursor:pointer}
      .lb-nav:hover{background:rgba(255,255,255,.3)}
      .lb-thumbs{display:flex;gap:8px;margin-top:18px;flex-wrap:wrap;justify-content:center;max-width:880px}
      .lb-thumb{width:74px;height:54px;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;opacity:.55;transition:opacity .15s}
      .lb-thumb.on{opacity:1;border-color:#fff}
      .lb-thumb img{width:100%;height:100%;object-fit:cover}
      .lb-close{position:fixed;top:18px;right:18px;width:42px;height:42px;border-radius:50%;border:none;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;cursor:pointer}
      /* ---- Blog (ListeningMind식 리스트 + 아티클) ---- */
      /* 히어로 내 카테고리 탭 */
      .blog-htabs{display:flex;gap:24px;flex-wrap:wrap;margin-top:24px}
      .blog-htab{background:none;border:none;padding:6px 0;font-size:15px;font-weight:700;color:rgba(255,255,255,.6);cursor:pointer;position:relative;transition:color .14s ease;font-family:inherit}
      .blog-htab:hover{color:#fff;transform:none}
      .blog-htab.on{color:#fff}
      .blog-htab.on::after{content:"";position:absolute;left:0;right:0;bottom:-5px;height:2px;background:#fff;border-radius:2px}
      /* 인기 상위 카드 그리드 */
      .blog-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:30px 24px}
      .blog-gcard{text-align:start;background:#fff;border:1px solid #E5E7EC;border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:0 6px 22px rgba(15,23,42,.05);display:flex;flex-direction:column;padding:0;transition:box-shadow .18s ease,transform .18s ease}
      .blog-gcard:hover{box-shadow:0 12px 34px rgba(15,23,42,.10);transform:translateY(-3px)}
      .blog-gcard .thumb{aspect-ratio:4/3;width:100%;overflow:hidden;background:#EEF2F8;position:relative}
      .blog-gcard .thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
      .blog-gcard:hover .thumb img{transform:scale(1.06)}
      .blog-gcard .ex{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
      /* 하단 리스트 */
      .blog-list{border-top:2px solid #000F2C}
      .blog-lrow{display:grid;grid-template-columns:132px 1fr auto;align-items:center;gap:18px;padding:19px 4px;border:none;border-bottom:1px dashed #D8DEE8;background:none;width:100%;text-align:start;cursor:pointer;transition:background .14s ease}
      .blog-lrow:hover{background:#F7F8FA;transform:none}
      .blog-lrow:hover .lr-title{color:#1B59FA}
      /* 최신순/인기순 토글 */
      .blog-sort{display:inline-flex;background:#F2F3F6;border-radius:999px;padding:3px}
      .blog-sort button{border:none;background:none;padding:7px 16px;border-radius:999px;font-size:13px;font-weight:700;color:#6A7896;cursor:pointer}
      .blog-sort button:hover{transform:none}
      .blog-sort button.on{background:#000F2C;color:#fff}
      /* 뉴스레터 신청 */
      .blog-news{display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center;background:linear-gradient(118deg,#EEF3FF 0%,#DCE8FF 100%);border:1px solid #D7E2FF;border-radius:22px;padding:clamp(26px,3.4vw,44px);color:#000F2C;margin:12px 0 8px}
      .blog-news .illus{width:150px;height:150px;flex:0 0 auto}
      /* 아티클 페이지 */
      .blog-art{display:grid;grid-template-columns:230px 1fr;gap:52px;align-items:start}
      .blog-toc{position:sticky;top:96px}
      .blog-toc a{display:block;padding:7px 0 7px 14px;border-left:2px solid #E5E7EC;color:#6A7896;font-size:13.5px;text-decoration:none;line-height:1.4;transition:all .14s ease}
      .blog-toc a:hover{border-left-color:#1B59FA;color:#1B59FA}
      .blog-body h2{scroll-margin-top:92px}
      @media(max-width:960px){
        .g-3,.g-2,.g-rev-bento,.g-svc,.g-list{grid-template-columns:1fr!important}
        .g-rev-bento .span2{grid-column:auto}
        .g-hero{grid-template-columns:1fr!important}
        .g-journey{flex-wrap:wrap}.g-step{flex:1 1 45%}.g-chev{display:none}
        .blog-cards{grid-template-columns:1fr 1fr}
        .blog-news{grid-template-columns:1fr;text-align:center;gap:18px}.blog-news .illus{margin:0 auto}
        .blog-art{grid-template-columns:1fr;gap:0}.blog-toc{display:none}
      }
      @media(max-width:640px){
        .blog-cards{grid-template-columns:1fr}
        .blog-lrow{grid-template-columns:1fr;gap:6px;align-items:start}
      }
      @media(max-width:560px){.g-step{flex:1 1 100%}}
    `}</style>
  );
}

/* --------- logo --------- */
function SafedocLogo({ onClick, dark = false }) {
  return (
    <button onClick={onClick} style={{ border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9, padding: 0 }} aria-label="CareBridge Global home">
      <span style={{ position: "relative", width: 30, height: 30, borderRadius: 9, background: BRAND_GRAD, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(27,89,250,.35)" }}>
        <span style={{ position: "absolute", width: 13, height: 3.4, borderRadius: 2, background: "#fff" }} />
        <span style={{ position: "absolute", width: 3.4, height: 13, borderRadius: 2, background: "#fff" }} />
      </span>
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1, gap: 3 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: dark ? "#fff" : INK }}>CareBridge</span>
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.22em", color: dark ? "rgba(255,255,255,.6)" : MUTE }}>GLOBAL SERVICE</span>
      </span>
    </button>
  );
}

/* --------- Nav --------- */
function Nav({ lang, onLang, isMobile, navigate, pathname }) {
  const u = UI[lang] || UI.en;
  const [open, setOpen] = useState(false);
  store.useStore();
  useContent();                       // 언어 레지스트리 발행/편집 시 드롭다운 리렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const user = mounted ? store.getUser() : null;
  const cartCount = mounted ? store.getCart().reduce((s, c) => s + (c.qty || 1), 0) : 0;
  const active = (p) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const go = (p) => { navigate(p); setOpen(false); };
  // 언어 드롭다운 (레지스트리 LANGS 구동 — 언어 추가 시 자동 반영)
  const langBtn = (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <Globe size={14} color={SUB} style={{ position: "absolute", left: 11, pointerEvents: "none" }} />
      <select
        value={lang}
        onChange={(e) => onLang(e.target.value)}
        aria-label="Language"
        style={{ appearance: "none", WebkitAppearance: "none", background: CLOUD, border: `1px solid ${LINE}`, borderRadius: 999, padding: "7px 30px 7px 30px", fontSize: 12.5, fontWeight: 700, color: INK, cursor: "pointer", fontFamily: "inherit", direction: "ltr", textAlign: "start" }}
      >
        {getEnabledLangs().map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <ChevronDown size={14} color={SUB} style={{ position: "absolute", right: 10, pointerEvents: "none" }} />
    </div>
  );
  const consultBtn = (
    <button onClick={() => go("/contact")} style={{ ...btn(BLUE, "#fff"), padding: "11px 18px", fontSize: 13.5 }}>{tr("Start Consultation", lang)} <ChevronRight size={15} /></button>
  );
  const signin = (
    <button onClick={() => go(user ? "/mypage" : "/account")} style={{ border: "none", background: "transparent", color: INK, cursor: "pointer", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <User size={15} /> {user ? u.myaccount : u.signin}
    </button>
  );
  const cartBtn = (
    <button onClick={() => go("/cart")} title={u.cart} style={{ position: "relative", border: `1px solid ${LINE}`, background: "#fff", color: INK, cursor: "pointer", borderRadius: 9, width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <Heart size={16} />
      {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 16, height: 16, display: "grid", placeItems: "center", padding: "0 4px" }}>{cartCount}</span>}
    </button>
  );
  const searchBtn = (
    <button onClick={() => go("/treatments")} title="Browse treatments" style={{ border: "none", background: BLUE, color: "#fff", cursor: "pointer", borderRadius: 9, width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <Search size={16} />
    </button>
  );
  return (
    <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "saturate(180%) blur(8px)", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 28px" }}>
        <span data-spec="h-logo" style={{ display: "inline-flex" }}><SafedocLogo onClick={() => go("/")} /></span>
        {!isMobile && (
          <nav data-spec="h-menu" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV.map((n) => (
              <div key={n.id} data-spec={n.children ? "h-service" : undefined} className="g-nav-item" style={{ position: "relative" }}>
                <button onClick={() => go(n.path)} style={{
                  border: "none", background: "transparent", cursor: "pointer", padding: "8px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: active(n.path) ? 700 : 500, color: active(n.path) ? BLUE : SUB,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>{tx(n, lang)}{n.children && <ChevronDown size={14} />}</button>
                {n.children && (
                  <div className="g-dd" style={{ position: "absolute", top: "100%", left: 0, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,.12)", padding: 8, minWidth: 210, zIndex: 40 }}>
                    {n.children.map((c) => (
                      <button key={c.id} onClick={() => go(c.path)} style={{ display: "block", width: "100%", textAlign: "start", border: "none", background: "transparent", cursor: "pointer", padding: "9px 12px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: SUB }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = SECTION_TINT; e.currentTarget.style.color = BLUE; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = SUB; }}>{tx(c, lang)}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && <span data-spec="h-login" style={{ display: "inline-flex" }}>{signin}</span>}{!isMobile && <span data-spec="h-lang" style={{ display: "inline-flex" }}>{langBtn}</span>}<span data-spec="h-fav" style={{ display: "inline-flex" }}>{cartBtn}</span>{!isMobile && <span data-spec="h-cta" style={{ display: "inline-flex" }}>{consultBtn}</span>}
          {isMobile && <button onClick={() => setOpen((o) => !o)} style={{ border: `1px solid ${LINE}`, background: "#fff", borderRadius: 9, padding: 7, cursor: "pointer", color: INK }}>{open ? <X size={18} /> : <Menu size={18} />}</button>}
        </div>
      </div>
      {isMobile && open && (
        <div style={{ borderTop: `1px solid ${LINE}`, background: "#fff", padding: "8px 20px 16px" }}>
          {NAV.map((n) => (
            <div key={n.id}>
              <button onClick={() => go(n.path)} style={{ display: "block", width: "100%", textAlign: "start", border: "none", background: "transparent", padding: "11px 4px", fontSize: 15, fontWeight: 700, color: INK, cursor: "pointer" }}>{tx(n, lang)}</button>
              {n.children && <div style={{ paddingLeft: 12, marginBottom: 4 }}>{n.children.map((c) => (
                <button key={c.id} onClick={() => go(c.path)} style={{ display: "block", width: "100%", textAlign: "start", border: "none", background: "transparent", padding: "7px 4px", fontSize: 13.5, color: SUB, cursor: "pointer" }}>{tx(c, lang)}</button>
              ))}</div>}
            </div>
          ))}
          <button onClick={() => go(user ? "/mypage" : "/account")} style={{ ...btn(BLUE, "#fff"), marginTop: 8, width: "100%" }}>{user ? UI[lang].myaccount : UI[lang].signin}</button>
        </div>
      )}
    </div>
  );
}

/* --------- Footer --------- */
function Footer({ lang, navigate }) {
  const cols = [
    { title: { en: "Service", ko: "서비스" }, items: [{ path: "/treatments", en: "Treatments", ko: "시술" }, { path: "/providers", en: "Providers", ko: "파트너 병원" }] },
    { title: { en: "Company", ko: "회사" }, items: [{ path: "/company", en: "About", ko: "회사소개" }, { path: "/pricing", en: "Pricing", ko: "가격 안내", ar: "الأسعار", ja: "料金" }, { path: "/contact", en: "Contact", ko: "문의" }, { path: "/faq", en: "FAQ", ko: "FAQ" }, { path: "/blog", en: "Blog", ko: "블로그" }] },
    { title: { en: "Legal", ko: "법적 고지" }, items: [{ path: "/legal/privacy", en: "Privacy Policy", ko: "개인정보처리방침" }, { path: "/legal/terms", en: "Terms of Service", ko: "이용약관" }, { path: "/legal/refund", en: "Refund Policy", ko: "환불정책" }] },
  ];
  const info = lang === "ko"
    ? [`${BRAND.name} · 대표 ${BRAND.ceo}`, `사업자등록번호 ${BRAND.bizNo}`, BRAND.email, BRAND.addrKo]
    : [`${BRAND.name} Inc. · CEO ${BRAND.ceo}`, `Business Reg. ${BRAND.bizNo}`, BRAND.email, BRAND.addrEn];
  return (
    <div data-spec="g3" style={{ background: FOOTER_BG, color: "#9fb0cf" }}>
      <div style={{ ...WRAP, padding: "52px 28px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 32 }} className="g-footer">
        <div>
          <div style={{ marginBottom: 16 }}><SafedocLogo onClick={() => navigate("/")} dark /></div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 300 }}>{tx(HERO.sub, lang)}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5, color: "#7d8eb0" }}>
            {info.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        </div>
        {cols.map((c, i) => (
          <div key={i}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{tx(c.title, lang)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.items.map((it, j) => (
                <button key={j} onClick={() => navigate(it.path)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#9fb0cf", fontSize: 13.5, padding: 0, fontWeight: 500, textAlign: "start" }}>{tx(it, lang)}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${FOOTER_LINE}` }}>
        <div style={{ ...WRAP, padding: "18px 28px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 12.5, color: "#6f82a6" }}>
          <span>© 2026. {BRAND.name} Inc. All rights reserved.</span>
          <span>{tr("Comprehensive medical travel to Korea", lang)}</span>
        </div>
      </div>
      <style>{`@media(max-width:760px){.g-footer{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}

/* shared section heading */
function Eyebrow({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}
function H2({ children, center }) {
  return <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: INK, margin: "0 0 10px", letterSpacing: "-0.02em", textAlign: center ? "center" : "start" }}>{children}</h2>;
}
function Lead({ children, center }) {
  return <p style={{ fontSize: 16, color: "#5a6b86", margin: 0, textAlign: center ? "center" : "start", maxWidth: center ? 640 : 620, marginInlineStart: center ? "auto" : 0, marginInlineEnd: center ? "auto" : 0 }}>{children}</p>;
}

/* ========================================================================
   HOME
   ======================================================================== */
function Home() {
  const { lang, navigate } = useOutletContext();
  return (
    <>
      <Seo path="/" jsonLd={orgJsonLd} />
      <Hero lang={lang} navigate={navigate} />
      <div data-spec="s2"><Journey lang={lang} /></div>
      <div data-spec="s3"><ProvidersHomeSection lang={lang} navigate={navigate} /></div>
      <div data-spec="s6"><WhyKorea lang={lang} /></div>
      <div data-spec="s7"><Reviews lang={lang} /></div>
      <div data-spec="fq-list"><FaqSection lang={lang} navigate={navigate} preview /></div>
      <Certifications lang={lang} />
    </>
  );
}

function Hero({ lang, navigate }) {
  useContent();
  const chips = getCollection("procedures").slice(0, 5);
  return (
    <div style={{ background: "#fff" }}>
      <div className="g-hero" style={{ ...WRAP, padding: "64px clamp(20px, 4vw, 40px) 76px", display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 56, alignItems: "center" }}>
        {/* 좌: 텍스트 + 검색 */}
        <div style={{ maxWidth: 640 }}>
          <div data-spec="hero-copy" style={{ fontSize: 11, letterSpacing: "0.20em", textTransform: "uppercase", fontWeight: 700, color: BLUE, display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ width: 36, height: 2, background: BLUE, borderRadius: 2 }} />{tr("Curated by CareBridge", lang)}
          </div>
          <h1 className="g-hero-title" style={{ fontFamily: DISPLAY, fontSize: "clamp(40px, 6.4vw, 84px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.035em", color: INK, margin: "0 0 24px" }}>
            {tx(HERO.title1, lang)} {tx(HERO.title2, lang)}<br /><span style={{ color: BLUE }}>{tx(HERO.accent, lang)}</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 1.4vw, 19px)", lineHeight: 1.6, color: SUB, margin: "0 0 30px", maxWidth: 520 }}>{tx(HERO.sub, lang)}</p>
          {/* 검색바 (prototype sd-search) */}
          <div data-spec="hero-search" style={{ display: "flex", alignItems: "center", background: "#fff", border: `1px solid ${INK}`, borderRadius: 8, padding: "5px 5px 5px 18px", marginBottom: 18, maxWidth: 520 }}>
            <Search size={17} color={MUTE} />
            <input onKeyDown={(e) => e.key === "Enter" && navigate("/treatments")} placeholder={tr("Search treatments, clinics, or concerns", lang)} style={{ background: "transparent", border: 0, outline: "none", flex: 1, padding: "13px 12px", fontSize: 15, color: INK, minWidth: 0 }} />
            <button onClick={() => navigate("/treatments")} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 6, padding: "12px 22px", fontWeight: 600, fontSize: 13, letterSpacing: "0.05em", cursor: "pointer", whiteSpace: "nowrap" }}>{tr("Search", lang)}</button>
          </div>
          <div data-spec="hero-cta" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <button onClick={() => navigate("/treatments")} style={{ ...btn(BLUE, "#fff"), fontSize: 14.5, padding: "14px 26px" }}>{tx(HERO.cta1, lang)}</button>
            <button onClick={() => navigate("/providers")} style={{ ...btn("#fff", INK), border: `1px solid ${INK}`, fontSize: 14.5, padding: "13px 26px" }}>{tx(HERO.cta2, lang)}</button>
          </div>
          {/* 전문분야 칩 */}
          <div data-spec="hero-chips" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.map((p) => (
              <button key={p.id} onClick={() => navigate(`/treatments/${p.id}`)} style={{ background: "#fff", color: INK, border: `1px solid ${LINE}`, borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{tx(p.name, lang)}</button>
            ))}
          </div>
        </div>
        {/* 우: 포토 + 오버레이 캡션 + 플로팅 배지 */}
        <div data-spec="hero-slide" style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 540, alignSelf: "stretch" }}>
          <img src={HERO.image} alt="A patient using CareBridge on her phone" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "75% 40%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,15,44,0) 45%, rgba(0,15,44,.55) 100%)" }} />
          <div style={{ position: "absolute", left: 22, bottom: 20, right: 22, color: "#fff" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>{tr("One journey. One coordinator. One call.", lang)}</div>
          </div>
          <div style={{ position: "absolute", top: 16, right: 16, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.94)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "8px 13px", fontSize: 12, fontWeight: 700, color: INK }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />{tx(HERO.badge, lang)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Journey({ lang }) {
  useContent();
  const JOURNEY = getCollection("journey");
  return (
    <div style={{ background: SECTION_TINT }}>
      <div style={{ ...WRAP, padding: "72px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Eyebrow>{tx(JOURNEY.eyebrow, lang)}</Eyebrow><H2 center>{tx(JOURNEY.title, lang)}</H2><Lead center>{tx(JOURNEY.sub, lang)}</Lead>
        </div>
        <div className="g-journey">
          {JOURNEY.steps.map((s, i) => {
            const Icon = ICONS[s.icon] || Folder; const last = i === JOURNEY.steps.length - 1;
            return (
              <React.Fragment key={i}>
                <div className="g-step" style={{ background: "#fff", border: "1px solid #dbe5fb", borderRadius: 16, padding: "26px 18px", textAlign: "center", boxShadow: "0 4px 16px rgba(27,89,250,.06)" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: SECTION_TINT, color: BLUE, display: "grid", placeItems: "center", margin: "0 auto 14px", border: `1.5px solid ${BLUE}` }}><Icon size={22} /></div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, marginBottom: 7 }}>{lang === "ko" ? `${i + 1}단계` : `Step ${i + 1}`}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "#475569", fontWeight: 500 }}>{tx(s, lang)}</div>
                </div>
                {!last && <div className="g-chev"><ChevronRight size={22} /></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriceTag({ p, lang }) {
  const val = typeof p === "object" ? tx(p, lang) : p;
  return <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: BLUE }}>{val}</span>;
}

/* ---------------- 상담 채널 버튼 (외국인 유치: 지역별 메신저) ---------------- */
const CHANNEL_LINK = (type, value) => {
  const v = (value || "").trim();
  switch (type) {
    case "whatsapp": return `https://wa.me/${v.replace(/[^0-9]/g, "")}`;
    case "line": return v.startsWith("http") ? v : `https://line.me/R/ti/p/${encodeURIComponent(v)}`;
    case "telegram": return v.startsWith("http") ? v : `https://t.me/${v.replace(/^@/, "")}`;
    case "kakao": return v.startsWith("http") ? v : `https://pf.kakao.com/${v}`;
    case "wechat": return null;                       // WeChat: 딥링크 없음 → ID 복사
    case "email": return `mailto:${v}`;
    case "phone": return `tel:${v.replace(/[^0-9+]/g, "")}`;
    default: return v.startsWith("http") ? v : null;
  }
};
const CHANNEL_STYLE = { whatsapp: ["#25D366", "#fff"], line: ["#06C755", "#fff"], wechat: ["#07C160", "#fff"], kakao: ["#FEE500", "#191600"], telegram: ["#229ED9", "#fff"], email: [BLUE, "#fff"], phone: [BLUE, "#fff"] };
const CHANNEL_ICON = { phone: Phone, email: Mail };

function ChannelButtons({ lang, compact }) {
  useContent();
  const all = getCollection("channels") || [];
  const list = all.filter((c) => c && c.enabled !== false && (!Array.isArray(c.langs) || c.langs.length === 0 || c.langs.includes(lang)));
  if (!list.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {list.map((c) => {
        const [bg, fg] = CHANNEL_STYLE[c.type] || [BLUE, "#fff"];
        const href = CHANNEL_LINK(c.type, c.value);
        const Ic = CHANNEL_ICON[c.type] || MessageCircle;
        const label = tx(c.label, lang) || c.type;
        const style = { display: "inline-flex", alignItems: "center", gap: 8, background: bg, color: fg, border: "none", borderRadius: 999, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, textDecoration: "none", cursor: "pointer" };
        const inner = <><Ic size={16} /> <span>{label}</span>{!compact && <span dir="ltr" style={{ opacity: .85, fontSize: 12, unicodeBidi: "isolate" }}>{c.value}</span>}</>;
        return href
          ? <a key={c.id} href={href} target="_blank" rel="noreferrer" style={style}>{inner}</a>
          : <button key={c.id} type="button" onClick={() => { try { navigator.clipboard?.writeText(c.value); } catch { /* */ } }} style={style} title={c.value}>{inner}</button>;
      })}
    </div>
  );
}

/* ---------------- 프로모션·배너·팝업 (유치 캠페인) ---------------- */
function usePromo(placement, lang) {
  useContent();
  const all = getCollection("promos") || [];
  return all.find((p) => p && p.enabled !== false && p.placement === placement && (!Array.isArray(p.langs) || p.langs.length === 0 || p.langs.includes(lang)));
}
function PromoBanner({ lang, navigate }) {
  const promo = usePromo("banner", lang);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { if (promo) { try { setHidden(sessionStorage.getItem("kc2_promo_" + promo.id) === "1"); } catch { /* */ } } }, [promo?.id]);
  if (!promo || hidden) return null;
  const dismiss = () => { setHidden(true); try { sessionStorage.setItem("kc2_promo_" + promo.id, "1"); } catch { /* */ } };
  return (
    <div style={{ background: BRAND_GRAD, color: "#fff", padding: "10px 44px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", fontSize: 13.5, fontWeight: 600 }}>
      <span>{tx(promo.text, lang)}</span>
      {promo.link && promo.cta ? <button onClick={() => navigate(promo.link)} style={{ background: "#fff", color: BLUE, border: "none", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tx(promo.cta, lang)}</button> : null}
      <button onClick={dismiss} aria-label="close" style={{ position: "absolute", insetInlineEnd: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#fff", cursor: "pointer", opacity: .85, display: "grid", placeItems: "center" }}><X size={16} /></button>
    </div>
  );
}
function PromoPopup({ lang, navigate }) {
  const promo = usePromo("popup", lang);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (promo) { try { if (sessionStorage.getItem("kc2_promo_" + promo.id) !== "1") setOpen(true); } catch { setOpen(true); } } }, [promo?.id]);
  if (!promo || !open) return null;
  const close = () => { setOpen(false); try { sessionStorage.setItem("kc2_promo_" + promo.id, "1"); } catch { /* */ } };
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(6,12,26,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: "32px 30px", maxWidth: 440, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(6,12,26,.35)" }}>
        <button onClick={close} aria-label="close" style={{ position: "absolute", insetInlineEnd: 14, top: 14, background: "transparent", border: "none", cursor: "pointer", color: MUTE }}><X size={20} /></button>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: INK, fontWeight: 600, margin: "6px 0 20px" }}>{tx(promo.text, lang)}</p>
        {promo.link && promo.cta ? <button onClick={() => { close(); navigate(promo.link); }} style={{ ...btn(BLUE, "#fff"), width: "100%" }}>{tx(promo.cta, lang)}</button> : null}
      </div>
    </div>
  );
}

/* 가로 카드 리스트용 미디어 카드 (이미지 + 제목 + 부제 + 화살표) — Revital·Providers 공용 */
function MediaCard({ image, title, subtitle, badge, onClick }) {
  return (
    <button onClick={onClick} className="h-card" style={{ textAlign: "start", padding: 0, border: "1px solid #e7ecf5", borderRadius: 18, overflow: "hidden", background: "#fff", cursor: "pointer", boxShadow: "0 6px 22px rgba(15,23,42,.05)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 160 }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(6,20,58,0.35), rgba(6,20,58,0) 60%)" }} />
        {badge && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11.5, fontWeight: 800, color: INK, background: "rgba(255,255,255,.95)", borderRadius: 999, padding: "4px 10px" }}>{badge}</span>}
      </div>
      <div style={{ padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flex: 1 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 16.5, fontWeight: 800, color: INK, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          <div style={{ fontSize: 12.5, color: "#7587a3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>
        </div>
        <span style={{ ...viewMoreBtn, padding: "8px 10px", flexShrink: 0 }}><ChevronRight size={16} /></span>
      </div>
    </button>
  );
}

function WhyKorea({ lang }) {
  useContent();
  const WHY = getCollection("why");
  return (
    <div style={{ background: NAVY, color: "#fff" }}>
      <div style={{ ...WRAP, padding: "72px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{tx(WHY.title, lang)}</h2>
          <p style={{ fontSize: 16, color: "#a9bbdc", margin: 0 }}>{tx(WHY.sub, lang)}</p>
        </div>
        <div className="g-3">
          {WHY.stats.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${NAVY_LINE}`, borderRadius: 18, padding: "30px 26px", textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 44, fontWeight: 800, color: "#7eaaff", lineHeight: 1, marginBottom: 12 }}>{s.big}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 7 }}>{tx(s.label, lang)}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: "#9fb1cf" }}>{tx(s.sub, lang)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* /providers 와 동일 형식(가로 카드 리스트)으로 홈에 노출 — Revital 위 */
function ProvidersHomeSection({ lang, navigate }) {
  useContent();
  const PROVIDERS = getCollection("providers");
  return (
    <div style={{ ...WRAP, padding: "76px 28px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <Eyebrow>{tr("Providers", lang)}</Eyebrow>
          <H2>{tr("Find trusted Korean providers", lang)}</H2>
          <Lead>{tr("Verified hospitals and clinics with international patient support.", lang)}</Lead>
        </div>
        <button onClick={() => navigate("/providers")} style={{ ...viewMoreBtn, padding: "9px 16px" }}>{tr("View all", lang)} <ChevronRight size={15} /></button>
      </div>
      <div className="h-row">
        {PROVIDERS.map((p) => (
          <MediaCard key={p.id} image={p.image} title={tx(p.name, lang)} subtitle={tx(p.area, lang)} badge={`${p.rating}★`} onClick={() => navigate("/providers")} />
        ))}
      </div>
    </div>
  );
}

function Reviews({ lang }) {
  useContent();
  const REVIEWS = getCollection("reviews");
  return (
    <div style={{ background: BG_SOFT }}>
      <div style={{ ...WRAP, padding: "76px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Eyebrow>{tr("Reviews", lang)}</Eyebrow>
          <H2 center>{tr("What Our Visitors Say", lang)}</H2>
        </div>
        <div className="g-3">
          {REVIEWS.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: "1px solid #e7ecf5", borderRadius: 16, padding: 26, boxShadow: "0 4px 20px rgba(15,23,42,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <img src={r.image} alt={tx(r.author, lang)} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{tx(r.author, lang)}</div>
                  <div style={{ color: ACCENT, fontSize: 13, letterSpacing: 1 }}>{"★".repeat(r.rating)}</div>
                </div>
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#1e293b", margin: "0 0 16px", fontWeight: 500 }}>"{tx(r.text, lang)}"</p>
              <span style={{ display: "inline-block", fontSize: 11.5, fontWeight: 700, color: BLUE, background: SECTION_TINT, borderRadius: 999, padding: "5px 12px" }}>{tx(r.source, lang)} · {tx(r.treatment, lang)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqSection({ lang, navigate, preview }) {
  useContent();
  const FAQS = getCollection("faqs");
  const u = UI[lang] || UI.en;
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState("");
  let items = FAQS.filter((f) => cat === "all" || f.cat === cat);
  if (q) items = items.filter((f) => tx(f.q, lang).toLowerCase().includes(q.toLowerCase()));
  const shown = preview ? items.slice(0, 5) : items;
  return (
    <div style={{ ...WRAP, padding: "76px 28px", maxWidth: 860 }}>
      <H2 center>FAQ</H2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, margin: "28px 0 18px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FAQ_CATS.map((c) => {
            const on = cat === c.id;
            return <button key={c.id} onClick={() => { setCat(c.id); setOpen(0); }} style={{ fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 999, padding: "7px 15px", background: on ? INK : "#fff", color: on ? "#fff" : SUB, border: `1px solid ${on ? INK : LINE}` }}>{tx(c, lang)}</button>;
          })}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${LINE}`, borderRadius: 999, padding: "7px 14px", background: "#fff" }}>
          <Search size={14} color={MUTE} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search", lang)} style={{ border: "none", outline: "none", fontSize: 13, width: 120 }} />
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {shown.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ background: "#fff", border: `1px solid ${isOpen ? BLUE : LINE}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", border: "none", background: isOpen ? SECTION_TINT : "#fff", cursor: "pointer", textAlign: "start" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "capitalize", minWidth: 56 }}>{tx(FAQ_CATS.find((c) => c.id === f.cat) || {}, lang)}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{tx(f.q, lang)}</span>
                </span>
                <ChevronDown size={18} color={isOpen ? BLUE : MUTE} style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {isOpen && <div style={{ padding: "0 18px 16px 84px", fontSize: 14, color: SUB, lineHeight: 1.65 }}>{tx(f.a, lang)}</div>}
            </div>
          );
        })}
      </div>
      {preview && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button onClick={() => navigate("/faq")} style={{ ...viewMoreBtn }}>{u.viewMore} <ChevronRight size={15} /></button>
        </div>
      )}
    </div>
  );
}

function Certifications({ lang }) {
  useContent();
  const CERTS = getCollection("certs");
  return (
    <div style={{ background: BG_SOFT, borderTop: "1px solid #eef1f6" }}>
      <div style={{ ...WRAP, padding: "48px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#7587a3", marginBottom: 24 }}>{tx(CERTS.title, lang)}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          {CERTS.orgs.map((o) => (
            <div key={o.mark} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 150, padding: "16px 20px", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: "#5a6b86" }}>{o.mark}</span>
              <span style={{ fontSize: 11.5, color: "#9aa7bd" }}>{tx(o.sub, lang)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   INNER PAGES
   ======================================================================== */
function PageHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ background: BRAND_GRAD, color: "#fff" }}>
      <div style={{ ...WRAP, padding: "56px 28px" }}>
        {eyebrow && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#cfdcff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div>}
        <h1 style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h1>
        {sub && <p style={{ fontSize: 16, color: "#d6e1ff", margin: 0, maxWidth: 620 }}>{sub}</p>}
      </div>
    </div>
  );
}

function INK_OR_SUB(on) { return on ? "#1B59FA" : "#000F2C"; }
const fpill = (on) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "#fff", color: on ? "#1B59FA" : "#2B3858", border: `1px solid ${on ? "#1B59FA" : "#E5E7EC"}` });

/* /providers — 파트너 병원 리스트 (스펙 1~13 반영) */
function deptLabel(id, lang) { const d = PROVIDER_DEPTS.find((x) => x.id === id); return d ? tx(d, lang) : id; }
function langLabel(id, lang) { const l = PROVIDER_LANGS.find((x) => x.id === id); return l ? tx(l, lang) : id; }
function ratingStr(p) { return (p.reviews ? p.rating : 0).toFixed(1); }   // #8 리뷰 없으면 0.0
function ProvidersPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const PROVIDERS = getCollection("providers");
  const [spec, setSpec] = useState("all");
  const [loc, setLoc] = useState("all");
  const [plang, setPlang] = useState("all");   // #3 언어 필터
  const locations = Array.from(new Set(PROVIDERS.map((p) => p.area.en)));   // #2 등록된 병원 조합만
  const list = PROVIDERS.filter((p) =>
    (spec === "all" || p.departments.includes(spec)) &&
    (loc === "all" || p.area.en === loc) &&
    (plang === "all" || (p.languages || []).includes(plang)));
  const sel = { padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, background: "#fff", color: INK, minWidth: 190, fontFamily: "inherit" };
  const lbl = { fontSize: 11, fontWeight: 700, color: MUTE, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 7, display: "block" };
  return (
    <>
      <Seo title={tr("Providers", lang)} description={tr("Verified Korean hospitals and clinics with multilingual interpreter support — Hangang Medical Center, Songpa, Sinchon and more, JCI-accredited.", lang)} path="/providers"
        jsonLd={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Providers", path: "/providers" }]),
          providersJsonLd(PROVIDERS.map((p) => ({ id: p.id, name: p.name.en, area: p.area.en, specialties: p.departments.map((d) => deptLabel(d, "en")), rating: p.reviews ? p.rating : 0, reviews: p.reviews }))),
        ]} />
      {/* 헤더 */}
      <div data-spec="pl-header" style={{ ...WRAP, padding: "44px 28px 8px" }}>
        <button onClick={() => navigate("/")} style={{ border: "none", background: "transparent", cursor: "pointer", color: SUB, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, padding: 0, marginBottom: 16 }}><ArrowLeft size={16} /> {tr("Back", lang)}</button>
        <Eyebrow>{tr("Providers", lang)}</Eyebrow>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 4.4vw, 52px)", fontWeight: 800, color: INK, margin: "0 0 12px", letterSpacing: "-0.025em" }}>{tr("Find trusted Korean providers", lang)}</h1>
        <p style={{ fontSize: 16, color: SUB, margin: 0, maxWidth: 620 }}>{tr("Explore verified hospitals and clinics with international patient support.", lang)}</p>
      </div>
      {/* 필터 바 — #1 전문영역 · #2 지역 · #3 언어 (#4 국제환자지원 체크박스 제거) */}
      <div data-spec="pl-filters" style={{ background: BG_SOFT, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, margin: "24px 0 0" }}>
        <div style={{ ...WRAP, padding: "22px 28px", display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div><span style={lbl}>{tr("Specialty", lang)}</span>
            <select style={sel} value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="all">{tr("All specialties", lang)}</option>
              {PROVIDER_DEPTS.map((d) => <option key={d.id} value={d.id}>{tx(d, lang)}</option>)}
            </select>
          </div>
          <div><span style={lbl}>{tr("Location", lang)}</span>
            <select style={sel} value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="all">{tr("All locations", lang)}</option>
              {locations.map((a) => <option key={a} value={a}>{lang === "ko" ? (PROVIDERS.find((p) => p.area.en === a)?.area.ko || a) : a}</option>)}
            </select>
          </div>
          <div><span style={lbl}>{tr("Languages", lang)}</span>
            <select style={sel} value={plang} onChange={(e) => setPlang(e.target.value)}>
              <option value="all">{tr("All languages", lang)}</option>
              {PROVIDER_LANGS.map((l) => <option key={l.id} value={l.id}>{tx(l, lang)}</option>)}
            </select>
          </div>
        </div>
      </div>
      {/* #5 필터에 따른 결과 숫자 + 카드 그리드 */}
      <div data-spec="pl-cards" style={{ ...WRAP, padding: "30px 28px 80px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTE, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 20 }}>
          {lang === "ko" ? `${list.length}개 병원` : `${list.length} providers matched`}
        </div>
        <div className="g-3">
          {list.map((p) => {
            const badges = [
              ...(p.english_support ? [tr("English support", lang)] : []),
              ...(p.international_ward ? [tr("International ward", lang)] : []),
              ...p.accreditation,
            ];
            const shownDepts = p.departments.slice(0, 4);
            const extra = p.departments.length - shownDepts.length;
            const reviewTxt = lang === "ko" ? `리뷰 ${p.reviews.toLocaleString()}개` : `${p.reviews.toLocaleString()} reviews`;
            return (
              <button key={p.id} onClick={() => navigate(`/providers/${p.id}`)} style={{ textAlign: "start", cursor: "pointer", background: "#fff", border: "1px solid #e7ecf5", borderRadius: 16, padding: "22px 24px", boxShadow: "0 4px 18px rgba(15,23,42,.05)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* #5 병원 섬네일 (admin: providers[].image 로 제어) — 풀블리드 배너 */}
                {p.image ? (
                  <img src={p.image} alt={tx(p.name, lang)} loading="lazy"
                    style={{ width: "calc(100% + 48px)", height: 150, objectFit: "cover", margin: "-22px -24px 16px", display: "block", background: CLOUD }} />
                ) : null}
                {/* #6 병원명 · #8 평점+리뷰수 */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.25 }}>{tx(p.name, lang)}</h3>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: INK, border: `1px solid ${LINE}`, borderRadius: 7, padding: "3px 8px", whiteSpace: "nowrap" }}>{ratingStr(p)}★</span>
                    <div style={{ fontSize: 11.5, color: MUTE, marginTop: 4 }}>{reviewTxt}</div>
                  </div>
                </div>
                {/* #7 병원 위치 */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: MUTE, margin: "7px 0 12px" }}><MapPin size={13} /> {tx(p.area, lang)}</div>
                {/* #9 병원 설명 */}
                <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, margin: "0 0 16px" }}>{tx(p.blurb, lang)}</p>
                {/* #10 진료과 (앞 4개 + +N) */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {shownDepts.map((d) => <span key={d} style={{ fontSize: 12, fontWeight: 600, color: SUB, background: CLOUD, borderRadius: 999, padding: "5px 11px" }}>{deptLabel(d, lang)}</span>)}
                  {extra > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: MUTE, background: CLOUD, borderRadius: 999, padding: "5px 11px" }}>+{extra}</span>}
                </div>
                {/* #11 병원 태그 (인증·지원) */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  {badges.map((b, i) => <span key={i} style={{ fontSize: 11.5, fontWeight: 600, color: BLUE, background: BLUE_SOFT, borderRadius: 999, padding: "5px 11px" }}>{b}</span>)}
                </div>
                {/* #12 리뷰 수 · #13 상세 이동 */}
                <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: MUTE }}>{reviewTxt}</span>
                  <span style={{ color: INK, fontSize: 12.5, fontWeight: 800, letterSpacing: ".04em", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "underline", textUnderlineOffset: 4 }}>{tr("VIEW PROVIDER", lang)} <ArrowRight size={14} /></span>
                </div>
              </button>
            );
          })}
        </div>
        {list.length === 0 && <div style={{ textAlign: "center", padding: "50px 0", color: MUTE }}>{tr("No providers match your filters.", lang)}</div>}
      </div>
    </>
  );
}

/* #13 /providers/:id — 병원 상세 (prototype demo.html#/providers/:id 구성) */
function PvEyebrow({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12.5, fontWeight: 700, color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
      <span style={{ width: 24, height: 2, background: BLUE, borderRadius: 2 }} />{children}
    </div>
  );
}
const CAT_TO_DEPT = { ophthalmology: "ophth", dental: "dental", dermatology: "derm", "hair-loss": "hair", checkup: "screen" };
const krw = (n) => "₩" + Number(n).toLocaleString();
// 병원 사진 갤러리용 이미지 풀 (다중 병원 사진은 어드민 데이터 필요 — 현재는 큐레이션 풀에서 병원별로 회전)
const GALLERY_POOL = [
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  "https://images.unsplash.com/photo-1516069677018-378515003435?w=800&q=80",
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
  "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
  "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80",
  "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
  "https://images.unsplash.com/photo-1504439468489-c8920a796a52?w=800&q=80",
];
function galleryFor(p, idx) {
  // 어드민/데이터에 실제 병원 사진·GIF가 등록되면 그대로 사용 (img 태그가 .gif도 자동 재생)
  if (Array.isArray(p.gallery) && p.gallery.length) {
    return [...new Set([p.image, ...p.gallery])];
  }
  const rot = GALLERY_POOL.slice(idx).concat(GALLERY_POOL.slice(0, idx));
  return [...new Set([p.image, ...rot])].slice(0, 8);
}
function ProviderDetailPage() {
  const { lang, navigate } = useOutletContext();
  store.useStore();
  useContent();
  const PROVIDERS = getCollection("providers");
  const PROCEDURES = getCollection("procedures");
  const { id } = useParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [openProc, setOpenProc] = useState(null);
  const [lb, setLb] = useState(null); // 라이트박스에서 보는 사진 index (null = 닫힘)
  const p = PROVIDERS.find((x) => x.id === id);
  const gallery = p ? galleryFor(p, PROVIDERS.findIndex((x) => x.id === p.id)) : [];
  // 라이트박스 키보드 조작 + 배경 스크롤 잠금
  useEffect(() => {
    if (lb === null || !gallery.length) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowRight") setLb((i) => (i + 1) % gallery.length);
      else if (e.key === "ArrowLeft") setLb((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, gallery.length]);
  if (!p) {
    return (
      <div style={{ ...WRAP, padding: "100px 28px", textAlign: "center" }}>
        <p style={{ color: MUTE }}>{tr("Provider not found.", lang)}</p>
        <button onClick={() => navigate("/providers")} style={{ ...btn(BLUE, "#fff"), marginTop: 12 }}>{tr("Back to Providers", lang)}</button>
      </div>
    );
  }
  const reviewsLabel = tr("reviews", lang);
  // 병원 전문영역에 해당하는 시술 매칭 (PROVIDERS↔PROCEDURES 병원이 달라 진료과 기준 매칭)
  const procs = PROCEDURES.filter((pr) => p.departments.includes(CAT_TO_DEPT[pr.category]));
  // 신뢰·안전 항목 (prototype pvd_trust)
  const trust = [
    [p.english_support, tr("English support", lang)],
    [p.international_ward, tr("International ward", lang)],
    [p.accreditation.length > 0, p.accreditation.join(" · ") || (tr("Accreditation", lang))],
    [true, tr("CareBridge coordinator", lang)],
  ];
  const hospitalLd = {
    "@context": "https://schema.org", "@type": ["Hospital", "MedicalOrganization"],
    name: tx(p.name, "en"), description: tx(p.blurb, "en"), url: SITE_URL + `/providers/${p.id}`, image: p.image,
    address: { "@type": "PostalAddress", addressLocality: p.area.en, addressRegion: "Seoul", addressCountry: "KR" },
    medicalSpecialty: p.departments.map((d) => deptLabel(d, "en")),
    availableLanguage: (p.languages || []).map((l) => langLabel(l, "en")),
    ...(p.reviews ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews, bestRating: 5, worstRating: 1 } } : {}),
  };
  const Block = ({ eyebrow, children, mt = 48 }) => (
    <div style={{ marginTop: mt }}>
      <PvEyebrow>{eyebrow}</PvEyebrow>
      {children}
    </div>
  );
  return (
    <>
      <Seo title={tx(p.name, lang)} description={tx(p.blurb, lang)} path={`/providers/${p.id}`}
        jsonLd={[breadcrumbJsonLd([{ name: "Providers", path: "/providers" }, { name: tx(p.name, lang), path: `/providers/${p.id}` }]), hospitalLd]} />
      {/* 네이비 풀블리드 히어로 */}
      <div data-spec="pd-hero" style={{ background: NAVY, color: "#fff" }}>
        <div style={{ ...WRAP, padding: "52px 28px 64px" }}>
          <button onClick={() => navigate("/providers")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.72)", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}><ArrowLeft size={15} /> {tr("Providers", lang)}</button>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: AQUA, margin: "22px 0 16px" }}>{tr("Providers", lang)}</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(34px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.025em", margin: 0 }}>{tx(p.name, lang)}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 20, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={15} /> {tx(p.area, lang)}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Star size={15} fill={STAR} color={STAR} /> {ratingStr(p)} ({p.reviews.toLocaleString()} {reviewsLabel})</span>
          </div>
        </div>
      </div>
      {/* 병원 사진 모자이크 (Creatrip식: 큰 메인 + 2x2 썸네일 + VIEW ALL) — 히어로 직하단 */}
      <div data-spec="pd-gallery" style={{ ...WRAP, padding: "22px 28px 6px" }}>
        <div className="gal-mosaic">
          {gallery.slice(0, 5).map((src, i) => {
            const moreCount = gallery.length - 5; // 5번째 셀에 +N 오버레이
            const showMore = i === 4 && moreCount > 0;
            return (
              <div key={i} className={`gal-cell${i === 0 ? " main" : ""}`} onClick={() => setLb(i)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLb(i); } }}>
                <img src={src} alt={`${tx(p.name, lang)} ${tr("photo", lang)} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
                {showMore && <div className="gal-more">+{moreCount}</div>}
              </div>
            );
          })}
          {gallery.length > 1 && (
            <button className="gal-viewall" onClick={() => setLb(0)}>
              <Folder size={15} /> {tr("VIEW ALL", lang)} ({gallery.length})
            </button>
          )}
        </div>
        <p style={{ fontSize: 11.5, color: MUTE, marginTop: 12 }}>{tr("Hospital photos/GIFs are replaced with real images when admin data is connected.", lang)}</p>
      </div>
      {/* 본문 2단 (좌 콘텐츠 / 우 사이드바) */}
      <div style={{ ...WRAP, padding: "20px 28px 90px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }} className="g-2">
        <div>
          {/* About */}
          <Block eyebrow={tr("Overview", lang)} mt={48}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,2.4vw,30px)", fontWeight: 800, color: INK, margin: "0 0 14px", letterSpacing: "-0.02em" }}>{tr("About", lang)}</h2>
            <p style={{ fontSize: 15.5, color: SUB, lineHeight: 1.75, margin: 0 }}>{tx(p.blurb, lang)}</p>
          </Block>
          {/* Trust & safety */}
          <Block eyebrow={tr("Trust & safety", lang)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="g-2">
              {trust.map(([ok, label], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, background: ok ? BLUE : CLOUD, color: ok ? "#fff" : MUTE }}>{ok ? <Check size={15} /> : <Shield size={14} />}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.45 }}>{label}</span>
                </div>
              ))}
            </div>
          </Block>
          {/* Departments (chips → 목록 필터) */}
          <Block eyebrow={tr("Departments", lang)}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.departments.map((d) => (
                <button key={d} onClick={() => navigate("/providers")} style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: SUB, background: CLOUD, border: "none", borderRadius: 999, padding: "7px 14px" }}>{deptLabel(d, lang)}</button>
              ))}
            </div>
          </Block>
          {/* Languages */}
          <Block eyebrow={lang === "ko" ? "통역 가능 언어" : "Languages"}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(p.languages || []).map((l) => <span key={l} style={{ fontSize: 13, fontWeight: 600, color: INK, border: `1px solid ${LINE}`, borderRadius: 999, padding: "6px 13px" }}>{langLabel(l, lang)}</span>)}
            </div>
          </Block>
          {/* 시술 (진료과 매칭) — 접이식 카드 + 금액/포함항목/시술상세/장바구니 */}
          {procs.length > 0 && (
            <Block eyebrow={tr("Treatments", lang)}>
              <div style={{ display: "grid", gap: 12 }}>
                {procs.map((pr) => {
                  const open = openProc === pr.id;
                  const dc = Math.round((1 - pr.price / pr.listPrice) * 100);
                  const inCart = mounted && store.inCart(pr.id);
                  return (
                    <div key={pr.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden" }}>
                      <button onClick={() => setOpenProc(open ? null : pr.id)} style={{ width: "100%", textAlign: "start", cursor: "pointer", background: open ? SECTION_TINT : "#fff", border: "none", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: BLUE, marginBottom: 4 }}>{tx(pr.dept, lang)}</div>
                          <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: INK }}>{tx(pr.name, lang)}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                            <span style={{ fontSize: 12.5, color: "#9aa7bd", textDecoration: "line-through" }}>${usd(pr.listPrice).toLocaleString()}</span>
                            <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: BLUE }}>${usd(pr.price).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: SUB }}>≈ {krw(pr.price)}</span>
                            {dc > 0 && <span style={{ fontSize: 11.5, fontWeight: 800, color: ACCENT }}>{dc}%↓</span>}
                          </div>
                        </div>
                        <ChevronDown size={20} color={MUTE} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                      </button>
                      {open && (
                        <div style={{ padding: "2px 18px 18px" }}>
                          <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", margin: "10px 0 8px" }}>{tr("What's included", lang)}</div>
                          <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
                            {tx(pr.includes, lang).map((x, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: SUB }}><Check size={15} color={BLUE} /> {x}</div>)}
                          </div>
                          {pr.options?.length > 0 && (
                            <>
                              <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 8px" }}>{tr("Options", lang)}</div>
                              <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                                {pr.options.map((g, gi) => (
                                  <div key={gi} style={{ background: SECTION_TINT, border: `1px solid #dbe5fb`, borderRadius: 12, padding: 14 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 8 }}>{tx(g.group, lang)} <span style={{ color: BLUE, fontWeight: 800 }}>· {lang === "ko" ? `${g.pick}개 선택` : `pick ${g.pick}`}</span></div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{tx(g.items, lang).map((it, j) => <span key={j} style={{ fontSize: 12.5, color: SUB, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 999, padding: "5px 12px" }}>{it}</span>)}</div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.65, margin: "0 0 16px" }}>{tx(pr.summary, lang)}</p>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button onClick={() => navigate(`/treatments/${pr.id}`)} style={{ ...btn(BLUE, "#fff"), padding: "10px 18px" }}>{tr("View treatment", lang)} <ArrowRight size={14} /></button>
                            {inCart
                              ? <button onClick={() => navigate("/cart")} style={{ ...btn("#eaf0ff", BLUE), border: `1px solid ${BLUE}`, padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}><Check size={15} /> {tr("Saved", lang)}</button>
                              : <button onClick={() => store.addToCart(pr.id)} style={{ ...btn("#fff", BLUE), border: `1px solid ${BLUE}`, padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}><Heart size={15} /> {tr("Save", lang)}</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Block>
          )}
          {/* 리뷰 — 평점 집계 + 리뷰 카드 (제목·병원명 제외) */}
          <Block eyebrow={lang === "ko" ? "리뷰" : "Reviews"}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", background: SECTION_TINT, border: `1px solid ${LINE}`, borderRadius: 14, marginBottom: 16 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, color: INK, lineHeight: 1 }}>{ratingStr(p)}</div>
              <div>
                <div style={{ color: STAR, fontSize: 16, letterSpacing: 2 }}>{"★".repeat(Math.round(p.reviews ? p.rating : 0))}{"☆".repeat(5 - Math.round(p.reviews ? p.rating : 0))}</div>
                <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>{p.reviews.toLocaleString()} {reviewsLabel}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="g-2">
              {REVIEWS.map((r) => (
                <div key={r.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ color: STAR, fontSize: 14, letterSpacing: 1, marginBottom: 10 }}>{"★".repeat(r.rating)}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "#1e293b", margin: "0 0 14px", fontWeight: 500 }}>"{tx(r.text, lang)}"</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BLUE, background: SECTION_TINT, borderRadius: 999, padding: "4px 11px" }}>{tx(r.treatment, lang)}</span>
                    <span style={{ fontSize: 12, color: MUTE }}>{tx(r.author, lang)}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: MUTE, marginTop: 12 }}>{tr("Patient nationality and review date appear when admin data is connected.", lang)}</p>
          </Block>
        </div>
        {/* 사이드바: CareBridge 상담 + 병원 정보 */}
        <aside data-spec="pd-book" style={{ position: "sticky", top: 90 }}>
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 24, boxShadow: "0 8px 28px rgba(15,23,42,.08)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: MUTE, letterSpacing: ".12em", textTransform: "uppercase" }}>CareBridge</div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK, margin: "10px 0 8px" }}>{tr("Book a visit", lang)}</h3>
            <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6, margin: "0 0 16px" }}>{tr("Pick a treatment and request a booking — a coordinator confirms the schedule and interpretation with this hospital.", lang)}</p>
            <button onClick={() => navigate("/treatments")} style={{ ...btn(BLUE, "#fff"), width: "100%" }}>{tr("Request a booking", lang)} <ArrowRight size={15} /></button>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 24, marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: MUTE, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14 }}>{tr("Hospital info", lang)}</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{lang === "ko" ? "위치" : "Location"}</div>
              <div style={{ fontSize: 14, color: INK, display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={14} color={MUTE} /> {tx(p.area, lang)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{tr("Rating", lang)}</div>
              <div style={{ fontSize: 14, color: INK }}>{ratingStr(p)}★ <span style={{ color: SUB }}>({p.reviews.toLocaleString()} {reviewsLabel})</span></div>
            </div>
          </div>
        </aside>
      </div>
      {/* 라이트박스(전체 보기) — 사진 클릭 / VIEW ALL 시 오픈 */}
      {mounted && lb !== null && gallery[lb] && (
        <div className="lb-ov" onClick={() => setLb(null)} role="dialog" aria-modal="true" aria-label={tr("Hospital photo gallery", lang)}>
          <button className="lb-close" onClick={() => setLb(null)} aria-label={tr("Close", lang)}><X size={20} /></button>
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            <button className="lb-nav" style={{ left: 8 }} onClick={() => setLb((i) => (i - 1 + gallery.length) % gallery.length)} aria-label="Previous"><ChevronRight size={22} style={{ transform: "rotate(180deg)" }} /></button>
            <img src={gallery[lb]} alt={`${tx(p.name, lang)} ${lb + 1}/${gallery.length}`} />
            <button className="lb-nav" style={{ right: 8 }} onClick={() => setLb((i) => (i + 1) % gallery.length)} aria-label="Next"><ChevronRight size={22} /></button>
          </div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 700, marginTop: 14 }}>{tx(p.name, lang)} · {lb + 1} / {gallery.length}</div>
          <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
            {gallery.map((src, i) => (
              <div key={i} className={`lb-thumb${i === lb ? " on" : ""}`} onClick={() => setLb(i)}>
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CompanyPage() {
  const { lang } = useOutletContext();
  const values = lang === "ko"
    ? [["신뢰", "국제 인증 병원만 제휴합니다."], ["투명성", "예약 전 비용을 명확히 안내합니다."], ["전 과정 관리", "검진·시술·교통·숙박을 한 팀이 책임집니다."]]
    : [["Trust", "We partner only with internationally accredited hospitals."], ["Transparency", "Costs are confirmed clearly before you book."], ["End-to-end", "One team handles checkups, procedures, transport and stay."]];
  return (
    <>
      <Seo title={tr("Company", lang)} description={tx(HERO.sub, lang)} path="/company" jsonLd={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Company", path: "/company" }])} />
      <PageHeader eyebrow={tr("Company", lang)} title="CareBridge Global" sub={tx(HERO.sub, lang)} />
      <div style={{ ...WRAP, padding: "60px 28px" }}>
        <div data-spec="ck-cards" className="g-3">
          {values.map((v, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e7ecf5", borderRadius: 16, padding: 28 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>{v[0]}</div>
              <p style={{ fontSize: 14.5, color: SUB, lineHeight: 1.6, margin: 0 }}>{v[1]}</p>
            </div>
          ))}
        </div>
      </div>
      <WhyKorea lang={lang} />
    </>
  );
}

function ContactPage() {
  const { lang } = useOutletContext();
  const u = UI[lang];
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => { e.preventDefault(); await submitLead(form).catch(() => {}); setSent(true); };
  return (
    <>
      <Seo title={tr("Contact Us", lang)} description={tr("Talk to a CareBridge Global coordinator.", lang)} path="/contact" />
      <PageHeader eyebrow={tr("Contact Us", lang)} title={lang === "ko" ? "코디네이터와 상담하세요" : "Talk to a coordinator"} sub={tr("Checkups, procedures, scheduling — we reply within 24 hours.", lang)} />
      <div style={{ ...WRAP, padding: "60px 28px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 40 }} className="g-2">
        <div data-spec="ct-info" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[[Mail, BRAND.email], [Phone, "+82 2-0000-0000"], [MapPin, lang === "ko" ? BRAND.addrKo : BRAND.addrEn]].map(([Ic, v], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: SECTION_TINT, color: BLUE, display: "grid", placeItems: "center", flexShrink: 0 }}><Ic size={18} /></div>
              <span dir={(Ic === Phone || Ic === Mail) ? "ltr" : undefined} style={{ fontSize: 14.5, color: SUB, paddingTop: 9, unicodeBidi: "isolate" }}>{v}</span>
            </div>
          ))}
          {/* 상담 채널 (지역별 메신저) */}
          <div data-spec="ct-channels" style={{ marginTop: 6 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: INK, marginBottom: 10 }}>{tr("Chat with us", lang)}</div>
            <ChannelButtons lang={lang} />
          </div>
        </div>
        <div data-spec="ct-form" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: SECTION_TINT, color: BLUE, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Check size={28} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{tr("Message received", lang)}</div>
              <p style={{ fontSize: 14, color: SUB }}>{tr("We'll be in touch shortly.", lang)}</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
              {[["name", tr("Name", lang)], ["email", "Email"], ["phone", tr("Phone (with country code)", lang)]].map(([k, label]) => (
                <label key={k} style={{ fontSize: 13, fontWeight: 700, color: INK }}>{label}
                  <input required={k !== "phone"} type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} value={form[k] || ""} onChange={set(k)} style={{ display: "block", width: "100%", marginTop: 6, padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, boxSizing: "border-box" }} />
                </label>
              ))}
              <label style={{ fontSize: 13, fontWeight: 700, color: INK }}>{tr("Hospital category", lang)}
                <select required value={form.category || ""} onChange={set("category")} style={{ display: "block", width: "100%", marginTop: 6, padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, boxSizing: "border-box" }}>
                  <option value="" disabled>{tr("Select", lang)}</option>
                  {(lang === "ko" ? ["건강검진", "종합병원", "피부과", "성형외과", "안과", "치과", "산부인과", "비뇨기과", "정형외과"] : ["Health check-up", "General hospital", "Dermatology", "Plastic surgery", "Ophthalmology", "Dental", "Obstetrics", "Urology", "Orthopedics"]).map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 13, fontWeight: 700, color: INK }}>{tr("Message", lang)}
                <textarea required rows={4} value={form.message} onChange={set("message")} placeholder={tr("Tell us about the treatment you're considering", lang)} style={{ display: "block", width: "100%", marginTop: 6, padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: SUB }}><input type="checkbox" required /> {tr("I'm not a robot", lang)}</label>
              <button type="submit" style={{ ...btn(BLUE, "#fff"), display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Send size={16} /> {u.send}</button>
              {/* 접수 시 자동화: 고객 이메일 + 글로벌팀 슬랙 알림 (백엔드 연동 필요) */}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function FaqPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const FAQS = getCollection("faqs");
  return (
    <>
      <Seo title="FAQ" description={tr("FAQs on checkups, Revital, payment and refunds.", lang)} path="/faq" jsonLd={faqJsonLd(FAQS.map((f) => ({ q: tx(f.q, lang), a: tx(f.a, lang) })))} />
      <PageHeader eyebrow="FAQ" title={tr("Frequently asked questions", lang)} />
      <FaqSection lang={lang} navigate={navigate} />
    </>
  );
}

/* 블로그 헬퍼 — 날짜 포맷 · 카테고리 조회 · 읽기 시간 라벨 */
function fmtBlogDate(d, lang) {
  const [y, m, day] = String(d).split("-").map(Number);
  if (lang === "ko") return `${y}년 ${m}월 ${day}일`;
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${M[(m || 1) - 1]} ${day}, ${y}`;
}
function blogCat(catId) { return BLOG_CATS.find((c) => c.id === catId); }
function readLabel(n, lang) { return lang === "ko" ? `${n}분 읽기` : `${n} min read`; }

/* 카테고리 뱃지(필) — 밝은 CareBridge 블루 틴트 */
function CatBadge({ catId, lang, style }) {
  const c = blogCat(catId);
  if (!c) return null;
  return (
    <span style={{ display: "inline-block", background: BLUE_SOFT, color: BLUE, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.03em", borderRadius: 999, padding: "5px 11px", textTransform: "uppercase", ...style }}>
      {tx(c, lang)}
    </span>
  );
}

/* 인기·관련 카드 (썸네일 + 제목 + 발췌 + by 저자 + 카테고리 뱃지) */
function BlogGridCard({ p, lang, navigate }) {
  return (
    <button className="blog-gcard" onClick={() => navigate(`/blog/${p.id}`)}>
      <div className="thumb"><img src={p.image} alt={tx(p.title, lang)} loading="lazy" /></div>
      <div style={{ padding: "18px 20px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: INK, lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: 8 }}>{tx(p.title, lang)}</div>
        <p className="ex" style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6, margin: "0 0 18px" }}>{tx(p.excerpt, lang)}</p>
        <div style={{ marginTop: "auto", borderTop: "1px dashed #D8DEE8", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: MUTE, fontWeight: 600 }}>by {tx(p.author, lang)}</span>
          <span style={{ fontSize: 12.5, color: BLUE, fontWeight: 800, letterSpacing: "0.01em" }}>{tx(blogCat(p.category) || {}, lang)}</span>
        </div>
      </div>
    </button>
  );
}

/* 하단 리스트 행 (카테고리 라벨 | 제목 | 날짜·읽기) */
function BlogListRow({ p, lang, navigate }) {
  const c = blogCat(p.category);
  return (
    <button className="blog-lrow" onClick={() => navigate(`/blog/${p.id}`)}>
      <span style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: "0.02em" }}>{c ? tx(c, lang) : ""}</span>
      <span className="lr-title" style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.4, transition: "color .14s ease" }}>{tx(p.title, lang)}</span>
      <span style={{ fontSize: 12.5, color: MUTE, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtBlogDate(p.date, lang)} · {readLabel(p.read || 5, lang)}</span>
    </button>
  );
}

/* 뉴스레터 신청 (일러스트 + 이메일 입력 + 구독 버튼, 데모 상태) */
function NewsletterSignup({ lang }) {
  const ko = lang === "ko";
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => { e.preventDefault(); if (email.trim()) setDone(true); };
  return (
    <section className="blog-news">
      <svg className="illus" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="60" cy="60" r="58" fill="#D7E4FF" />
        <rect x="26" y="40" width="68" height="46" rx="8" fill="#fff" />
        <path d="M28 45l32 22 32-22" stroke="#1B59FA" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="26" y="40" width="68" height="46" rx="8" stroke="#1B59FA" strokeWidth="2.2" fill="none" />
        <circle cx="90" cy="82" r="16" fill="#1B59FA" />
        <path d="M83 82l5 5 9-10" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <div style={{ fontFamily: DISPLAY, fontSize: "clamp(21px,2.3vw,27px)", fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 8, color: INK }}>{ko ? "케어브릿지 뉴스레터 신청하기" : "Subscribe to the CareBridge newsletter"}</div>
        <p style={{ fontSize: 14.5, color: SUB, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 560 }}>{ko ? "검진·시술 가이드와 한국 의료관광 인사이트를 이메일로 가장 먼저 받아보세요." : "Get our checkup & procedure guides and Korea medical-travel insights, straight to your inbox."}</p>
        {done ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${BLUE_100}`, color: BLUE, borderRadius: 10, padding: "12px 18px", fontSize: 14, fontWeight: 700 }}>
            <Check size={17} /> {ko ? "신청이 완료되었습니다. 감사합니다!" : "You're subscribed — thank you!"}
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 520 }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ko ? "이메일 주소" : "Email address"} style={{ flex: "1 1 240px", minWidth: 0, padding: "13px 16px", borderRadius: 10, border: `1px solid ${EDGE}`, background: "#fff", fontSize: 14, color: INK }} />
            <button type="submit" style={{ ...btn(BLUE, "#fff"), whiteSpace: "nowrap" }}>{ko ? "구독하기" : "Subscribe"} <ArrowRight size={16} /></button>
          </form>
        )}
      </div>
    </section>
  );
}

function BlogPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const BLOG = getCollection("blog");
  const ko = lang === "ko";
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("latest");   // latest | popular
  const filtered = cat === "all" ? BLOG : BLOG.filter((p) => p.category === cat);
  const byPop = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
  const top = byPop.slice(0, 6);                 // 클릭(조회) 상위 6 → 카드
  const restPool = byPop.slice(6);               // 나머지 → 리스트
  const rest = sort === "latest"
    ? [...restPool].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : restPool;                                  // popular = 조회순(이미 정렬됨)
  return (
    <>
      <Seo title="Blog" description={tr("Guides and insights on medical travel to Korea.", lang)} path="/blog" />
      {/* 히어로 배너 — 제목 + 카테고리 탭 내장 (ListeningMind /all) */}
      <div data-spec="sv7" style={{ background: BRAND_GRAD, color: "#fff" }}>
        <div style={{ ...WRAP, padding: "56px 28px 38px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#cfdcff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Blog</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{tr("Insights & Guides", lang)}</h1>
          <p style={{ fontSize: 16, color: "#d6e1ff", margin: 0, maxWidth: 620 }}>{tr("Practical guides on checkups, procedures and traveling to Korea for care.", lang)}</p>
          <div className="blog-htabs">
            <button className={"blog-htab" + (cat === "all" ? " on" : "")} onClick={() => setCat("all")}>{ko ? "전체" : "All"}</button>
            {BLOG_CATS.map((c) => (
              <button key={c.id} className={"blog-htab" + (cat === c.id ? " on" : "")} onClick={() => setCat(c.id)}>{tx(c, lang)}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...WRAP, padding: "52px 28px 88px" }}>
        {filtered.length === 0 && <p style={{ color: MUTE, fontSize: 14 }}>{ko ? "해당 카테고리의 글이 아직 없습니다." : "No posts in this category yet."}</p>}

        {/* 인기(조회) 상위 6개 카드 */}
        {top.length > 0 && (
          <>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-0.01em", margin: "0 0 22px" }}>{ko ? "인기 아티클" : "Popular articles"}</div>
            <div data-spec="bl-popular" className="blog-cards">
              {top.map((p) => <BlogGridCard key={p.id} p={p} lang={lang} navigate={navigate} />)}
            </div>
          </>
        )}

        {/* 뉴스레터 신청 */}
        <div data-spec="bl-newsletter" style={{ margin: "48px 0" }}><NewsletterSignup lang={lang} /></div>

        {/* 나머지 글 리스트 + 최신순/인기순 토글 */}
        {rest.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "0 0 6px" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{ko ? "전체 아티클" : "All articles"}</div>
              <div className="blog-sort">
                <button className={sort === "latest" ? "on" : ""} onClick={() => setSort("latest")}>{ko ? "최신순" : "Latest"}</button>
                <button className={sort === "popular" ? "on" : ""} onClick={() => setSort("popular")}>{ko ? "인기순" : "Popular"}</button>
              </div>
            </div>
            <div data-spec="bl-list" className="blog-list">
              {rest.map((p) => <BlogListRow key={p.id} p={p} lang={lang} navigate={navigate} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function BlogPostPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const BLOG = getCollection("blog");
  const { id } = useParams();
  const ko = lang === "ko";
  const p = BLOG.find((b) => b.id === id);
  if (!p) return <div style={{ ...WRAP, padding: "80px 28px", textAlign: "center" }}><p style={{ color: MUTE }}>Post not found.</p><button onClick={() => navigate("/blog")} style={{ ...btn(BLUE, "#fff") }}>Back to blog</button></div>;
  const sections = Array.isArray(p.sections) ? p.sections : [];
  const related = BLOG.filter((b) => b.id !== p.id).sort((a, b) => (a.category === p.category ? -1 : 0) - (b.category === p.category ? -1 : 0)).slice(0, 3);
  return (
    <>
      <Seo title={tx(p.title, lang)} description={tx(p.excerpt, lang)} type="article" path={`/blog/${id}`} jsonLd={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }, { name: tx(p.title, lang), path: `/blog/${id}` }])} />
      <div data-spec="bp-header" style={{ ...WRAP, maxWidth: 980, padding: "40px 28px 20px" }}>
        {/* 브레드크럼 / 뒤로 */}
        <button onClick={() => navigate("/blog")} style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, marginBottom: 22, padding: 0 }}><ArrowLeft size={16} /> {tr("Blog", lang)}</button>
        {/* 카테고리 + 제목 + 메타 */}
        <CatBadge catId={p.category} lang={lang} />
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: INK, margin: "16px 0 18px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{tx(p.title, lang)}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 13.5, color: MUTE, fontWeight: 600, marginBottom: 28 }}>
          <span style={{ color: INK, fontWeight: 700 }}>{tx(p.author, lang)}</span>
          <span style={{ color: FAINT }}>·</span><span>{fmtBlogDate(p.date, lang)}</span>
          <span style={{ color: FAINT }}>·</span><span>{readLabel(p.read || 5, lang)}</span>
        </div>
        <img src={p.image} alt={tx(p.title, lang)} style={{ width: "100%", height: "clamp(220px,38vw,400px)", objectFit: "cover", borderRadius: 20, marginBottom: 40 }} />
      </div>

      {/* 본문 + 목차(TOC) 2단 */}
      <div style={{ ...WRAP, maxWidth: 980, padding: "0 28px 40px" }}>
        <div data-spec="bp-body" className="blog-art">
          <aside className="blog-toc">
            <div style={{ fontSize: 12, fontWeight: 800, color: MUTE, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{ko ? "목차" : "In this article"}</div>
            {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{tx(s.h, lang)}</a>)}
          </aside>
          <div className="blog-body">
            <p style={{ fontSize: 18, color: SUB, lineHeight: 1.75, fontWeight: 500, margin: "0 0 34px", paddingBottom: 30, borderBottom: `1px solid ${LINE}` }}>{tx(p.excerpt, lang)}</p>
            {sections.map((s) => (
              <section key={s.id} style={{ marginBottom: 34 }}>
                <h2 id={s.id} style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 800, color: INK, letterSpacing: "-0.01em", margin: "0 0 14px", lineHeight: 1.35 }}>{tx(s.h, lang)}</h2>
                {(s.p || []).map((para, i) => (
                  <p key={i} style={{ fontSize: 16, color: SUB, lineHeight: 1.85, margin: "0 0 14px" }}>{tx(para, lang)}</p>
                ))}
              </section>
            ))}

            {/* 상담 유도 CTA (ListeningMind Demo Request 박스) */}
            <div style={{ background: BRAND_GRAD, color: "#fff", borderRadius: 20, padding: "clamp(24px,3vw,34px)", margin: "8px 0 12px" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 8 }}>{ko ? "한국 방문을 계획 중이신가요?" : "Planning your visit to Korea?"}</div>
              <p style={{ fontSize: 14.5, color: "#d6e1ff", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 520 }}>{ko ? "케어브릿지이 병원 예약부터 통역, 이동, 숙소까지 처음부터 끝까지 조율해 드립니다." : "CareBridge coordinates everything — hospital booking, interpreters, transport and stays — end to end."}</p>
              <button onClick={() => navigate("/contact")} style={{ ...btn("#fff", BLUE) }}>{ko ? "무료 상담 신청" : "Book a free consultation"} <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 관련 글 */}
      {related.length > 0 && (
        <div data-spec="bp-related" style={{ background: SECTION_TINT, borderTop: `1px solid ${LINE}`, marginTop: 32 }}>
          <div style={{ ...WRAP, padding: "56px 28px 72px" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: INK, letterSpacing: "-0.01em", marginBottom: 26 }}>{ko ? "관련 글" : "Related articles"}</div>
            <div className="blog-cards">
              {related.map((r) => <BlogGridCard key={r.id} p={r} lang={lang} navigate={navigate} />)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AccountPage() {
  const { lang, navigate } = useOutletContext();
  return (<><Seo title={UI[lang].signin} path="/account" noindex /><ClientOnly>{() => <AccountInner lang={lang} navigate={navigate} />}</ClientOnly></>);
}
function AccountInner({ lang, navigate }) {
  const ko = lang === "ko";
  const [mode, setMode] = useState("login");      // login | signup
  const [form, setForm] = useState({ name: "", email: "", pw: "", pw2: "", firstName: "", middleName: "", lastName: "", phone: "", referralCode: "", keep: true, agree: false });
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState("");
  const [signedUp, setSignedUp] = useState(false);   // 회원가입 직후 로그인 안내
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const inp = { padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, width: "100%", boxSizing: "border-box" };
  const switchMode = (m) => { setMode(m); setErr(""); };
  const doAuth = (provider) => {
    // 데모: 입력값으로 로그인. (실서비스: 인증 백엔드 + 서드파티 채널 동일인 식별 필요)
    const email = form.email || (provider ? `${provider}user@carebridge.io` : "guest@carebridge.io");
    store.login({ name: form.name || email.split("@")[0], email, provider: provider || "email" });
    navigate("/mypage?tab=info");   // ④ 로그인하면 마이페이지 고객정보 탭으로
  };
  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (mode === "login") { doAuth(null); return; }
    // ───── 회원가입 ─────
    if (!form.agree) { setErr(ko ? "이용약관에 동의해 주세요." : "Please agree to the Terms."); return; }
    if (form.pw !== form.pw2) { setErr(ko ? "비밀번호가 일치하지 않습니다." : "Passwords do not match."); return; }
    // ② 프로필만 저장(로그인 X) → ④ 로그인 페이지로 이동
    store.register({ email: form.email, firstName: form.firstName, middleName: form.middleName, lastName: form.lastName, phone: form.phone, referralCode: form.referralCode });
    setSignedUp(true);
    setMode("login");
    setForm((f) => ({ ...f, pw: "", pw2: "" }));   // 이메일은 유지, 비번만 비움
  };
  return (
    <div style={{ ...WRAP, maxWidth: 460, padding: "60px 28px 90px" }}>
      <div data-spec="ac-title" style={{ textAlign: "center", marginBottom: 22 }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 800, color: INK, margin: "0 0 6px" }}>{mode === "login" ? (tr("Sign in", lang)) : (tr("Create account", lang))}</h1>
        <p style={{ fontSize: 14, color: SUB, margin: 0 }}>{tr("Manage your reservations and checkup history.", lang)}</p>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 26, display: "grid", gap: 12 }}>
        {signedUp && mode === "login" && (
          <div style={{ background: "#EEF8F1", border: "1px solid #BFE6CD", color: "#1E8E5C", borderRadius: 9, padding: "10px 13px", fontSize: 12.5, fontWeight: 600 }}>
            {ko ? "회원가입이 완료되었습니다. 로그인해 주세요." : "Sign-up complete. Please sign in."}
          </div>
        )}
        <form data-spec="ac-form" onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          {/* ① 회원가입 정보 작성란 */}
          <input style={inp} required type="email" placeholder={ko ? "아이디 (이메일)" : "ID (email)"} value={form.email} onChange={set("email")} />
          <input style={inp} required type="password" placeholder={ko ? "비밀번호" : "Password"} value={form.pw} onChange={set("pw")} />
          {mode === "signup" && (
            <>
              <input style={inp} required type="password" placeholder={ko ? "비밀번호 확인" : "Confirm password"} value={form.pw2} onChange={set("pw2")} />
              <input style={inp} required placeholder="First name" value={form.firstName} onChange={set("firstName")} />
              <input style={inp} placeholder="Middle name" value={form.middleName} onChange={set("middleName")} />
              <input style={inp} required placeholder="Last name" value={form.lastName} onChange={set("lastName")} />
              <input style={inp} required type="tel" placeholder={ko ? "연락처" : "Phone"} value={form.phone} onChange={set("phone")} />
              <input style={inp} placeholder={ko ? "추천 코드 (선택)" : "Referral code (optional)"} value={form.referralCode} onChange={set("referralCode")} />
            </>
          )}
          {mode === "login" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, color: SUB, cursor: "pointer" }}><input type="checkbox" checked={form.keep} onChange={set("keep")} /> {ko ? "로그인 유지" : "Keep me signed in"}</label>
              <span style={{ color: MUTE }}><a style={lnk}>{ko ? "아이디 찾기" : "Find ID"}</a> · <a style={lnk}>{ko ? "비밀번호 찾기" : "Reset PW"}</a></span>
            </div>
          ) : (
            /* ② 약관 동의 체크박스 + ③ 이용약관 모달 */
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: SUB }}>
              <input type="checkbox" checked={form.agree} onChange={set("agree")} />
              <span>{ko ? "동의합니다 — " : "I agree — "}<button type="button" onClick={() => setTerms(true)} style={{ ...lnk, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 700, textDecoration: "underline" }}>{ko ? "이용약관" : "Terms of Service"}</button></span>
            </label>
          )}
          {err && <div style={{ color: ACCENT, fontSize: 12.5, fontWeight: 600 }}>{err}</div>}
          {/* ④ 회원가입 완료 → 로그인 페이지로 */}
          <button type="submit" style={{ ...btn(BLUE, "#fff") }}>{mode === "login" ? (ko ? "로그인" : "Sign in") : (ko ? "회원가입 완료" : "Create account")}</button>
        </form>
        <div style={{ textAlign: "center", fontSize: 12, color: MUTE, margin: "2px 0" }}>or</div>
        <button data-spec="ac-social" onClick={() => doAuth("google")} style={{ ...btn("#fff", INK), border: `1px solid ${LINE}`, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ fontWeight: 800, color: "#4285F4" }}>G</span> {tr("Continue with Google", lang)}</button>
        <button onClick={() => doAuth("apple")} style={{ ...btn("#111317", "#fff"), display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}> {tr("Continue with Apple", lang)}</button>
        <div style={{ textAlign: "center", fontSize: 12.5, color: SUB, marginTop: 4 }}>
          {mode === "login" ? (tr("No account? ", lang)) : (tr("Have an account? ", lang))}
          <button onClick={() => switchMode(mode === "login" ? "signup" : "login")} style={{ ...lnk, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>{mode === "login" ? (tr("Sign up", lang)) : (tr("Sign in", lang))}</button>
        </div>
        <p style={{ fontSize: 11, color: MUTE, textAlign: "center", margin: 0 }}>{tr("Prototype — demo auth", lang)}</p>
      </div>
      {terms && (
        <div data-spec="ac-terms" onClick={() => setTerms(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,15,44,.5)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 480, width: "100%", maxHeight: "80vh", overflow: "auto", padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, color: INK }}>{tr("Terms of Service", lang)}</h3><button onClick={() => setTerms(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTE }}><X size={20} /></button></div>
            <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.7 }}>{tr("Placeholder terms for the prototype demo. Full terms at launch.", lang)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
const lnk = { color: BLUE, textDecoration: "none", cursor: "pointer" };

function LegalPage() {
  const { lang } = useOutletContext();
  const { doc } = useParams();
  const titles = { privacy: { en: "Privacy Policy", ko: "개인정보처리방침" }, terms: { en: "Terms of Service", ko: "이용약관" }, refund: { en: "Refund Policy", ko: "환불정책" } };
  const t = titles[doc] || { en: "Legal", ko: "법적 고지" };
  return (
    <>
      <Seo title={tx(t, lang)} path={`/legal/${doc}`} noindex />
      <div style={{ ...WRAP, maxWidth: 800, padding: "60px 28px" }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: INK, marginBottom: 18 }}>{tx(t, lang)}</h1>
        <p style={{ fontSize: 15, color: SUB, lineHeight: 1.8 }}>{tr("This document is a placeholder for the prototype demo. Full terms will be provided at launch.", lang)}</p>
        <p style={{ fontSize: 14, color: MUTE }}>{BRAND.name} · {BRAND.email}</p>
      </div>
    </>
  );
}

function NotFound() {
  const { lang, navigate } = useOutletContext();
  return (
    <>
      <Seo title="Not found" noindex />
      <div style={{ ...WRAP, padding: "100px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, color: INK }}>404</h1>
        <p style={{ color: SUB }}>{tr("Page not found.", lang)}</p>
        <button onClick={() => navigate("/")} style={{ ...btn(BLUE, "#fff"), marginTop: 12 }}>{tr("Back home", lang)}</button>
      </div>
    </>
  );
}

/* ========================================================================
   ROUTES
   ======================================================================== */
// 콘텐츠 페이지 라우트 템플릿(EN=루트). admin·404 는 언어별 미생성.
/* /pricing — 외국인 유치용 투명 가격표 (가격/견적 관리) */
function PricingPage() {
  const { lang, navigate } = useOutletContext();
  useContent();
  const P = getCollection("pricing") || {};
  const rows = Array.isArray(P.rows) ? P.rows : [];
  const th = { padding: "12px 14px", textAlign: "start", fontSize: 12, fontWeight: 800, color: MUTE, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" };
  const td = { padding: "14px 14px", verticalAlign: "top" };
  return (
    <>
      <Seo title={tx(P.title, lang)} description={tx(P.note, lang)} path="/pricing" />
      <PageHeader eyebrow={tx(P.eyebrow, lang)} title={tx(P.title, lang)} sub={tx(P.note, lang)} />
      <div style={{ ...WRAP, padding: "16px 28px 80px" }}>
        <div data-spec="pc-table" style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${LINE}`, background: BG_SOFT }}>
                <th style={th}>{tr("Category", lang)}</th>
                <th style={th}>{tr("Treatment", lang)}</th>
                <th style={{ ...th, textAlign: "end" }}>{tr("Price", lang)}</th>
                <th style={th}>{tr("Notes", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                  <td style={{ ...td, color: SUB, whiteSpace: "nowrap" }}>{tx(r.category, lang)}</td>
                  <td style={{ ...td, fontWeight: 700, color: INK }}>{tx(r.name, lang)}</td>
                  <td style={{ ...td, textAlign: "end", fontWeight: 800, color: BLUE, whiteSpace: "nowrap" }}><span dir="ltr" style={{ unicodeBidi: "isolate" }}>{r.price}</span></td>
                  <td style={{ ...td, color: SUB }}>{tx(r.note, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-spec="pc-cta" style={{ marginTop: 22, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => navigate("/contact")} style={{ ...btn(BLUE, "#fff") }}>{tr("Get a free quote", lang)}</button>
          <span style={{ fontSize: 12, color: MUTE, maxWidth: 520 }}>{tx(P.note, lang)}</span>
        </div>
      </div>
    </>
  );
}

const PAGE_ROUTES = [
  { index: true, element: <Home /> },
  { path: "pricing", element: <PricingPage /> },
  { path: "company", element: <CompanyPage /> },
  { path: "providers", element: <ProvidersPage /> },
  { path: "providers/:id", element: <ProviderDetailPage />, getStaticPaths: () => PROVIDERS.map((p) => `providers/${p.id}`) },
  { path: "treatments", element: <TreatmentListPage /> },
  { path: "treatments/:id", element: <TreatmentDetailPage />, getStaticPaths: () => PROCEDURES.map((p) => `treatments/${p.id}`) },
  { path: "booking", element: <BookingPage /> },
  { path: "cart", element: <CartPage /> },
  { path: "mypage", element: <MyPage /> },
  { path: "contact", element: <ContactPage /> },
  { path: "faq", element: <FaqPage /> },
  { path: "blog", element: <BlogPage /> },
  { path: "blog/:id", element: <BlogPostPage />, getStaticPaths: () => BLOG.map((p) => `blog/${p.id}`) },
  { path: "legal/:doc", element: <LegalPage />, getStaticPaths: () => ["privacy", "terms", "refund"].map((d) => `legal/${d}`) },
  { path: "account", element: <AccountPage /> },
];

// 언어 접두 트리(ko/ar/ja): index → /{lang}, 그 외 → /{lang}/path, getStaticPaths 접두 부착
const langTree = (lang) => PAGE_ROUTES.map((r) => {
  if (r.index) return { path: lang, element: r.element };
  const child = { path: `${lang}/${r.path}`, element: r.element };
  if (r.getStaticPaths) child.getStaticPaths = () => r.getStaticPaths().map((p) => `${lang}/${p}`);
  return child;
});

export const routes = [
  {
    path: "/", element: <Layout />,
    children: [
      ...PAGE_ROUTES,                                 // EN (루트)
      { path: "admin", element: <AdminPage /> },      // admin: EN 전용(noindex)
      ...PREFIX_LANGS.flatMap(langTree),              // /ko /ar /ja 프리렌더
      { path: "*", element: <NotFound /> },
    ],
  },
];

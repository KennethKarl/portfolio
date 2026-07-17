/* =========================================================================
   theme.js — 디자인 토큰 (Desktop prototype `demo.html` 100% 반영)
   CareBridge brand 시스템: brand 블루 램프 + SAFE BLACK ink + paper 뉴트럴.
   export 명은 유지(전 컴포넌트 호환). 값만 프로토타입에 맞춤.
   ========================================================================= */

// Brand (prototype `brand` ramp: 500=#1B59FA anchor, 600 hover #1546C7 / 실제 hover #0F3FCC)
export const BLUE = "#1B59FA";        // primary (CTA·링크·강조) — brand.500
export const BLUE_DARK = "#0F3FCC";   // hover/pressed (sd-btn-primary:hover)
export const BLUE_SOFT = "#EEF3FF";   // tinted background — brand.50
export const BLUE_50 = "#EEF3FF";
export const BLUE_100 = "#D7E2FF";
export const ACCENT = "#C8321F";      // danger.500 (취소/오류) — 코랄 강조 폐기
export const ACCENT_SOFT = "#FDE3E3";

// Neutrals (prototype home-sd ink + paper)
export const INK = "#000F2C";         // 본문 헤딩 — SAFE BLACK
export const INK_SOFT = "#2B3858";    // sd-ink-soft
export const SUB = "#2B3858";         // 보조 텍스트(강) — sd-ink-soft
export const MUTE = "#6A7896";        // 흐린 텍스트 — sd-ink-mute
export const FAINT = "#A6B0BE";       // placeholder/연한
export const LINE = "#E5E7EC";        // 보더 — sd-line
export const LINE_STRONG = "#000F2C"; // 강한 보더
export const EDGE = "#CCD3DC";        // 인풋 보더 — paper.edge
export const BG = "#FFFFFF";
export const BG_SOFT = "#F7F8FA";     // 섹션 배경 — sd-mist
export const CLOUD = "#F2F3F6";       // sd-cloud

// Status (prototype success/warning/danger)
export const SUCCESS = "#1E8E5C";     // success.500
export const SUCCESS_SOFT = "#DFF5E7";
export const STAR = "#E8A317";        // 별점(amber)

// Secondary brand accents (CareBridge) — 절제 사용
export const AQUA = "#28E8FF";
export const LIME = "#CDFF1C";

// Dark sections / 그라디언트
export const NAVY = "#000F2C";        // 다크 섹션·푸터 — SAFE BLACK
export const NAVY_LINE = "#1B2942";
export const FOOTER_BG = "#000F2C";
export const FOOTER_LINE = "#1B2942";
export const BRAND_GRAD =             // 브랜드 3색 그라디언트 (히어로·CTA·강조 바)
  "linear-gradient(118deg, #000D96 0%, #0A2BD0 46%, #1B59FA 100%)";
export const SECTION_TINT = "#F7F8FA"; // 연한 섹션 배경 — sd-mist

// 절감/성공 배지 별칭 (기존 코드 호환)
export const GREEN = "#1E8E5C";
export const GREEN_SOFT = "#DFF5E7";

// 폰트: prototype 은 display 도 Pretendard Variable (800, 자간 -0.03em)
export const FONT_STACK =
  "'Pretendard Variable','Noto Sans','Noto Sans KR',Helvetica,Arial,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif";
export const DISPLAY = FONT_STACK;

// 그림자 (prototype boxShadow)
export const SHADOW_CARD = "0 1px 2px rgba(0,15,44,0.04), 0 1px 3px rgba(15,21,32,0.06)";
export const SHADOW_HOVER = "0 2px 6px rgba(15,21,32,0.06), 0 8px 24px rgba(15,21,32,0.08)";
export const SHADOW_POP = "0 20px 60px rgba(10,37,112,0.24)";

// "View more →" 칩/링크 (prototype sd-chip 스타일: radius 999, hover 시 blue)
export const viewMoreBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "#fff", color: INK, border: `1px solid ${LINE}`,
  borderRadius: 999, padding: "7px 14px", fontWeight: 600, fontSize: 12.5,
  cursor: "pointer", whiteSpace: "nowrap",
};

/* 버튼 helper — prototype sd-btn-primary (radius 8, hover 는 index.css 가 처리) */
export const btn = (bg, fg) => ({
  background: bg, color: fg, border: "none",
  padding: "13px 24px", borderRadius: 8, fontWeight: 600,
  cursor: "pointer", fontSize: 14, letterSpacing: "0.02em",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
});
export const money = (n) => "$" + Number(n).toLocaleString();
export const txt = (v, lang) => (v && typeof v === "object" ? v[lang] ?? v.en : v);

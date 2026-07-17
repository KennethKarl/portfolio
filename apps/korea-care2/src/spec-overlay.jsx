/* =========================================================================
   spec-overlay.jsx — 기획 모드 오버레이 (홈 전용) + 커스텀 앵커 편집기
   · 토글(우하단) / ?spec=1 로 on
   · 기본 마커(s1~s7)는 홈 섹션(data-spec)에 앵커
   · "+ 마커 추가" → 화면 아무 곳 클릭 → 자유 위치 마커 생성(드래그 이동 가능)
   · 마커 클릭 → 팝오버(요약 + 상세보기 + 수정/삭제)
   · 수정 → 모달에서 라벨/제목/요약/상세/요구사항 편집
   · 전부 localStorage(kc2_spec_markers) 저장. "초기화"로 기본값 복원.
   client-only.
   ========================================================================= */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { BLUE as TEAL, BLUE_SOFT as TEAL_SOFT, INK, SUB, MUTE, LINE, ACCENT, GREEN, btn } from "./theme.js";
import SEED from "./spec-markers-seed.json";

const KEY = "kc2_spec_markers_v14";
const el = (id, label, title, desc, detail, req) => ({ id, type: "el", sel: `[data-spec="${id}"]`, label, title, desc, detail, req });

const DEFAULTS = SEED;

const lsGet = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
const lsSet = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) {} };

export default function SpecOverlay() {
  const [on, setOn] = useState(() => { try { return new URLSearchParams(window.location.search).get("spec") === "1"; } catch { return false; } });
  const [markers, setMarkers] = useState(() => lsGet() || DEFAULTS);
  const [rects, setRects] = useState({});
  const [sel, setSel] = useState(null);       // 팝오버 marker id
  const [editing, setEditing] = useState(null); // 편집 중 marker(복사본) or null
  const [detail, setDetail] = useState(null);   // 상세 모달 marker id
  const [placing, setPlacing] = useState(false);
  const drag = useRef(null);

  const save = (next) => { setMarkers(next); lsSet(next); };
  useEffect(() => { if (!lsGet()) lsSet(DEFAULTS); }, []);

  const measure = useCallback(() => {
    const r = { __sx: window.scrollX, __sy: window.scrollY };
    markers.forEach((m) => { if (m.type === "el") { const el = document.querySelector(m.sel); if (el) { const b = el.getBoundingClientRect(); r[m.id] = { top: b.top, left: b.left }; } } });
    setRects(r);
  }, [markers]);

  useEffect(() => {
    if (!on) return;
    measure();
    const f = () => { if (!drag.current) measure(); };
    window.addEventListener("scroll", f, true);
    window.addEventListener("resize", f);
    const t = setInterval(f, 600);
    return () => { window.removeEventListener("scroll", f, true); window.removeEventListener("resize", f); clearInterval(t); };
  }, [on, measure]);

  /* 패널이 열리면 본문을 패널 폭만큼 좁혀 '옆에' 배치 (넓은 화면만; 모바일은 오버레이) */
  const PANEL_W = 460;
  useEffect(() => {
    const apply = () => {
      const open = on && !!sel;
      const wide = typeof window !== "undefined" && window.innerWidth >= 900;
      document.body.style.transition = "padding-right .2s ease";
      document.body.style.paddingRight = open && wide ? PANEL_W + "px" : "";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => { window.removeEventListener("resize", apply); document.body.style.paddingRight = ""; };
  }, [on, sel]);

  const posOf = (m) => {
    if (m.type === "el") { const r = rects[m.id]; return r ? { top: r.top + 8, left: r.left + 8 } : null; }
    return { top: m.y - (rects.__sy || 0), left: m.x - (rects.__sx || 0) };
  };

  /* --- 커스텀 마커 추가 --- */
  const onPlaceClick = (e) => {
    const x = e.clientX + window.scrollX, y = e.clientY + window.scrollY;
    const n = markers.filter((m) => m.type === "xy").length + 1;
    const m = { id: "c" + Date.now(), type: "xy", label: "C" + n, title: "새 마커", desc: "", detail: "", req: "", x, y };
    save([...markers, m]); setPlacing(false); setSel(null); setEditing({ ...m });
  };

  /* --- 드래그 이동 (모든 마커; 기본 마커도 끌면 자유 위치로 전환) --- */
  const startDrag = (e, m) => {
    e.preventDefault(); e.stopPropagation();
    drag.current = { id: m.id, moved: false, sx: e.clientX, sy: e.clientY };
    const move = (ev) => {
      const d = drag.current; if (!d) return;
      if (Math.abs(ev.clientX - d.sx) > 3 || Math.abs(ev.clientY - d.sy) > 3) d.moved = true;
      if (d.moved) setMarkers((prev) => prev.map((x) => (x.id === d.id ? { ...x, type: "xy", x: ev.clientX + window.scrollX, y: ev.clientY + window.scrollY } : x)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      const d = drag.current; drag.current = null;
      if (d && d.moved) setMarkers((prev) => { lsSet(prev); return prev; }); // 최신 위치 영속화
      else setSel((s) => (s === m.id ? null : m.id));
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const m = sel ? markers.find((x) => x.id === sel) : null;
  const dm = detail ? markers.find((x) => x.id === detail) : null;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const removeMarker = (id) => { save(markers.filter((x) => x.id !== id)); setSel(null); setEditing(null); setDetail(null); };
  const saveEdit = () => { save(markers.map((x) => (x.id === editing.id ? { ...editing } : x))); setEditing(null); };

  return (
    <>
      {/* 토글 */}
      <button onClick={() => { setOn((o) => !o); setSel(null); setPlacing(false); }} title="기획 모드"
        style={{ position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)", zIndex: 9000, ...btn(on ? ACCENT : GREEN, "#fff"), boxShadow: "0 6px 20px rgba(0,0,0,.18)" }}>
        {on ? "✕ 기획 모드 닫기" : "📐 기획 모드"}
      </button>

      {/* 툴바 */}
      {on && (
        <div style={{ position: "fixed", left: 16, bottom: 16, zIndex: 9000, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, boxShadow: "0 6px 20px rgba(0,0,0,.12)", width: 240 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 8 }}>📐 기획 모드</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => { setPlacing((p) => !p); setSel(null); }} style={{ ...btn(placing ? ACCENT : TEAL, "#fff"), fontSize: 12, padding: "7px 10px" }}>{placing ? "위치 클릭…" : "+ 마커 추가"}</button>
            <button onClick={() => save(DEFAULTS)} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}`, fontSize: 12, padding: "7px 10px" }}>초기화</button>
          </div>
          <div style={{ fontSize: 11, color: MUTE, marginTop: 8, lineHeight: 1.45 }}>
            {placing ? "화면에서 마커를 놓을 위치를 클릭하세요." : "마커 클릭=설명 · 드래그=이동(기본 마커도 가능) · 공유 "}{!placing && <code>?spec=1</code>}
          </div>
        </div>
      )}

      {/* 배치 클릭 캐처 */}
      {on && placing && (
        <div onClick={onPlaceClick} style={{ position: "fixed", inset: 0, zIndex: 8700, cursor: "crosshair", background: "rgba(27,89,250,.05)" }} />
      )}

      {/* 마커 */}
      {on && markers.map((mk) => {
        const p = posOf(mk); if (!p) return null;
        const active = sel === mk.id;
        return (
          <button key={mk.id}
            onPointerDown={(e) => startDrag(e, mk)}
            title="클릭=설명 · 드래그=이동"
            style={{ position: "fixed", top: Math.max(8, p.top), left: Math.max(4, p.left), zIndex: 8800,
              background: mk.type === "xy" ? TEAL : ACCENT, color: "#fff", border: "2px solid #fff", borderRadius: 8,
              minWidth: 30, height: 24, padding: "0 7px", fontSize: 12, fontWeight: 800,
              cursor: "grab", touchAction: "none",
              boxShadow: active ? `0 0 0 3px ${ACCENT}55` : "0 2px 8px rgba(0,0,0,.25)" }}>
            {mk.label}
          </button>
        );
      })}

      {/* 우측 설명 패널 (Figma 스토리보드식 사이드 도크) */}
      {on && m && (() => {
        const lines = (m.detail || "").split("\n").map((s) => s.trim()).filter(Boolean);
        return (
          <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "min(460px, calc(100vw - 24px))", zIndex: 8900, background: "#fff", borderLeft: `1px solid ${LINE}`, boxShadow: "-14px 0 44px rgba(0,0,0,.16)", display: "flex", flexDirection: "column", animation: "specSlideIn .18s ease" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 22px 16px", borderBottom: `1px solid ${LINE}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ background: m.type === "xy" ? TEAL : ACCENT, color: "#fff", borderRadius: 8, padding: "3px 11px", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{m.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: INK, lineHeight: 1.3 }}>{m.title}</span>
              </div>
              <button onClick={() => setSel(null)} style={{ ...xBtn, fontSize: 22 }}>✕</button>
            </div>
            {/* 본문 (스크롤) */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Description</div>
              {m.desc && <div style={{ fontSize: 15, color: SUB, lineHeight: 1.7 }}>{m.desc}</div>}
              {lines.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${LINE}`, display: "grid", gap: 8 }}>
                  {lines.map((raw, i) => {
                    if (raw.startsWith("■")) {
                      return <div key={i} style={{ fontSize: 12.5, fontWeight: 800, color: INK, letterSpacing: "0.04em", marginTop: i ? 12 : 0, marginBottom: 1 }}>{raw.replace(/^■\s*/, "")}</div>;
                    }
                    const num = raw.match(/^(\d+)[).]\s*(.*)$/);
                    const text = num ? num[2] : raw.replace(/^[·•\-]\s*/, "");
                    const d = text.indexOf(" — ");
                    const label = d > -1 ? text.slice(0, d) : null;
                    const body = d > -1 ? text.slice(d + 3) : text;
                    return (
                      <div key={i} style={{ fontSize: 14, lineHeight: 1.68, display: "flex", gap: 9 }}>
                        <span style={{ color: TEAL, fontWeight: 800, flexShrink: 0, marginTop: 1, minWidth: num ? 15 : 8, textAlign: num ? "right" : "left" }}>{num ? num[1] + "." : "•"}</span>
                        <span style={{ color: SUB }}>{label && <b style={{ color: INK, fontWeight: 800 }}>{label} — </b>}{body}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {m.req && <div style={{ marginTop: 18, background: TEAL_SOFT, color: TEAL, borderRadius: 10, padding: "11px 14px", fontSize: 13.5, fontWeight: 600, lineHeight: 1.55 }}>🔗 {m.req}</div>}
            </div>
            {/* 푸터 */}
            <div style={{ display: "flex", gap: 8, padding: "14px 22px", borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setEditing({ ...m })} style={{ ...btn(TEAL, "#fff"), fontSize: 14, padding: "11px 16px", flex: 1 }}>수정</button>
              <button onClick={() => removeMarker(m.id)} style={{ ...btn("#fff", ACCENT), border: `1px solid ${ACCENT}`, fontSize: 14, padding: "11px 16px" }}>삭제</button>
            </div>
            <style>{`@keyframes specSlideIn{from{transform:translateX(24px);opacity:.5}to{transform:translateX(0);opacity:1}}`}</style>
          </div>
        );
      })()}

      {/* 상세 모달 */}
      {on && dm && (
        <div onClick={() => setDetail(null)} style={modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>
                <span style={{ background: dm.type === "xy" ? TEAL : ACCENT, color: "#fff", borderRadius: 7, padding: "2px 9px", fontSize: 14, marginRight: 8 }}>{dm.label}</span>{dm.title}
              </h3>
              <button onClick={() => setDetail(null)} style={xBtn}>✕</button>
            </div>
            <p style={{ color: SUB, lineHeight: 1.65, marginTop: 14, fontSize: 14.5, whiteSpace: "pre-wrap" }}>{dm.detail || "(상세 설명 없음)"}</p>
            {dm.req && <div style={{ marginTop: 16, background: TEAL_SOFT, color: TEAL, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>🔗 {dm.req}</div>}
            <div style={{ textAlign: "right", marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setEditing({ ...dm }); setDetail(null); }} style={{ ...btn("#fff", TEAL), border: `1px solid ${TEAL}` }}>수정</button>
              <button onClick={() => setDetail(null)} style={{ ...btn(TEAL, "#fff") }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {on && editing && (
        <div onClick={() => setEditing(null)} style={modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: INK }}>마커 편집 · {editing.label}</h3>
              <button onClick={() => setEditing(null)} style={xBtn}>✕</button>
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <Field label="라벨"><input style={inp} value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /></Field>
              <Field label="제목"><input style={inp} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="요약 (팝오버)"><textarea rows={2} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
              <Field label="상세 (모달)"><textarea rows={4} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} value={editing.detail} onChange={(e) => setEditing({ ...editing, detail: e.target.value })} /></Field>
              <Field label="요구사항 링크/메모"><input style={inp} value={editing.req} onChange={(e) => setEditing({ ...editing, req: e.target.value })} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              <button onClick={() => removeMarker(editing.id)} style={{ ...btn("#fff", ACCENT), border: `1px solid ${ACCENT}` }}>삭제</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(null)} style={{ ...btn("#fff", SUB), border: `1px solid ${LINE}` }}>취소</button>
                <button onClick={saveEdit} style={{ ...btn(TEAL, "#fff") }}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }) {
  return <label style={{ display: "block" }}><span style={{ fontSize: 12, fontWeight: 600, color: SUB, display: "block", marginBottom: 4 }}>{label}</span>{children}</label>;
}
const inp = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, color: INK, outline: "none", boxSizing: "border-box" };
const xBtn = { border: "none", background: "transparent", cursor: "pointer", color: "#9aa5b1", fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 };
const modalBackdrop = { position: "fixed", inset: 0, zIndex: 9100, background: "rgba(15,23,42,.5)", display: "grid", placeItems: "center", padding: 20 };
const modalCard = { width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,.3)" };

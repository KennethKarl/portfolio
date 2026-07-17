/* =========================================================================
   admin.jsx — 콘텐츠 관리(CMS) 페이지  (/admin, noindex)
   ---------------------------------------------------------------------------
   inventory §1 핵심 CMS 리스트 12 컬렉션을 추가/편집/삭제/순서변경 한다.
   - 데이터는 content.js 를 통해 읽고(getList) 저장(saveCollection)한다.
   - 저장은 localStorage 즉시 반영(프리뷰) + API_BASE 설정 시 PUT 영속화.
   - 인증: VITE_ADMIN_TOKEN 설정 시 토큰 게이트, 미설정 시 프리뷰 모드 배너.
   - 필드 폼은 시드 값의 *형태* 로부터 재귀 생성(i18n {en,ko}·배열·중첩객체 자동).
   ========================================================================= */
import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Seo } from "./seo.jsx";
import { tx } from "./data.js";
import { ADMIN_TOKEN } from "./config.js";
import {
  COLLECTIONS, getList, saveCollection, resetCollection, useContent,
  exportContent, clearLocalOverrides, getLangsSetting, saveLangs, resetLangs,
} from "./content.js";
import { publishContentJson, PUBLISH_TARGET } from "./github.js";
import { LANG_CODES, labelOf, dirOf, SEED_CODES } from "./langs.js";
import { BLUE, INK, SUB, MUTE, LINE, BG_SOFT, GREEN, DISPLAY, btn } from "./theme.js";
import { ReservationsPanel, LeadsPanel, AnalyticsPanel } from "./admin-ops.jsx";
import { HospitalsPanel, TreatmentsPanel, BlogPanel } from "./admin-providers.jsx";

/* ---------------- 공통 스타일 ---------------- */
const inp = { width: "100%", padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
const lbl = { fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4, display: "block" };
const card = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 };

/* ---------------- 형태 판별 ---------------- */
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const isI18n = (v) => isObj(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LANG_CODES.includes(k));
const isI18nList = (v) => isI18n(v) && (Array.isArray(v.en) || Array.isArray(v.ko));
const langGrid = { display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))`, gap: 10 };
const isStrArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string" || typeof x === "number");
const isImgKey = (k) => /image|hero|before|after|square|gallery|photo|thumb/i.test(k);
/* 콘텐츠 편집기에 노출할 '원문(소스)' 언어. 그 외 언어(EN·아랍어·일본어)는
   번역 엑셀('언어 관리 → 번역 엑셀')에서 관리 → 편집기에서 숨김. */
const EDIT_LANGS = ["ko"];

/* ---------------- 불변 경로 업데이트 ---------------- */
function setIn(root, path, val) {
  if (path.length === 0) return val;
  const [k, ...rest] = path;
  if (Array.isArray(root)) { const c = root.slice(); c[k] = setIn(root[k], rest, val); return c; }
  const c = { ...(root || {}) }; c[k] = setIn(root ? root[k] : undefined, rest, val); return c;
}
function blankLike(v) {
  if (typeof v === "string") return "";
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.length && isObj(v[0]) ? [blankLike(v[0])] : [];
  if (isObj(v)) return Object.fromEntries(Object.keys(v).map((k) => [k, blankLike(v[k])]));
  return "";
}
const clone = (v) => JSON.parse(JSON.stringify(v ?? null));
const human = (k) => k.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase());

/* ====================================================================
   필드 렌더러 (재귀)
   ==================================================================== */
function Field({ k, value, path, onChange }) {
  // i18n 리스트 {en:[],ko:[],...} — 언어별(레지스트리 구동)
  if (isI18nList(value)) {
    return (
      <div style={{ marginBottom: 12 }}>
        <span style={lbl}>{human(k)} (언어별 리스트)</span>
        <div style={langGrid}>
          {EDIT_LANGS.map((L) => (
            <StrList key={L} k={labelOf(L)} value={value[L] || []} path={[...path, L]} onChange={onChange} rtl={dirOf(L) === "rtl"} />
          ))}
        </div>
      </div>
    );
  }
  // i18n 텍스트 {en,ko,...} — 언어별(레지스트리 구동)
  if (isI18n(value)) {
    return (
      <div style={{ marginBottom: 12 }}>
        <span style={lbl}>{human(k)}</span>
        <div style={langGrid}>
          {EDIT_LANGS.map((L) => (
            <div key={L}>
              <span style={{ fontSize: 10, color: MUTE }}>{labelOf(L)}</span>
              <textarea value={value[L] ?? ""} onChange={(e) => onChange([...path, L], e.target.value)}
                dir={dirOf(L)} rows={String(value[L] || "").length > 60 ? 3 : 1} style={{ ...inp, resize: "vertical", textAlign: dirOf(L) === "rtl" ? "right" : "left" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 문자열 배열
  if (isStrArray(value)) {
    return <div style={{ marginBottom: 12 }}><span style={lbl}>{human(k)}</span><StrList value={value} path={path} onChange={onChange} img={isImgKey(k)} /></div>;
  }
  // 객체 배열
  if (Array.isArray(value)) {
    return <ObjArray k={k} value={value} path={path} onChange={onChange} />;
  }
  // 중첩 객체
  if (isObj(value)) {
    return (
      <fieldset style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "10px 12px", margin: "0 0 12px" }}>
        <legend style={{ fontSize: 11, fontWeight: 800, color: SUB, padding: "0 6px" }}>{human(k)}</legend>
        {Object.keys(value).map((ck) => <Field key={ck} k={ck} value={value[ck]} path={[...path, ck]} onChange={onChange} />)}
      </fieldset>
    );
  }
  // boolean
  if (typeof value === "boolean") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: INK }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(path, e.target.checked)} /> {human(k)}
      </label>
    );
  }
  // number
  if (typeof value === "number") {
    return (
      <div style={{ marginBottom: 12 }}><span style={lbl}>{human(k)}</span>
        <input type="number" value={value} onChange={(e) => onChange(path, e.target.value === "" ? 0 : Number(e.target.value))} style={inp} />
      </div>
    );
  }
  // 문자열(또는 null) — 이미지면 미리보기
  const str = value ?? "";
  return (
    <div style={{ marginBottom: 12 }}>
      <span style={lbl}>{human(k)}</span>
      <input value={str} onChange={(e) => onChange(path, e.target.value)} style={inp} placeholder={value == null ? "(비어 있음)" : ""} />
      {isImgKey(k) && str ? <img src={str} alt="" style={{ marginTop: 6, height: 54, borderRadius: 6, border: `1px solid ${LINE}`, objectFit: "cover" }} /> : null}
    </div>
  );
}

/* 문자열 리스트 에디터 */
function StrList({ k, value, path, onChange, img, rtl }) {
  const set = (i, v) => onChange([...path, i], v);
  const add = () => onChange(path, [...value, ""]);
  const del = (i) => onChange(path, value.filter((_, j) => j !== i));
  return (
    <div>
      {k && <span style={{ fontSize: 10, color: MUTE }}>{k}</span>}
      <div style={{ display: "grid", gap: 6 }}>
        {value.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input value={it ?? ""} onChange={(e) => set(i, e.target.value)} dir={rtl ? "rtl" : "ltr"} style={{ ...inp, textAlign: rtl ? "right" : "left" }} />
            {img && it ? <img src={it} alt="" style={{ height: 32, width: 32, borderRadius: 5, objectFit: "cover", border: `1px solid ${LINE}` }} /> : null}
            <button onClick={() => del(i)} style={miniBtn("#fdecec", "#e5484d")}>✕</button>
          </div>
        ))}
        <button onClick={add} style={{ ...miniBtn(BG_SOFT, BLUE), justifySelf: "start" }}>+ 추가</button>
      </div>
    </div>
  );
}

/* 객체 배열 에디터 (옵션 그룹·스캔 그룹 items 등) */
function ObjArray({ k, value, path, onChange }) {
  const add = () => onChange(path, [...value, blankLike(value[0] || {})]);
  const del = (i) => onChange(path, value.filter((_, j) => j !== i));
  return (
    <fieldset style={{ border: `1px dashed ${LINE}`, borderRadius: 10, padding: "10px 12px", margin: "0 0 12px" }}>
      <legend style={{ fontSize: 11, fontWeight: 800, color: SUB, padding: "0 6px" }}>{human(k)} · {value.length}</legend>
      <div style={{ display: "grid", gap: 10 }}>
        {value.map((it, i) => (
          <div key={i} style={{ ...card, padding: 12, position: "relative" }}>
            <button onClick={() => del(i)} style={{ ...miniBtn("#fdecec", "#e5484d"), position: "absolute", top: 8, right: 8 }}>삭제</button>
            {isObj(it)
              ? Object.keys(it).map((ck) => <Field key={ck} k={ck} value={it[ck]} path={[...path, i, ck]} onChange={onChange} />)
              : <Field k={`#${i + 1}`} value={it} path={[...path, i]} onChange={onChange} />}
          </div>
        ))}
        <button onClick={add} style={{ ...miniBtn(BG_SOFT, BLUE), justifySelf: "start" }}>+ 항목 추가</button>
      </div>
    </fieldset>
  );
}

const miniBtn = (bg, fg) => ({ background: bg, color: fg, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" });

/* ====================================================================
   항목 편집기
   ==================================================================== */
function ItemEditor({ meta, list, index, onSaved, onCancel }) {
  const [draft, setDraft] = useState(() => clone(list[index]));
  const [busy, setBusy] = useState(false);
  const onChange = (path, val) => setDraft((d) => setIn(d, path, val));
  const save = async () => {
    setBusy(true);
    const next = list.slice(); next[index] = draft;
    try { await saveCollection(meta.key, next); onSaved(); }
    finally { setBusy(false); }
  };
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: INK }}>항목 편집 #{index + 1}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={miniBtn(BG_SOFT, SUB)}>취소</button>
          <button onClick={save} disabled={busy} style={{ ...btn(BLUE, "#fff"), padding: "8px 16px", opacity: busy ? .6 : 1 }}>{busy ? "저장 중…" : "저장"}</button>
        </div>
      </div>
      {Object.keys(draft || {}).map((ck) => <Field key={ck} k={ck} value={draft[ck]} path={[ck]} onChange={onChange} />)}
    </div>
  );
}

/* ====================================================================
   컬렉션 패널
   ==================================================================== */
function CollectionPanel({ meta }) {
  useContent();
  const list = getList(meta.key);
  const [editing, setEditing] = useState(null);   // index | "preview-only"
  const label = (it, i) => {
    const t = it?.[meta.title];
    const s = isObj(t) ? tx(t, "en") : (t ?? `#${i + 1}`);
    return String(s || `#${i + 1}`);
  };
  const mutate = async (next) => { await saveCollection(meta.key, next); };
  const addItem = () => { const tpl = blankLike(list[0] || {}); if (meta.idField) tpl[meta.idField] = `${meta.key}-${Date.now()}`; mutate([...list, tpl]).then(() => setEditing(list.length)); };
  const dup = (i) => { const c = clone(list[i]); if (meta.idField) c[meta.idField] = `${c[meta.idField] || meta.key}-copy-${Date.now()}`; const next = list.slice(); next.splice(i + 1, 0, c); mutate(next); };
  const del = (i) => { if (typeof window !== "undefined" && !window.confirm("이 항목을 삭제할까요?")) return; mutate(list.filter((_, j) => j !== i)); if (editing === i) setEditing(null); };
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= list.length) return; const next = list.slice(); [next[i], next[j]] = [next[j], next[i]]; mutate(next); };

  return (
    <div data-spec={"adm-col-" + meta.key}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>{tx(meta.label, "ko")} <span style={{ fontSize: 13, color: MUTE }}>· {list.length}건</span></div>
          <div style={{ fontSize: 12, color: MUTE }}>{meta.key}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addItem} style={{ ...btn(BLUE, "#fff"), padding: "8px 14px" }}>+ 추가</button>
          <button onClick={() => { if (window.confirm("이 컬렉션을 시드(기본값)로 되돌릴까요? 편집 내용이 사라집니다.")) { resetCollection(meta.key); setEditing(null); } }} style={miniBtn(BG_SOFT, SUB)}>시드 복원</button>
        </div>
      </div>
      <div style={{ background: "#eef6ff", border: "1px solid #cfe2ff", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#1c4a9c", marginBottom: 12, lineHeight: 1.6 }}>
        여기선 <b>{EDIT_LANGS.map((L) => labelOf(L)).join("·")}</b>(원문)만 편집합니다. <b>영어·아랍어·일본어</b> 번역은 <b>언어 관리 → 번역 엑셀</b>에서 일괄 관리됩니다.
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {list.map((it, i) => (
          <div key={i}>
            <div style={{ ...card, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <button onClick={() => setEditing(editing === i ? null : i)} style={{ flex: 1, textAlign: "left", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600, color: INK, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ color: MUTE, fontWeight: 700, marginRight: 8 }}>{i + 1}</span>{label(it, i)}
              </button>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => move(i, -1)} style={miniBtn(BG_SOFT, SUB)} title="위로">↑</button>
                <button onClick={() => move(i, 1)} style={miniBtn(BG_SOFT, SUB)} title="아래로">↓</button>
                <button onClick={() => dup(i)} style={miniBtn(BG_SOFT, BLUE)}>복제</button>
                <button onClick={() => setEditing(editing === i ? null : i)} style={miniBtn(BG_SOFT, BLUE)}>{editing === i ? "닫기" : "편집"}</button>
                <button onClick={() => del(i)} style={miniBtn("#fdecec", "#e5484d")}>삭제</button>
              </div>
            </div>
            {editing === i && <div style={{ marginTop: 8 }}><ItemEditor meta={meta} list={list} index={i} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} /></div>}
          </div>
        ))}
        {list.length === 0 && <div style={{ ...card, color: MUTE, fontSize: 13 }}>항목이 없습니다. “+ 추가”로 만드세요.</div>}
      </div>
    </div>
  );
}

/* GitHub 토큰(세션 저장) — 발행/번역 업로드가 공유 */
function useGhToken() {
  const [token, setToken] = useState("");
  useEffect(() => { try { setToken(sessionStorage.getItem("kc2_gh_token") || ""); } catch { /* */ } }, []);
  const set = (v) => { setToken(v); try { v ? sessionStorage.setItem("kc2_gh_token", v) : sessionStorage.removeItem("kc2_gh_token"); } catch { /* */ } };
  return [token, set];
}

/* ====================================================================
   발행 바 (GitHub Contents API → content.json 커밋 → 재빌드)
   ==================================================================== */
function PublishBar() {
  const [token, onToken] = useGhToken();
  const [msg, setMsg] = useState(null);    // {type:'ok'|'err'|'info', text, url?}
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if (!token) { setMsg({ type: "err", text: "GitHub 토큰을 입력하세요." }); return; }
    if (!window.confirm(`${PUBLISH_TARGET.owner}/${PUBLISH_TARGET.repo} 루트의 ${PUBLISH_TARGET.path} 에 발행할까요?\n커밋 후 GitHub Pages 전파(~1분)되어 전 방문자에게 반영됩니다.`)) return;
    setBusy(true); setMsg({ type: "info", text: "발행 중…" });
    try {
      const { commitUrl } = await publishContentJson({ token, contentObject: exportContent() });
      setMsg({ type: "ok", text: "발행 완료 — GitHub Pages 전파 후 ~1분 뒤 반영됩니다.", url: commitUrl });
    } catch (e) {
      const hint = e.status === 401 ? " (토큰이 유효하지 않음)" : e.status === 404 ? " (레포/경로 또는 토큰 권한 확인: Contents 쓰기)" : "";
      setMsg({ type: "err", text: (e.message || "발행 실패") + hint });
    } finally { setBusy(false); }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(exportContent(), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "content.json"; a.click(); URL.revokeObjectURL(a.href);
    setMsg({ type: "info", text: `content.json 다운로드 — ${PUBLISH_TARGET.repo} 레포 루트에 커밋하면 반영됩니다.` });
  };

  const reset = () => { if (window.confirm("이 브라우저의 모든 로컬 편집을 비울까요? (발행본/시드 상태로 환원)")) { clearLocalOverrides(); setMsg({ type: "info", text: "로컬 편집을 비웠습니다." }); } };

  const tone = { ok: ["#e7f7ee", GREEN], err: ["#fdecec", "#e5484d"], info: ["#eef2fb", BLUE] };
  return (
    <div style={{ ...card, padding: 14, marginBottom: 16, background: "#fbfcfe" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>발행</div>
        <input type="password" value={token} onChange={(e) => onToken(e.target.value)} placeholder="GitHub 토큰 (Contents 쓰기)" style={{ ...inp, width: 260, flex: "0 1 260px" }} />
        <button onClick={publish} disabled={busy} style={{ ...btn(BLUE, "#fff"), padding: "8px 16px", opacity: busy ? .6 : 1 }}>{busy ? "발행 중…" : "발행"}</button>
        <button onClick={download} style={miniBtn(BG_SOFT, INK)}>JSON 다운로드</button>
        <button onClick={reset} style={miniBtn(BG_SOFT, SUB)}>로컬 편집 비우기</button>
        <span style={{ fontSize: 11.5, color: MUTE }}>→ {PUBLISH_TARGET.owner}/{PUBLISH_TARGET.repo} · {PUBLISH_TARGET.path}</span>
      </div>
      {msg && (
        <div style={{ marginTop: 10, background: tone[msg.type][0], color: tone[msg.type][1], borderRadius: 8, padding: "8px 12px", fontSize: 12.5 }}>
          {msg.text} {msg.url && <a href={msg.url} target="_blank" rel="noreferrer" style={{ color: tone[msg.type][1], fontWeight: 700, textDecoration: "underline" }}>커밋 보기 ↗</a>}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 11, color: MUTE }}>
        토큰은 이 브라우저 세션에만 저장되며 코드/사이트에 포함되지 않습니다. fine-grained PAT · 대상 레포 Contents = Read and write 권한 필요.
        <br /><b>발행</b>(content.json)은 리스트·항목 콘텐츠를 갱신합니다. <b>번역 문구(다국어)</b>는 <b>‘언어 관리 · 번역 문구’</b> 에서 엑셀로 관리합니다.
      </div>
    </div>
  );
}

/* ====================================================================
   번역 문구 (엑셀 왕복) — '언어 관리' 하위. 현재 번역 다운로드 → 원어민 검수 →
   업로드(=i18n JSON 커밋 → GitHub Actions 언어별 재빌드·배포)
   ==================================================================== */
function TranslationExcel() {
  const [token, onToken] = useGhToken();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);
  const tone = { ok: ["#e7f7ee", GREEN], err: ["#fdecec", "#e5484d"], info: ["#eef2fb", BLUE] };

  const download = async () => {
    setBusy(true); setMsg({ type: "info", text: "현재 번역 엑셀 생성 중…" });
    try {
      const { buildStringsXlsx } = await import("./i18n-xlsx-build.js");
      const blob = await buildStringsXlsx();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "strings.xlsx"; a.click(); URL.revokeObjectURL(a.href);
      setMsg({ type: "ok", text: "strings.xlsx 다운로드 — 언어 열을 원어민이 채워 다시 ②로 업로드하세요." });
    } catch (e) { setMsg({ type: "err", text: e.message || "다운로드 실패" }); }
    finally { setBusy(false); }
  };

  const upload = async (file) => {
    if (!file) return;
    if (!token) { setMsg({ type: "err", text: "GitHub 토큰을 먼저 입력하세요." }); if (fileRef.current) fileRef.current.value = ""; return; }
    setBusy(true); setMsg({ type: "info", text: "엑셀 파싱 중…" });
    try {
      const buf = await file.arrayBuffer();
      const { parseStringsWorkbook } = await import("./i18n-xlsx-parse.js");
      const { dataMap, uiMap, counts, langsSeen } = await parseStringsWorkbook(buf);
      if (!counts.data && !counts.ui) throw new Error("data/ui 시트에서 문자열을 찾지 못했습니다. strings.xlsx 형식(Key·언어열·Source)을 확인하세요.");
      if (!window.confirm(`번역을 발행할까요?\n· data ${counts.data}개 · ui ${counts.ui}개 · 언어 ${langsSeen.join("/")}\n소스 레포에 커밋되어 GitHub Actions 가 언어별로 재빌드·배포합니다(~2분).`)) { setBusy(false); setMsg(null); if (fileRef.current) fileRef.current.value = ""; return; }
      setMsg({ type: "info", text: "발행 중… (커밋 → Actions 재빌드 트리거)" });
      const { publishStrings } = await import("./github.js");
      const { commitUrl } = await publishStrings({ token, dataMap, uiMap, xlsxBuffer: buf });
      setMsg({ type: "ok", text: `번역 발행 완료 (data ${counts.data}·ui ${counts.ui}) — Actions 재빌드·배포 후 ~2분 뒤 전 언어에 반영됩니다.`, url: commitUrl });
    } catch (e) {
      const hint = e.status === 401 ? " (토큰 무효)" : e.status === 404 || e.status === 409 ? " (레포/권한 확인: Contents 쓰기)" : "";
      setMsg({ type: "err", text: (e.message || "업로드 실패") + hint });
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div style={{ ...card, padding: 16, marginTop: 20, background: "#fbfcfe" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: INK }}>번역 문구 <span style={{ fontSize: 12.5, color: MUTE, fontWeight: 600 }}>· 엑셀 왕복</span></div>
      <div style={{ fontSize: 12, color: MUTE, marginBottom: 12, lineHeight: 1.6 }}>
        위 <b>레지스트리</b>는 언어 목록·표시·방향, 여기 <b>번역 문구</b>는 각 언어의 실제 문구입니다. <b>① 다운로드 → 원어민이 언어 열 작성 → ② 업로드</b> 하면 GitHub Actions 가 언어별 페이지를 자동 재빌드·배포합니다.
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input type="password" value={token} onChange={(e) => onToken(e.target.value)} placeholder="GitHub 토큰 (Contents 쓰기)" style={{ ...inp, width: 240, flex: "0 1 240px" }} />
        <button onClick={download} disabled={busy} style={{ ...miniBtn(BG_SOFT, INK), opacity: busy ? .6 : 1 }}>① 현재 번역 엑셀 다운로드</button>
        <label style={{ ...miniBtn(BLUE, "#fff"), cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1 }}>
          ② 번역 엑셀 업로드
          <input ref={fileRef} type="file" accept=".xlsx" onChange={(e) => upload(e.target.files?.[0])} disabled={busy} style={{ display: "none" }} />
        </label>
      </div>
      {msg && (
        <div style={{ marginTop: 10, background: tone[msg.type][0], color: tone[msg.type][1], borderRadius: 8, padding: "8px 12px", fontSize: 12.5 }}>
          {msg.text} {msg.url && <a href={msg.url} target="_blank" rel="noreferrer" style={{ color: tone[msg.type][1], fontWeight: 700, textDecoration: "underline" }}>커밋 보기 ↗</a>}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 11, color: MUTE }}>토큰은 이 브라우저 세션에만 저장됩니다(코드/사이트 미포함). fine-grained PAT · 대상 레포 Contents = Read and write 권한 필요.</div>
    </div>
  );
}

/* ====================================================================
   언어 관리 (langs 레지스트리 — 헤더 드롭다운의 표시명·순서·표시여부·방향)
   ==================================================================== */

function LangManager() {
  useContent();
  const [draft, setDraft] = useState(() => clone(getLangsSetting()));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);   // {type, text}
  const setRow = (i, patch) => setDraft((d) => d.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const move = (i, dir) => setDraft((d) => { const j = i + dir; if (j < 0 || j >= d.length) return d; const n = d.slice(); [n[i], n[j]] = [n[j], n[i]]; return n; });
  const del = (i) => setDraft((d) => d.filter((_, j) => j !== i));
  const add = () => { setDraft((d) => [...d, { code: "", label: "", dir: "ltr", enabled: false }]); setMsg(null); };

  const save = async () => {
    const codes = draft.map((l) => (l.code || "").trim());
    if (codes.some((c) => !c)) return setMsg({ type: "err", text: "빈 언어 코드가 있습니다." });
    if (new Set(codes).size !== codes.length) return setMsg({ type: "err", text: "중복된 언어 코드가 있습니다." });
    if (!draft.some((l) => l.enabled !== false)) return setMsg({ type: "err", text: "최소 한 개 언어는 표시(enabled)해야 합니다." });
    setBusy(true);
    try {
      await saveLangs(draft.map((l) => ({ code: l.code.trim(), label: l.label || l.code.trim(), dir: l.dir === "rtl" ? "rtl" : "ltr", enabled: l.enabled !== false })));
      setMsg({ type: "ok", text: "저장됨 — 이 브라우저 미리보기에 즉시 반영. 전체 방문자 반영은 상단 ‘발행’." });
    } finally { setBusy(false); }
  };
  const reset = () => { if (window.confirm("언어 레지스트리를 시드(기본값)로 되돌릴까요?")) { resetLangs(); setDraft(clone(getLangsSetting())); setMsg({ type: "info", text: "시드로 되돌렸습니다." }); } };

  const tone = { ok: ["#e7f7ee", GREEN], err: ["#fdecec", "#e5484d"], info: ["#eef2fb", BLUE] };
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>언어 관리 <span style={{ fontSize: 13, color: MUTE }}>· {draft.length}개</span></div>
        <div style={{ fontSize: 12, color: MUTE }}>헤더 언어 드롭다운 · 표시명 · 순서 · 표시여부 · 텍스트 방향(LTR/RTL)</div>
      </div>
      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#9a3412", marginBottom: 14, lineHeight: 1.6 }}>
        <b>이름·순서·표시여부·방향</b> 변경은 발행 후 즉시 반영됩니다(이미 빌드된 언어). <b>완전히 새 언어 추가</b>는 번역(엑셀/각 항목 편집)과 <b>재배포</b>가 있어야 페이지·URL이 생성됩니다 — 그 전까지 신규 언어는 <b>표시 OFF</b>로 두세요.
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {draft.map((l, i) => {
          const isNew = !SEED_CODES.includes((l.code || "").trim());
          return (
            <div key={i} style={{ ...card, padding: "12px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 90px 1fr 130px auto", gap: 10, alignItems: "end" }} className="lang-row">
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: MUTE, fontWeight: 700 }}>
                  표시
                  <input type="checkbox" checked={l.enabled !== false} onChange={(e) => setRow(i, { enabled: e.target.checked })} style={{ width: 18, height: 18 }} />
                </label>
                <div><span style={lbl}>코드</span><input value={l.code ?? ""} onChange={(e) => setRow(i, { code: e.target.value })} placeholder="ja" style={{ ...inp, fontFamily: "monospace" }} /></div>
                <div><span style={lbl}>표시명</span><input value={l.label ?? ""} onChange={(e) => setRow(i, { label: e.target.value })} placeholder="日本語" dir={l.dir === "rtl" ? "rtl" : "ltr"} style={inp} /></div>
                <div><span style={lbl}>방향</span>
                  <select value={l.dir === "rtl" ? "rtl" : "ltr"} onChange={(e) => setRow(i, { dir: e.target.value })} style={inp}>
                    <option value="ltr">LTR (좌→우)</option>
                    <option value="rtl">RTL (우→좌)</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => move(i, -1)} style={miniBtn(BG_SOFT, SUB)} title="위로">↑</button>
                  <button onClick={() => move(i, 1)} style={miniBtn(BG_SOFT, SUB)} title="아래로">↓</button>
                  <button onClick={() => del(i)} style={miniBtn("#fdecec", "#e5484d")}>삭제</button>
                </div>
              </div>
              {isNew && (l.code || "").trim() ? <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: "#9a3412", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 7, padding: "4px 8px", display: "inline-block" }}>⚠ 신규 언어 — 번역·재배포 전까지 라우트/페이지 미생성</div> : null}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={add} style={{ ...miniBtn(BG_SOFT, BLUE) }}>+ 언어 추가</button>
        <button onClick={save} disabled={busy} style={{ ...btn(BLUE, "#fff"), padding: "8px 18px", opacity: busy ? .6 : 1 }}>{busy ? "저장 중…" : "저장"}</button>
        <button onClick={reset} style={miniBtn(BG_SOFT, SUB)}>시드 복원</button>
      </div>
      {msg && <div style={{ marginTop: 12, background: tone[msg.type][0], color: tone[msg.type][1], borderRadius: 8, padding: "8px 12px", fontSize: 12.5 }}>{msg.text}</div>}
      <TranslationExcel />
      <style>{`@media(max-width:640px){.lang-row{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}

/* ====================================================================
   인증 게이트 + 셸 — 기능별 사이드바(항상 전환 가능) + 우측 활성 패널
   ==================================================================== */
function SideItem({ label, icon, on, soft, depth = 0, caret, onClick }) {
  const bg = on ? BLUE : soft ? BG_SOFT : "transparent";
  const fg = on ? "#fff" : soft ? BLUE : INK;
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", border: "none", background: bg, color: fg, borderRadius: 8, padding: depth ? "8px 12px 8px 32px" : "9px 12px", fontSize: 13.5, fontWeight: on || soft ? 700 : 500, cursor: "pointer", marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
      {caret != null && <span style={{ fontSize: 9, width: 9, color: on ? "#fff" : MUTE }}>{caret ? "▾" : "▸"}</span>}
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

/* 운영(Operations) 리프 — 예약·리드·분석 (서버 연동 전 샘플) */
const OPS = [
  { key: "ops-hospitals", label: "병원 관리", icon: "🏥", Comp: HospitalsPanel },
  { key: "ops-treatments", label: "시술 관리", icon: "🩺", Comp: TreatmentsPanel },
  { key: "ops-blog", label: "블로그 관리", icon: "📰", Comp: BlogPanel },
  { key: "ops-reservations", label: "예약 관리", icon: "📅", Comp: ReservationsPanel },
  { key: "ops-leads", label: "리드 · 문의 Inbox", icon: "📥", Comp: LeadsPanel },
  { key: "ops-analytics", label: "유치 분석", icon: "📊", Comp: AnalyticsPanel },
];
const SECTION_TITLE = {
  langs: "언어 관리", publish: "발행 · 배포",
  "ops-hospitals": "운영 · 병원 관리", "ops-treatments": "운영 · 시술 관리", "ops-blog": "운영 · 블로그 관리",
  "ops-reservations": "운영 · 예약 관리", "ops-leads": "운영 · 리드/문의", "ops-analytics": "운영 · 유치 분석",
};

function AdminShell() {
  const [active, setActive] = useState(COLLECTIONS[0].key);    // 활성 리프: 컬렉션 key | "langs" | "publish" | "ops-*"
  const [openContent, setOpenContent] = useState(true);         // '콘텐츠 관리' 그룹 펼침
  const [openOps, setOpenOps] = useState(false);                // '운영' 그룹 펼침
  const inContent = COLLECTIONS.some((c) => c.key === active);
  const inOps = OPS.some((o) => o.key === active);
  const title = SECTION_TITLE[active] || "콘텐츠 관리";
  const meta = COLLECTIONS.find((c) => c.key === active);
  const opsMeta = OPS.find((o) => o.key === active);
  return (
    <div style={{ ...wrap, padding: "28px clamp(16px,3vw,32px) 80px" }}>
      <div data-spec="a1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 800, color: INK }}>CareBridge Global 관리자</div>
          <div style={{ fontSize: 13, color: SUB }}>{title}</div>
        </div>
        <button onClick={() => setActive("publish")} style={{ ...btn(active === "publish" ? BLUE : BG_SOFT, active === "publish" ? "#fff" : BLUE), padding: "8px 16px", fontSize: 13 }}>🚀 발행하기</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 20, alignItems: "start" }} className="admin-grid">
        <nav data-spec="a2" style={{ ...card, padding: 8, position: "sticky", top: 16 }}>
          {/* 콘텐츠 관리 (접히는 그룹 — 하위 12 컬렉션) */}
          <SideItem label="콘텐츠 관리" icon="📝" caret={openContent} soft={inContent && !openContent} onClick={() => setOpenContent((v) => !v)} />
          {openContent && COLLECTIONS.map((c) => (
            <SideItem key={c.key} label={tx(c.label, "ko")} depth={1} on={c.key === active} onClick={() => setActive(c.key)} />
          ))}
          <div style={{ height: 1, background: LINE, margin: "6px 4px" }} />
          {/* 운영 (접히는 그룹 — 예약·리드·분석) */}
          <SideItem label="운영" icon="🗂️" caret={openOps} soft={inOps && !openOps} onClick={() => setOpenOps((v) => !v)} />
          {openOps && OPS.map((o) => (
            <SideItem key={o.key} label={o.label} icon={o.icon} depth={1} on={o.key === active} onClick={() => setActive(o.key)} />
          ))}
          <div style={{ height: 1, background: LINE, margin: "6px 4px" }} />
          {/* 최상위 기능 섹션 */}
          <SideItem label="언어 관리" icon="🌐" on={active === "langs"} onClick={() => setActive("langs")} />
          <SideItem label="발행 · 배포" icon="🚀" on={active === "publish"} onClick={() => setActive("publish")} />
        </nav>
        <div data-spec="a3">
          {opsMeta ? <opsMeta.Comp />
            : active === "langs" ? <LangManager />
            : active === "publish" ? (
              <div data-spec="adm-publish">
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: INK }}>발행 · 배포</div>
                  <div style={{ fontSize: 12, color: MUTE }}>편집한 콘텐츠(content.json)와 번역 엑셀을 GitHub 에 발행 → 전 방문자 반영</div>
                </div>
                <PublishBar />
              </div>
            )
            : <CollectionPanel key={active} meta={meta} />}
        </div>
      </div>
      <style>{`@media(max-width:760px){.admin-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

const wrap = { maxWidth: 1100, margin: "0 auto" };

function Gate({ onUnlock }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e) => { e.preventDefault(); if (v === ADMIN_TOKEN) onUnlock(); else setErr(true); };
  return (
    <div style={{ ...wrap, padding: "80px 24px", maxWidth: 380 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: INK, marginBottom: 6 }}>콘텐츠 관리 로그인</div>
      <p style={{ fontSize: 13, color: SUB, marginBottom: 18 }}>관리자 토큰을 입력하세요.</p>
      <form onSubmit={submit}>
        <input type="password" value={v} onChange={(e) => { setV(e.target.value); setErr(false); }} placeholder="Admin token" style={{ ...inp, padding: "11px 13px", fontSize: 14 }} autoFocus />
        {err && <div style={{ color: "#e5484d", fontSize: 12, marginTop: 8 }}>토큰이 일치하지 않습니다.</div>}
        <button type="submit" style={{ ...btn(BLUE, "#fff"), width: "100%", marginTop: 14 }}>입장</button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  // lang 컨텍스트는 필요 없지만 Layout 의 Outlet context 안에서 렌더됨
  useOutletContext();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setReady(true);
    if (!ADMIN_TOKEN) { setUnlocked(true); return; }
    try { if (sessionStorage.getItem("kc2_admin") === "1") setUnlocked(true); } catch { /* */ }
  }, []);
  const unlock = () => { try { sessionStorage.setItem("kc2_admin", "1"); } catch { /* */ } setUnlocked(true); };
  return (
    <>
      <Seo title="콘텐츠 관리" path="/admin" noindex />
      {!ready ? <div style={{ ...wrap, padding: "80px 24px", color: MUTE }}>로딩…</div>
        : unlocked ? <AdminShell /> : <Gate onUnlock={unlock} />}
    </>
  );
}

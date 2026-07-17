/* =========================================================================
   i18n-extract.mjs — 사이트의 EN/KO 문자열 전수 추출
   ---------------------------------------------------------------------------
   출력: docs/i18n/strings.json  (앱/스크립트용)
         docs/i18n/strings.csv   (엑셀 즉시 열람)
   XLSX 는 strings.json → i18n-xlsx.mjs 로 생성(별도).
   대상: (a) src/data.js 의 {en,ko} 구조 전수  (b) App.jsx/functional.jsx 하드코딩 삼항.
   키 규칙: data 는 export 경로(예 PROCEDURES[0].name / HERO.title1 / UI.book),
            하드코딩은 HARDCODE.<파일>:<라인>.
   ========================================================================= */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as D from "../src/data.js";
import { LANG_CODES } from "../src/langs.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJ = resolve(__dirname, "..");
const OUT = resolve(PROJ, "docs/i18n");

const rows = []; // {key, source, <lang>...}
const seen = new Set();
const S = (v) => (v == null ? "" : String(v));
const push = (key, vals, source) => {                 // vals: 언어코드→값 을 가진 객체(추가키는 무시)
  if (seen.has(key)) return; seen.add(key);
  const row = { key, source };
  for (const c of LANG_CODES) row[c] = S(vals ? vals[c] : "");
  rows.push(row);
};

function walk(node, path) {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`)); return; }
  const en = node.en, ko = node.ko;
  if (Array.isArray(en) || Array.isArray(ko)) {                 // i18n-list {en:[],ko:[],...}
    const n = Math.max((en || []).length, (ko || []).length);
    for (let i = 0; i < n; i++) { const vals = {}; for (const c of LANG_CODES) vals[c] = Array.isArray(node[c]) ? node[c][i] : ""; push(`${path}[${i}]`, vals, "data.js"); }
  } else if (typeof en === "string" || typeof ko === "string" || en === null || ko === null) {
    push(path, node, "data.js");                                // 객체 레벨 en/ko(NAV·SERVICES 등 혼합객체 포함, 추가키 무시)
  } else if (en && typeof en === "object") {                    // {en:{},ko:{},...}(UI)
    for (const kk of Object.keys(en)) { const vals = {}; for (const c of LANG_CODES) vals[c] = (node[c] && typeof node[c] === "object") ? node[c][kk] : ""; push(`${path}.${kk}`, vals, "data.js"); }
    return;
  }
  for (const k of Object.keys(node)) { if (LANG_CODES.includes(k)) continue; walk(node[k], path ? `${path}.${k}` : k); }
}

// (a) data.js 전 export 순회
for (const [name, val] of Object.entries(D)) {
  if (typeof val === "function") continue; // tx, usd
  walk(val, name);
}

// (b) UI 문구 — t() 로 externalize 되어 src/i18n-ui.json 에서 관리(키=영문)
try {
  const ui = JSON.parse(await readFile(resolve(PROJ, "src/i18n-ui.json"), "utf8"));
  for (const [k, v] of Object.entries(ui)) push(k, v, "ui");
} catch { /* 아직 externalize 전이면 skip */ }

await mkdir(OUT, { recursive: true });
await writeFile(resolve(OUT, "strings.json"), JSON.stringify(rows, null, 2));
// 앱이 읽는 override 맵(data.js 행만)
const map = {};
for (const r of rows) if (r.source === "data.js") { const o = {}; for (const c of LANG_CODES) o[c] = r[c]; map[r.key] = o; }
await writeFile(resolve(PROJ, "src/i18n-strings.json"), JSON.stringify(map, null, 0));
// CSV (UTF-8 BOM)
const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const cols = ["key", ...LANG_CODES, "source"];
const csv = "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
await writeFile(resolve(OUT, "strings.csv"), csv);

const byData = rows.filter((r) => r.source === "data.js").length;
console.log(`[i18n-extract] ${rows.length} strings (data=${byData}, ui=${rows.length - byData}) · langs: ${LANG_CODES.join("/")}`);
console.log(`  → docs/i18n/strings.json · strings.csv · src/i18n-strings.json`);

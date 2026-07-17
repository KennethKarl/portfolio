/* =========================================================================
   i18n-xlsx-parse.js — 브라우저에서 strings.xlsx → i18n JSON 맵 파싱
   ---------------------------------------------------------------------------
   /admin '번역 엑셀 업로드' 전용. 원어민 검수를 마친 docs/i18n/strings.xlsx 를
   업로드하면 앱이 소비하는 두 맵을 만든다(scripts/i18n-apply.mjs 의 브라우저판):
       data 시트 → i18n-strings.json  { key: {en, ko, ar, ...} }
       ui   시트 → i18n-ui.json       { key: {en, ko, ar, ...} }
   열 순서가 바뀌어도 안전하도록 헤더의 `label (code)` 에서 언어 열을 매핑한다.
   SheetJS(xlsx, Apache-2.0, 무료) 는 admin 진입 시에만 동적 import 로 로드.
   ========================================================================= */
import { LANG_CODES } from "./langs.js";

// 헤더 셀 배열 → { keyCol, sourceCol, langCol:{code:idx} }
function mapColumns(header) {
  const langCol = {};
  let keyCol = 0, sourceCol = -1;
  header.forEach((h, i) => {
    const cell = String(h ?? "").trim();
    if (/^key$/i.test(cell)) keyCol = i;
    else if (/^source$/i.test(cell)) sourceCol = i;
    else {
      const m = cell.match(/\(([a-z-]{2,})\)\s*$/i);   // "EN (en)" → en
      if (m && LANG_CODES.includes(m[1].toLowerCase())) langCol[m[1].toLowerCase()] = i;
    }
  });
  // 헤더에서 언어 열을 못 찾으면(형식 이탈) 위치 기반 폴백: Key, <codes...>, Source
  if (Object.keys(langCol).length === 0) LANG_CODES.forEach((c, i) => { langCol[c] = 1 + i; });
  return { keyCol, sourceCol, langCol };
}

/**
 * 업로드한 strings.xlsx(ArrayBuffer) → { dataMap, uiMap, counts, langsSeen }.
 * data/ui 는 시트명 접두어로 구분(i18n-xlsx.mjs 규칙: "data …" / "ui …").
 */
export async function parseStringsWorkbook(arrayBuffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const dataMap = {}, uiMap = {};
  const langsSeen = new Set();
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false });
    if (!rows.length) continue;
    const { keyCol, langCol } = mapColumns(rows[0]);
    const target = String(name).toLowerCase().startsWith("data") ? dataMap : uiMap;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      // 키는 gettext식 원문 — 후행 공백 등도 t() 호출부와 정확히 일치해야 하므로 trim 금지
      const raw = row ? row[keyCol] : null;
      if (raw == null || raw === "") continue;
      const key = String(raw);
      const entry = {};
      for (const code of LANG_CODES) {
        const idx = langCol[code];
        const v = idx == null ? "" : row[idx];
        entry[code] = v == null ? "" : String(v);
        if (entry[code]) langsSeen.add(code);
      }
      target[key] = entry;
    }
  }
  return {
    dataMap, uiMap,
    counts: { data: Object.keys(dataMap).length, ui: Object.keys(uiMap).length },
    langsSeen: [...langsSeen],
  };
}

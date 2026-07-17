/* =========================================================================
   i18n-xlsx-build.js — 브라우저에서 현재 번역 → strings.xlsx 생성(다운로드용)
   ---------------------------------------------------------------------------
   /admin '언어 관리 · 번역 문구' 의 "현재 번역 엑셀 다운로드" 전용.
   빌드에 반영된 현재 번역(i18n-strings.json=data, i18n-ui.json=ui)을 그대로
   scripts/i18n-xlsx.mjs 와 동일한 시트/헤더 규칙의 xlsx 로 만든다:
       시트 "data (콘텐츠)" / "ui (하드코딩)"
       헤더 [Key, `label (code)` × 언어, Source]
   원어민이 이 파일의 언어 열을 채워 다시 업로드하면 i18n-xlsx-parse.js 가
   동일 규칙으로 읽어 무손실 왕복이 된다. SheetJS 는 이 함수 호출 시에만 로드.
   ========================================================================= */
import { LANG_CODES, labelOf } from "./langs.js";
import dataStrings from "./i18n-strings.json" with { type: "json" };
import uiStrings from "./i18n-ui.json" with { type: "json" };

export async function buildStringsXlsx() {
  const XLSX = await import("xlsx");
  const header = ["Key", ...LANG_CODES.map((c) => `${labelOf(c)} (${c})`), "Source"];
  const sheetOf = (map, source) => {
    const aoa = [header];
    for (const key of Object.keys(map || {})) {
      aoa.push([key, ...LANG_CODES.map((c) => map[key]?.[c] ?? ""), source]);
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 34 }, ...LANG_CODES.map(() => ({ wch: 30 })), { wch: 10 }];
    return ws;
  };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetOf(dataStrings, "data.js"), "data (콘텐츠)");
  XLSX.utils.book_append_sheet(wb, sheetOf(uiStrings, "ui"), "ui (UI 문구)");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

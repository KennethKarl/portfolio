/* =========================================================================
   i18n-xlsx.mjs — strings.json → strings.xlsx (번역·검수용 엑셀)
   열은 언어 레지스트리(src/langs.js) 구동 — 언어 추가 시 열 자동 생성.
   RTL 언어(dir=rtl) 열은 우측정렬. data / ui 시트 분리.
   ========================================================================= */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGS } from "../src/langs.js";
const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../docs/i18n");

const py = `
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

base = ${JSON.stringify(OUT)}
LANGS = ${JSON.stringify(LANGS)}
codes = [l["code"] for l in LANGS]
rows = json.load(open(os.path.join(base, "strings.json"), encoding="utf-8"))

wb = Workbook()
HEAD_FILL = PatternFill("solid", fgColor="1B59FA")
HEAD_FONT = Font(color="FFFFFF", bold=True, size=11)
THIN = Side(style="thin", color="E5E7EC")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
WRAP_RTL = Alignment(wrap_text=True, vertical="top", horizontal="right", readingOrder=2)
TOP = Alignment(vertical="top")

headers = ["Key"] + [f'{l["label"]} ({l["code"]})' for l in LANGS] + ["Source"]
widths  = [38] + [50 for _ in LANGS] + [22]
rtl_cols  = set(i+2 for i, l in enumerate(LANGS) if l.get("dir") == "rtl")  # 1-based(Key=1)
lang_cols = set(range(2, 2 + len(LANGS)))

def sheet(ws, data):
    ws.append(headers)
    for i, c in enumerate(ws[1]):
        c.fill = HEAD_FILL; c.font = HEAD_FONT; c.border = BORDER
        c.alignment = Alignment(vertical="center")
        ws.column_dimensions[get_column_letter(i+1)].width = widths[i]
    for r in data:
        ws.append([r["key"]] + [r.get(code, "") for code in codes] + [r["source"]])
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.border = BORDER
            c.alignment = WRAP_RTL if c.column in rtl_cols else (WRAP if c.column in lang_cols else TOP)
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{ws.max_row}"

data_rows = [r for r in rows if r["source"] == "data.js"]
ui_rows = [r for r in rows if r["source"] == "ui"]
ws1 = wb.active; ws1.title = "data (콘텐츠)"; sheet(ws1, data_rows)
ws2 = wb.create_sheet("ui (UI 문구)"); sheet(ws2, ui_rows)

out = os.path.join(base, "strings.xlsx")
wb.save(out)
print("XLSX:", out, "| data:", len(data_rows), "ui:", len(ui_rows), "| langs:", "/".join(codes))
`;

const { stdout } = await run("python3", ["-c", py]);
process.stdout.write(stdout);

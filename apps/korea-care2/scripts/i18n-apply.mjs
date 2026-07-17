/* =========================================================================
   i18n-apply.mjs — 편집한 strings.xlsx → 앱이 읽는 JSON 재생성 (왕복)
   docs/i18n/strings.xlsx (사람이 편집) → docs/i18n/strings.json (배열, 전체)
                                        → src/i18n-strings.json (맵, data 시트만)
   src/i18n-strings.json 은 data.js 가 로드 시 override 로 사용 → 재빌드 시 반영.
   (python3 + openpyxl 로 xlsx 읽기)
   ========================================================================= */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LANG_CODES } from "../src/langs.js";
const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJ = resolve(__dirname, "..");

const py = `
import json, os
from openpyxl import load_workbook
proj = ${JSON.stringify(PROJ)}
codes = ${JSON.stringify(LANG_CODES)}          # 열 순서 = 레지스트리 순서(Key, <langs...>, Source)
xlsx = os.path.join(proj, "docs/i18n/strings.xlsx")
wb = load_workbook(xlsx, data_only=True)
rows = []
for ws in wb:
    is_data = ws.title.startswith("data")
    for r in ws.iter_rows(min_row=2, values_only=True):
        if not r or r[0] is None: continue
        row = {"key": r[0], "source": (r[1+len(codes)] if len(r) > 1+len(codes) else None) or ("data.js" if is_data else "ui")}
        for i, c in enumerate(codes):
            row[c] = (r[1+i] if len(r) > 1+i else None) or ""
        rows.append(row)
with open(os.path.join(proj, "docs/i18n/strings.json"), "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
def m(src): return {r["key"]: {c: r.get(c, "") for c in codes} for r in rows if r["source"] == src}
with open(os.path.join(proj, "src/i18n-strings.json"), "w", encoding="utf-8") as f:
    json.dump(m("data.js"), f, ensure_ascii=False)
u = m("ui")
if u:
    with open(os.path.join(proj, "src/i18n-ui.json"), "w", encoding="utf-8") as f:
        json.dump(u, f, ensure_ascii=False)
print("applied:", len(rows), "rows | data:", len(m("data.js")), "| ui:", len(u), "| langs:", "/".join(codes))
`;
const { stdout } = await run("python3", ["-c", py]);
process.stdout.write(stdout);

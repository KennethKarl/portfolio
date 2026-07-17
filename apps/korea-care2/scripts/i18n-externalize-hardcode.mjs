/* =========================================================================
   i18n-externalize-hardcode.mjs — 1회성 코드모드
   App.jsx/functional.jsx 의  lang === "ko" ? <ko> : <en>  (양쪽 문자열 리터럴)
   → t(<en>, lang) 로 치환하고, 영문을 키로 한 맵 src/i18n-ui.json 생성.
   t() 는 src/i18n.js 가 제공. import 자동 삽입.
   DRY(기본): 리포트만. 실제 적용: WRITE=1 node scripts/i18n-externalize-hardcode.mjs
   ========================================================================= */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJ = resolve(__dirname, "..");
const WRITE = process.env.WRITE === "1";
const FILES = ["src/App.jsx", "src/functional.jsx"];

// lang === "ko" ? <koLit> : <enLit>   (양쪽 모두 문자열 리터럴일 때만)
const RE = /lang\s*===\s*["']ko["']\s*\?\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
const litVal = (lit) => { try { return Function("return (" + lit + ")")(); } catch { return null; } };

const map = {};        // enVal -> {en, ko}
const collisions = []; // {en, ko1, ko2}
let matches = 0, replaced = 0, skipped = 0;

for (const f of FILES) {
  const p = resolve(PROJ, f);
  let src = await readFile(p, "utf8");
  const out = src.replace(RE, (whole, koLit, enLit) => {
    matches++;
    const en = litVal(enLit), ko = litVal(koLit);
    if (en == null || ko == null) { skipped++; return whole; }
    if (map[en] && map[en].ko !== ko) { collisions.push({ en, ko1: map[en].ko, ko2: ko }); skipped++; return whole; } // 충돌 → 원본 유지
    map[en] = { en, ko };
    replaced++;
    return `t(${enLit}, lang)`;
  });
  let final = out;
  if (WRITE && final !== src) {
    if (!/from ["']\.\/i18n\.js["']/.test(final)) {
      // 첫 import 줄 뒤에 삽입
      final = final.replace(/(^import[^\n]*\n)/, `$1import { t } from "./i18n.js";\n`);
    }
    await writeFile(p, final);
  }
}

console.log(`[externalize] matches=${matches} replaced=${replaced} skipped=${skipped} uniqueKeys=${Object.keys(map).length} collisions=${collisions.length} WRITE=${WRITE}`);
if (collisions.length) collisions.slice(0, 10).forEach((c) => console.log(`  ⚠ collision "${c.en}" → ko1="${c.ko1}" ko2="${c.ko2}"`));
if (WRITE) {
  await writeFile(resolve(PROJ, "src/i18n-ui.json"), JSON.stringify(map, null, 0));
  console.log(`  → src/i18n-ui.json (${Object.keys(map).length} keys) 생성`);
} else {
  console.log("  (DRY-RUN — 실제 적용: WRITE=1 로 재실행)");
  console.log("  샘플:", Object.entries(map).slice(0, 5).map(([e, v]) => `${e}→${v.ko}`).join(" | "));
}

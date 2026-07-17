/* =========================================================================
   capture-screens.mjs — 기획용 화면 캡처 (Figma 대용 스크린샷)
   ---------------------------------------------------------------------------
   전체 라우트를 데스크톱/모바일 뷰포트로 full-page 캡처 → docs/screens/*.png
   화면을 고칠 때마다 재실행하면 스샷이 최신화된다(스토리보드 템플릿이 이걸 참조).

   사용:
     # 라이브 사이트 대상(기본, 세팅 불필요)
     node scripts/capture-screens.mjs
     # 로컬 개발 서버 대상(기획하며 방금 만든 화면 캡처)
     npm run dev            # (다른 터미널) → 포트 확인
     BASE_URL=http://localhost:5181 node scripts/capture-screens.mjs
     # 특정 화면만  →  ONLY=home,treatments,admin node scripts/capture-screens.mjs
     # 뷰포트 선택  →  VIEWPORTS=desktop node scripts/capture-screens.mjs

   Playwright 는 welfare-mall/qa/e2e 설치본을 재사용한다(별도 설치 불필요).
   ========================================================================= */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJ = resolve(__dirname, "..");
const OUT = resolve(PROJ, "docs/screens");

// Playwright 재사용 (welfare-mall e2e 설치본)
const require = createRequire("/Users/jaewon/Documents/forge/projects/carebridge/welfare-mall/qa/e2e/");
const { chromium } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://kennethkarl.github.io/korea-care2").replace(/\/$/, "");

// 캡처 대상 라우트 (동적 :id 는 대표 1건). key = 파일명 prefix.
const ROUTES = [
  ["home", "/"],
  ["company", "/company"],
  ["service", "/service"],
  ["checkup", "/service/health-checkup"],
  ["checkup-mri-scan", "/service/health-checkup/mri-scan"],
  ["checkup-detail", "/service/health-checkup/comprehensive"],
  ["revital", "/service/revital"],
  ["service-transportation", "/service/transportation"],
  ["service-accommodation", "/service/accommodation"],
  ["service-tour", "/service/tour"],
  ["service-association", "/service/association"],
  ["providers", "/providers"],
  ["provider-detail", "/providers/samsung-mc"],
  ["treatments", "/treatments"],
  ["treatment-detail", "/treatments/smile-lasik"],
  ["booking", "/booking"],
  ["cart", "/cart"],
  ["mypage", "/mypage"],
  ["contact", "/contact"],
  ["faq", "/faq"],
  ["blog", "/blog"],
  ["blog-post", "/blog/korea-checkup-guide"],
  ["legal-terms", "/legal/terms"],
  ["account", "/account"],
  ["admin", "/admin"],
];

const VIEWPORTS = {
  desktop: { width: 1280, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
};

const only = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const vpSel = (process.env.VIEWPORTS || "desktop,mobile").split(",").map((s) => s.trim());
const routes = only.length ? ROUTES.filter(([k]) => only.includes(k)) : ROUTES;

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const captured = [];
  console.log(`[capture] BASE_URL=${BASE_URL}  routes=${routes.length}  viewports=${vpSel.join("+")}`);
  for (const vp of vpSel) {
    const conf = VIEWPORTS[vp];
    if (!conf) { console.warn(`  ! unknown viewport '${vp}' skip`); continue; }
    const ctx = await browser.newContext({ viewport: { width: conf.width, height: conf.height }, deviceScaleFactor: conf.deviceScaleFactor, isMobile: !!conf.isMobile });
    const page = await ctx.newPage();
    for (const [key, route] of routes) {
      const url = `${BASE_URL}${route}`;
      const file = `${key}--${vp}.png`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(700); // SSG 하이드레이션·이미지 로드 여유
        await page.screenshot({ path: resolve(OUT, file), fullPage: true });
        captured.push({ key, route, viewport: vp, file });
        console.log(`  ✓ ${file}`);
      } catch (e) {
        console.warn(`  ✗ ${file} — ${e.message.split("\n")[0]}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  // 스토리보드 템플릿이 참조할 인덱스
  await writeFile(resolve(OUT, "index.json"), JSON.stringify({ baseUrl: BASE_URL, capturedAt: new Date().toISOString(), screens: captured }, null, 2));
  console.log(`[capture] ${captured.length} shots → docs/screens/  (+ index.json)`);
}

run().catch((e) => { console.error(e); process.exit(1); });

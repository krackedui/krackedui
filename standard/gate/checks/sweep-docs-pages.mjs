// Visit every docs page of a system (from llms.txt) in a headless browser and report console errors,
// React/hydration warnings, uncaught exceptions and failed loads.
// Usage: node standard/gate/checks/sweep-docs-pages.mjs [system=motion]   (DOCS_URL, REPORT_FILE optional)
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const system = process.argv[2] ?? 'motion';
const site = process.env.DOCS_URL ?? 'http://localhost:3002';
const index = await (await fetch(`${site}/${system}/llms.txt`)).text();
const urls = [...new Set([...index.matchAll(/\]\((http[^)]+)\)/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, site)))];
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const problems = [];
const queue = [...urls];
// next dev compiles on first visit: warm the first page alone, then go in parallel.
async function visit(url, retry = true) {
  const mine = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => mine.push({ url, kind: 'exception', message: e.message.slice(0, 200) }));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' || /hydrat|Warning:/i.test(t)) mine.push({ url, kind: m.type(), message: t.slice(0, 200) });
  });
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => { mine.push({ url, kind: 'load', message: e.message.slice(0, 200) }); return null; });
  if (res && res.status() >= 400) mine.push({ url, kind: 'http', message: `HTTP ${res.status()}` });
  await page.waitForTimeout(400);
  await page.close();
  // `next dev` recompiling mid-visit (a source file changed) is not a page problem: visit again once.
  if (retry && mine.some((p) => /Loading chunk|ChunkLoadError|Invalid or unexpected token/.test(p.message))) return visit(url, false);
  problems.push(...mine);
}
if (queue.length) await visit(queue.shift());
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await visit(queue.shift()); }));
await browser.close();
console.log(`${urls.length} pages visited, ${problems.length} problems`);
for (const p of problems) console.log(`- ${p.url} [${p.kind}] ${p.message}`);
if (process.env.REPORT_FILE) await fs.writeFile(process.env.REPORT_FILE, JSON.stringify({ pages: urls.length, problems }, null, 1));
process.exitCode = problems.length ? 1 : 0;

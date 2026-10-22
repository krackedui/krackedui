// 12. Visual: a screenshot of every docs example (light, 1280 px, reduced motion) compared with the
// approved baseline in systems/<name>/gate/baselines/<platform>/<page>--<example>.png (darwin, linux…). More than 0.5% of pixels
// changed, a size change or a missing baseline fails. `--update-baselines` writes new baselines
// (record why in REPORT.md).
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { pool, rel } from '../lib/context.mjs';
import { openExample } from '../lib/consumer.mjs';

const MAX_DIFF_RATIO = 0.005;
const PIXEL_THRESHOLD = 0.1;

async function run_(ctx) {
  const app = await ctx.examplesApp();
  const browser = await ctx.browser();
  const update = Boolean(ctx.flags.updateBaselines);
  const only = process.env.GATE_VISUAL_FILTER ? new RegExp(process.env.GATE_VISUAL_FILTER) : null;
  const examples = only ? app.examples.filter((e) => only.test(e.name)) : app.examples;
  const diffDir = path.join(ctx.scratch, 'visual');
  await fs.rm(diffDir, { recursive: true, force: true });
  await fs.mkdir(diffDir, { recursive: true });
  await fs.mkdir(ctx.baselinesDir, { recursive: true });
  const details = [];
  let missing = 0; let changed = 0; let written = 0; let same = 0;
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await pool(examples, 6, async (ex) => {
    const { page, ready, error } = await openExample(context, app, ex);
    if (!ready || error) { details.push({ where: ex.name, message: 'example did not render (see the install check)' }); await page.close(); return; }
    await page.addStyleTag({ content: '*, *::before, *::after { caret-color: transparent !important; transition: none !important; animation: none !important; }' });
    await page.waitForTimeout(100);
    const shot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    await page.close();
    const file = path.join(ctx.baselinesDir, `${ex.file}.png`);
    if (update) { await fs.writeFile(file, shot); written++; return; }
    if (!existsSync(file)) { missing++; details.push({ where: ex.name, message: `no baseline (${rel(file)}); approve with --update-baselines` }); return; }
    const a = PNG.sync.read(await fs.readFile(file));
    const b = PNG.sync.read(shot);
    if (a.width !== b.width || a.height !== b.height) {
      changed++;
      await fs.writeFile(path.join(diffDir, `${ex.file}.actual.png`), shot);
      details.push({ where: ex.name, message: `size changed ${a.width}×${a.height} → ${b.width}×${b.height}; actual: ${rel(path.join(diffDir, `${ex.file}.actual.png`))}` });
      return;
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: PIXEL_THRESHOLD });
    const ratio = n / (a.width * a.height);
    if (ratio > MAX_DIFF_RATIO) {
      changed++;
      await fs.writeFile(path.join(diffDir, `${ex.file}.diff.png`), PNG.sync.write(diff));
      await fs.writeFile(path.join(diffDir, `${ex.file}.actual.png`), shot);
      details.push({ where: ex.name, message: `${(ratio * 100).toFixed(2)}% pixels changed (> ${MAX_DIFF_RATIO * 100}%); diff: ${rel(path.join(diffDir, `${ex.file}.diff.png`))}` });
    } else same++;
  });
  await context.close();
  if (update) return { status: 'pass', summary: `wrote ${written} baselines to ${rel(ctx.baselinesDir)} (record the reason in REPORT.md)`, details };
  return {
    status: details.length ? 'fail' : 'pass',
    summary: `${same}/${examples.length} examples match their baseline (${changed} changed, ${missing} without baseline; threshold ${MAX_DIFF_RATIO * 100}% pixels)`,
    details,
  };
}
export { run_ as run };

// gate-report.json (machine) and GATE.md (people) for one gate run.
import fs from 'node:fs/promises';
import path from 'node:path';

const fmtDetail = (d) => (typeof d === 'string' ? d : [d.where, d.message].filter(Boolean).join(': '));

export async function writeReports(ctx, report) {
  // every run also keeps its own copy (concurrent partial runs overwrite the shared report)
  const runs = path.join(ctx.scratch, 'runs');
  await fs.mkdir(runs, { recursive: true });
  await fs.writeFile(path.join(runs, `${report.timestamp.replace(/[:.]/g, '-')}.json`), JSON.stringify(report, null, 1));
  await fs.writeFile(path.join(ctx.sysDir, 'gate-report.json'), JSON.stringify(report, null, 1) + '\n');
  const icon = { pass: 'PASS', fail: 'FAIL', skip: 'skip' };
  const md = [
    `# Gate: ${report.system}`,
    '',
    `**${report.status.toUpperCase()}**${report.partial ? ' (partial run: not valid for publishing)' : ''} · ${report.timestamp} · ${report.durationSec}s · source \`${report.sourceHash.slice(0, 12)}\``,
    '',
    `Command: \`${report.command}\``,
    '',
    '| # | Check | Result | Summary |',
    '|---|---|---|---|',
    ...report.checks.map((c, i) => `| ${i + 1} | ${c.title} (\`${c.id}\`) | ${icon[c.status]} | ${String(c.summary).replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`),
    '',
  ];
  for (const c of report.checks) {
    if (!c.details?.length && !c.warnings?.length) continue;
    md.push(`## ${c.title} — ${icon[c.status]}`, '', c.summary, '');
    const shown = (c.details ?? []).slice(0, 300);
    for (const d of shown) md.push(`- ${fmtDetail(d).replace(/\n/g, ' ')}`);
    if ((c.details?.length ?? 0) > shown.length) md.push(`- … ${c.details.length - shown.length} more in gate-report.json`);
    if (c.warnings?.length) {
      md.push('', '**Warnings** (do not fail the gate):', '');
      for (const w of c.warnings.slice(0, 100)) md.push(`- ${fmtDetail(w)}`);
      if (c.warnings.length > 100) md.push(`- … ${c.warnings.length - 100} more in gate-report.json`);
    }
    md.push('');
  }
  md.push('---', 'Written by `npm run gate`. Thresholds are part of the standard (standard/SPEC.md §12); change them only through the SPEC process.', '');
  await fs.writeFile(path.join(ctx.sysDir, 'GATE.md'), md.join('\n'));
}

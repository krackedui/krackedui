#!/usr/bin/env node
// Claude Code PreToolUse hook (Bash). Reads the hook JSON on stdin and blocks (exit 2, reason on stderr):
//   - npm/pnpm/yarn publish with --ignore-scripts, or for a system whose gate verify fails;
//   - vercel deploy / vercel --prod unless every system's gate verify passes;
//   - git … --no-verify (and `git commit -n`);
//   - deleting or rewriting a gate-report.json from the shell.
// Anything it cannot parse is allowed: the hook must never block ordinary work by accident.
import path from 'node:path';
import { verify, allSystems } from './verify.mjs';

const block = (msg) => {
  process.stderr.write(`Blocked by the KrackedUI gate guard: ${msg}\nThe gate decides (AGENTS.md rule 1, standard/SPEC.md §12). Run \`npm run gate -- <system>\` and fix what fails; don't work around it.\n`);
  process.exit(2);
};

let input;
try {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  input = JSON.parse(raw);
} catch { process.exit(0); }
// Heredoc bodies are data (file contents, scripts' text), not commands: drop them, keep the first line.
const command = String(input?.tool_input?.command ?? '').replace(/(<<-?\s*['"]?(\w+)['"]?[^\n]*)\n[\s\S]*?\n\2[ \t]*(?=\n|$)/g, '$1');
const cwd = String(input?.cwd ?? process.cwd());
if (!command.trim()) process.exit(0);

// Split into simple commands (&&, ||, ;, |, newlines); keep quoted text intact enough for matching.
const segments = command.split(/&&|\|\||[;\n|]/).map((s) => s.trim()).filter(Boolean);
const words = (s) => s.match(/"[^"]*"|'[^']*'|\S+/g)?.map((w) => w.replace(/^['"]|['"]$/g, '')) ?? [];
const strip = (ws) => { // drop env assignments and runners: FOO=1 npx -y vercel …
  let i = 0;
  while (i < ws.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(ws[i])) i++;
  while (i < ws.length && ['npx', 'pnpx', 'bunx', 'exec', 'command', 'sudo', 'env'].includes(ws[i])) { i++; while (i < ws.length && ws[i].startsWith('-')) i++; }
  return ws.slice(i);
};

// 1. gate-report.json must only be written by the gate.
if (/gate-report\.json/.test(command)) {
  // cp/install/ln only write their last argument; rm/mv/truncate/tee/unlink touch every one.
  const writes = /(^|[\s;&|(])(rm|unlink|mv|truncate|tee)\s[^;&|\n]*gate-report\.json|(^|[\s;&|(])(cp|install|ln)\s[^;&|\n]*\sgate-report\.json\s*($|[;&|\n)])|(^|[\s;&|(])(cp|install|ln)\s[^;&|\n]*\s\S*\/gate-report\.json\s*($|[;&|\n)])|\bdd\s[^;&|\n]*of=\S*gate-report\.json|>{1,2}\s*\S*gate-report\.json|sed\s+(-[a-zA-Z]*i|--in-place)[^;&|\n]*gate-report\.json|perl\s+-[a-zA-Z]*i[^;&|\n]*gate-report\.json|(writeFile|unlink|rmSync|rm)\w*\([^\n]*gate-report\.json|git\s+(checkout|restore|rm)\s[^;&|\n]*gate-report\.json/;
  if (writes.test(command)) block('gate-report.json is written only by `npm run gate`; it may not be edited, moved or deleted by hand.');
}

const findSystems = async (seg, segCwd) => {
  const all = await allSystems();
  const hit = new Set();
  for (const s of all) {
    if (new RegExp(`systems/${s}(/|\\b)|@krackedui/${s}(-template-[\\w-]+)?\\b`).test(seg)) hit.add(s);
  }
  const m = path.relative(path.join(path.dirname(path.dirname(path.dirname(new URL(import.meta.url).pathname)))), segCwd).match(/^systems\/([^/]+)/);
  if (m && all.includes(m[1])) hit.add(m[1]);
  return hit.size ? [...hit] : all;
};

let segCwd = cwd;
for (const seg of segments) {
  const cd = seg.match(/^cd\s+(\S+)/);
  if (cd) { segCwd = path.resolve(segCwd, cd[1].replace(/^['"]|['"]$/g, '')); continue; }
  const ws = strip(words(seg));
  const [bin, ...rest] = ws;
  if (!bin) continue;
  const base = path.basename(bin);

  // 2. git --no-verify
  if (base === 'git' && (rest.includes('--no-verify') || (rest[0] === 'commit' && rest.some((w) => /^-[a-zA-Z]*n[a-zA-Z]*$/.test(w) && !w.startsWith('--'))))) {
    block('`--no-verify` skips the repository hooks.');
  }

  // 3. publish
  const isPublish = ['npm', 'pnpm', 'yarn'].includes(base) && (rest.includes('publish') || rest.includes('pub') || (base === 'yarn' && rest[0] === 'npm' && rest[1] === 'publish'));
  if (isPublish) {
    if (rest.some((w) => w === '--ignore-scripts' || w.startsWith('--ignore-scripts='))) block('publishing with --ignore-scripts skips the prepublishOnly gate check.');
    if (rest.includes('--dry-run')) continue;
    for (const s of await findSystems(seg, segCwd)) {
      const r = await verify(s);
      if (!r.ok) block(`cannot publish: ${s}: ${r.reason}`);
    }
  }

  // 4. deploy
  if (base === 'vercel' && (rest.length === 0 || rest.includes('deploy') || rest.includes('--prod') || rest.includes('--prebuilt') || rest[0] === 'promote')) {
    for (const s of await allSystems()) {
      const r = await verify(s);
      if (!r.ok) block(`cannot deploy: ${s}: ${r.reason}`);
    }
  }
}
process.exit(0);

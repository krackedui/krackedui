#!/usr/bin/env node
// @krackedui/create: copy a published KrackedUI template into a new folder.
//   npm create @krackedui my-app -- --system motion --template fintech [--install] [--force]
//   npm create @krackedui -- --list
//   --from <folder|tarball> uses a local template instead of the npm registry.
// Templates are npm packages named @krackedui/<system>-template-<template>.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(here, 'catalog.json'), 'utf8'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function list() {
  console.log('\nKrackedUI templates\n');
  for (const [name, s] of Object.entries(catalog.systems)) {
    console.log(`  ${name}: ${s.description}`);
    for (const t of s.templates) console.log(`    --system ${name} --template ${t}`);
  }
  console.log('');
}

async function ask(question, choices) {
  if (!process.stdin.isTTY) fail(`Missing ${question}. Pass it as a flag (see --list).`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log(`\n${question}`);
  choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  const answer = (await rl.question('> ')).trim();
  rl.close();
  const pick = choices[Number(answer) - 1] ?? choices.find((c) => c === answer);
  if (!pick) fail(`"${answer}" is not one of: ${choices.join(', ')}`);
  return pick;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) {
  console.log('Usage: npm create @krackedui <dir> -- --system <name> --template <sector> [--install] [--force] [--version <v>]');
  list();
  process.exit(0);
}
if (args.list) {
  list();
  process.exit(0);
}

const system = args.system ?? (await ask('Which design system?', Object.keys(catalog.systems)));
const templates = catalog.systems[system]?.templates;
const template = args.template ?? (templates ? await ask('Which template?', templates) : fail(`Unknown system "${system}". Try --list.`));
const dir = path.resolve(args._[0] ?? `${system}-${template}`);
const pkgName = `@krackedui/${system}-template-${template}`;
// --from <folder|tarball> installs a local build of a template (used by the gate and for testing).
const spec = args.from ? path.resolve(args.from) : `${pkgName}@${args.version ?? 'latest'}`;

if (fs.existsSync(dir) && fs.readdirSync(dir).length && !args.force) fail(`${dir} is not empty. Use another folder or --force.`);

console.log(`\n› Fetching ${spec}`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'krackedui-create-'));
try {
  let tarball;
  try {
    const out = execFileSync(npm, ['pack', spec, '--pack-destination', tmp, '--json', '--loglevel=error'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    tarball = JSON.parse(out)[0].filename;
  } catch (e) {
    const reason = String(e.stderr || e.message).split('\n').find((l) => /error/i.test(l) && !/complete log/i.test(l)) ?? String(e.message).split('\n')[0];
    fail(`Could not download ${spec} from npm.\n  ${reason.trim()}\n  Check the name with --list.`);
  }
  execFileSync('tar', ['-xzf', path.join(tmp, tarball), '-C', tmp]);
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(path.join(tmp, 'package'), dir, { recursive: true });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// npm strips .gitignore from packages; templates ship it as _gitignore.
if (fs.existsSync(path.join(dir, '_gitignore'))) fs.renameSync(path.join(dir, '_gitignore'), path.join(dir, '.gitignore'));

const pkgPath = path.join(dir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = path.basename(dir).toLowerCase().replace(/[^a-z0-9-_.]/g, '-');
pkg.version = '0.1.0';
pkg.private = true;
delete pkg.publishConfig;
delete pkg.files;
delete pkg.scripts?.prepublishOnly;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`✓ Created ${path.relative(process.cwd(), dir) || '.'} from ${pkgName}`);
if (args.install) {
  console.log('› npm install');
  execFileSync(npm, ['install'], { cwd: dir, stdio: 'inherit' });
}
const rel = path.relative(process.cwd(), dir) || '.';
console.log(`\nNext:\n  cd ${rel}\n${args.install ? '' : '  npm install\n'}  npm run dev\n`);

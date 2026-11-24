// Policy checks no linter covers. Runs identically in CI (verify.yml -> policy job) and locally
// (`npm run check:policy`, part of `npm run verify`). Zero dependencies, any OS. Identical file in et-be
// and rt-fe; frontend-only checks switch on when vite.config.ts exists.
//
// All apps:
//   1. No file-wide `eslint-disable` (block or line form). Line-scoped disables must name the rule(s) and
//      give a reason: `// eslint-disable-next-line <rule> -- <why>`.
//   2. No focused or skipped tests (.only / .skip / fit / fdescribe / xit / xdescribe / xtest).
//   3. No UTF-8 BOM in text files.
// Frontend (vite.config.ts present):
//   4. No PWA / service worker (ADR 0001): banned packages and files.
//   5. Colors and fonts only in src/styles/tokens.css: no quoted hex colors / font families in TS/TSX.
//
// Exit code 1 with a readable list of violations, 0 when clean.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const isFrontend = existsSync(join(root, 'vite.config.ts'));
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', 'generated']);
const CODE_FILE = /\.(ts|tsx|js|mjs|cjs)$/;
const TEXT_FILE = /\.(ts|tsx|js|mjs|cjs|json|md|css|yml|yaml|html|prisma|sh)$/;
const TEST_FILE = /\.(test|spec)\.(ts|tsx|js|mjs)$/;
const SCANNED_ROOTS = ['src', 'tests', 'scripts', 'docs', 'mock', 'prisma', '.github'];

const FILE_WIDE_DISABLE = /eslint-disable(?!-line|-next-line)(\s|\*\/|$)/;
const LINE_DISABLE = /eslint-disable-(next-)?line\b(.*)$/;
const FOCUSED_OR_SKIPPED = /\b(?:(?:it|test|describe)\.(?:only|skip)|fit|fdescribe|xit|xdescribe|xtest)\s*\(/;
const BANNED_PACKAGES = /^(vite-plugin-pwa|workbox-.+|web-push|idb)$/;
const BANNED_FILES = /^(sw\.(ts|js)|service-worker\..+|.+\.webmanifest|manifest\.json)$/;
const STYLE_IN_CODE = /(['"`]#[0-9a-fA-F]{3,8}['"`]|fontFamily|font-family:)/;

const violations = [];

function walk(dir, onFile) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(join(dir, entry.name), onFile);
    } else {
      onFile(join(dir, entry.name), entry.name);
    }
  }
}

function checkFile(path, name) {
  const rel = relative(root, path).split('\\').join('/');
  if (isFrontend && BANNED_FILES.test(name)) violations.push(`${rel}: service worker / web manifest files are banned (ADR 0001)`);
  if (!TEXT_FILE.test(name)) return;
  const raw = readFileSync(path);
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) violations.push(`${rel}: UTF-8 BOM - save as UTF-8 without BOM`);
  if (!CODE_FILE.test(name) || rel === 'scripts/check-policy.mjs') return;
  raw
    .toString('utf8')
    .split('\n')
    .forEach((line, index) => {
      const where = `${rel}:${index + 1}`;
      if (FILE_WIDE_DISABLE.test(line)) {
        violations.push(`${where}: file-wide eslint-disable - disable one rule on one line with a reason instead`);
      }
      const lineDisable = LINE_DISABLE.exec(line);
      if (lineDisable && !/\S+.*\s--\s+\S/.test(lineDisable[2])) {
        violations.push(`${where}: eslint-disable-line/-next-line must name the rule and give a reason ("rule -- why")`);
      }
      if (TEST_FILE.test(name) && FOCUSED_OR_SKIPPED.test(line)) {
        violations.push(`${where}: focused/skipped test (.only/.skip/fit/xit) - every test must run`);
      }
      if (isFrontend && rel.startsWith('src/') && /\.(ts|tsx)$/.test(name) && STYLE_IN_CODE.test(line)) {
        violations.push(`${where}: color/font literal in code - declare it in src/styles/tokens.css`);
      }
    });
}

if (isFrontend) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
    if (BANNED_PACKAGES.test(name)) violations.push(`package.json: "${name}" is banned (no PWA - ADR 0001)`);
  }
}
for (const dir of SCANNED_ROOTS) walk(join(root, dir), checkFile);
for (const name of readdirSync(root)) {
  const path = join(root, name);
  if (TEXT_FILE.test(name) || BANNED_FILES.test(name)) checkFile(path, name);
}

if (violations.length > 0) {
  console.error(`Policy check failed (${violations.length}):\n- ${violations.join('\n- ')}`);
  process.exit(1);
}
console.log('Policy check passed.');

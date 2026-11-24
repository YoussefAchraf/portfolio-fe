// Regenerates the AUTO-GENERATED sections of README.md from the documentation sources.
// Zero dependencies, any OS. Identical file in et-be and rt-fe (each repository is self-contained).
//
//   node scripts/docs-readme.mjs          rewrite README.md   (npm run docs:readme)
//   node scripts/docs-readme.mjs --check  exit 1 if stale     (npm run docs:check, part of npm run verify + CI)
//
// Sources -> README sections (only the marker pairs present in README.md are touched):
//   docs/features/*.md front-matter -> <!-- AUTO-GENERATED:FEATURES:START --> ... END
//   docs/features/*.md `routes`     -> <!-- AUTO-GENERATED:ROUTES:START -->   ... END   (frontend)
//   docs/openapi.json               -> <!-- AUTO-GENERATED:API:START -->      ... END   (backend)
//   CHANGELOG.md                    -> <!-- AUTO-GENERATED:CHANGES:START -->  ... END   (latest delivered work)
//
// Feature front-matter (between the first two `---` lines, `key: value`, lists comma-separated):
//   feature, title, status (planned | in-progress | released | deprecated), since, task, summary,
//   endpoints (backend: `METHOD /v1/path`, shown in the feature table and checked against docs/openapi.json
//   for in-progress/released features), routes (frontend, `path [access]` entries, e.g. `/login [guest]`).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const README = join(root, 'README.md');
const FEATURES_DIR = join(root, 'docs', 'features');
const OPENAPI = join(root, 'docs', 'openapi.json');
const STATUS_ORDER = ['released', 'in-progress', 'planned', 'deprecated'];

function parseFrontMatter(text, file) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0].trim() !== '---') throw new Error(`${file}: missing front-matter (first line must be ---)`);
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error(`${file}: unterminated front-matter`);
  const data = {};
  for (const line of lines.slice(1, end)) {
    const index = line.indexOf(':');
    if (index === -1 || line.trim().startsWith('#')) continue;
    data[line.slice(0, index).trim()] = line.slice(index + 1).replace(/\s+#.*$/, '').trim();
  }
  for (const key of ['feature', 'title', 'status', 'summary']) {
    if (!data[key]) throw new Error(`${file}: front-matter field "${key}" is required`);
  }
  if (!STATUS_ORDER.includes(data.status)) {
    throw new Error(`${file}: status must be one of ${STATUS_ORDER.join(', ')}`);
  }
  return data;
}

const list = (value) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []);
// Escape backslashes first, then pipes, so a markdown table cell can never end or split early.
const cell = (value) => String(value || '-').replace(/\\/g, '\\\\').replace(/\|/g, '\\|');

function readFeatures() {
  if (!existsSync(FEATURES_DIR)) return [];
  return readdirSync(FEATURES_DIR)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => ({ file: name, ...parseFrontMatter(readFileSync(join(FEATURES_DIR, name), 'utf8'), name) }))
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.title.localeCompare(b.title));
}

function featuresSection(features) {
  if (features.length === 0) return '_No features documented yet - add `docs/features/<feature>.md` (see `docs/features/_TEMPLATE.md`)._';
  // Backend feature pages list `endpoints:` - show them as an extra column when any page has them.
  const withEndpoints = features.some((f) => list(f.endpoints).length > 0);
  const endpointsCell = (f) => list(f.endpoints).map((e) => `\`${cell(e)}\``).join('<br>') || '-';
  const rows = features.map(
    (f) =>
      `| [${cell(f.title)}](docs/features/${f.file}) | ${cell(f.status)} | ${cell(f.since)} | ${cell(f.summary)} |` +
      (withEndpoints ? ` ${endpointsCell(f)} |` : ''),
  );
  const header = withEndpoints
    ? ['| Feature | Status | Since | Summary | Endpoints |', '|---|---|---|---|---|']
    : ['| Feature | Status | Since | Summary |', '|---|---|---|---|'];
  return [...header, ...rows].join('\n');
}

// Drift check: once docs/openapi.json exists, every endpoint listed by an in-progress or released feature
// page must exist in the exported spec (planned features are not built yet, so they are skipped).
function endpointDrift(features) {
  if (!existsSync(OPENAPI)) return [];
  const spec = JSON.parse(readFileSync(OPENAPI, 'utf8'));
  const base = spec.servers?.[0]?.url ?? '';
  const exported = new Set();
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of Object.keys(item)) exported.add(`${method.toUpperCase()} ${base}${path}`);
  }
  const problems = [];
  for (const f of features) {
    if (!['in-progress', 'released'].includes(f.status)) continue;
    for (const entry of list(f.endpoints)) {
      const [method = '', path = ''] = entry.split(/\s+/);
      if (!exported.has(`${method.toUpperCase()} ${path}`)) {
        problems.push(`${f.file}: "${entry}" is not in docs/openapi.json (run npm run docs:export, or fix the page)`);
      }
    }
  }
  return problems;
}

function routesSection(features) {
  const rows = [];
  for (const f of features) {
    for (const entry of list(f.routes)) {
      const match = /^(\S+)(?:\s*\[([^\]]+)\])?$/.exec(entry);
      if (match) rows.push({ path: match[1], access: match[2] || 'public', feature: f });
    }
  }
  if (rows.length === 0) return '_No routes documented yet._';
  rows.sort((a, b) => a.path.localeCompare(b.path));
  return [
    '| Route | Access | Feature | Status |',
    '|---|---|---|---|',
    ...rows.map((r) => `| \`${cell(r.path)}\` | ${cell(r.access)} | [${cell(r.feature.title)}](docs/features/${r.feature.file}) | ${cell(r.feature.status)} |`),
  ].join('\n');
}

function apiSection() {
  if (!existsSync(OPENAPI)) {
    return '_No endpoints exported yet. Run `npm run docs:export` to produce `docs/openapi.json`, then `npm run docs:readme`._';
  }
  const spec = JSON.parse(readFileSync(OPENAPI, 'utf8'));
  const base = spec.servers?.[0]?.url ?? '';
  const methods = ['get', 'post', 'put', 'patch', 'delete'];
  const rows = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of methods) {
      const op = item[method];
      if (!op) continue;
      const security = op.security ?? spec.security ?? [];
      const auth = security.length === 0 ? 'public' : security.map((s) => Object.keys(s).join('+')).join(' or ');
      rows.push({ path: `${base}${path}`, method: method.toUpperCase(), summary: op.summary, auth, id: op.operationId });
    }
  }
  if (rows.length === 0) return '_The exported spec contains no operations yet._';
  rows.sort((a, b) => a.path.localeCompare(b.path) || methods.indexOf(a.method.toLowerCase()) - methods.indexOf(b.method.toLowerCase()));
  return [
    '| Method | Path | Summary | Auth | Operation |',
    '|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.method} | \`${cell(r.path)}\` | ${cell(r.summary)} | ${cell(r.auth)} | \`${cell(r.id)}\` |`),
  ].join('\n');
}

// Latest changes: the [Unreleased] block (work merged into dev) and the most recent release, as written in
// CHANGELOG.md. Every task adds its CHANGELOG line, so the README always describes the delivered work.
const CHANGELOG = join(root, 'CHANGELOG.md');
const UNRELEASED = /^\[Unreleased\]/i;
function changesSection() {
  if (!existsSync(CHANGELOG)) return '_No CHANGELOG.md._';
  const text = readFileSync(CHANGELOG, 'utf8').replace(/\r\n/g, '\n');
  const blocks = text
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [heading, ...rest] = block.split('\n');
      return { heading: heading.trim(), body: rest.join('\n').trim() };
    });
  const pick = [blocks.find((b) => UNRELEASED.test(b.heading)), blocks.find((b) => !UNRELEASED.test(b.heading))].filter(
    (b) => b && b.body,
  );
  if (pick.length === 0) return '_No changes recorded yet._';
  return pick
    .map((b) => {
      const lines = b.body
        .split('\n')
        .filter((l) => /^(###|- )/.test(l))
        .slice(0, 25)
        .map((l) => (l.startsWith('###') ? `_${l.replace(/^###\s*/, '')}_` : l));
      const title = UNRELEASED.test(b.heading) ? 'Unreleased (merged into dev)' : b.heading.replace(/[[\]]/g, '');
      return `**${title}**\n\n${lines.join('\n')}`;
    })
    .join('\n\n');
}

function replaceSection(text, name, body) {
  const start = `<!-- AUTO-GENERATED:${name}:START -->`;
  const end = `<!-- AUTO-GENERATED:${name}:END -->`;
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  if (from === -1 || to === -1) return text;
  const note = '<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->';
  return `${text.slice(0, from + start.length)}\n${note}\n\n${body}\n\n${text.slice(to)}`;
}

try {
  const features = readFeatures();
  const drift = endpointDrift(features);
  if (drift.length > 0) throw new Error(`feature pages out of sync with the API:\n- ${drift.join('\n- ')}`);
  const current = readFileSync(README, 'utf8').replace(/\r\n/g, '\n');
  let next = replaceSection(current, 'FEATURES', featuresSection(features));
  next = replaceSection(next, 'ROUTES', routesSection(features));
  next = replaceSection(next, 'API', apiSection());
  next = replaceSection(next, 'CHANGES', changesSection());

  if (checkOnly) {
    if (next !== current) {
      console.error('README.md is out of date with docs/. Run `npm run docs:readme` and commit the result.');
      process.exit(1);
    }
    console.log('README.md is up to date.');
  } else {
    writeFileSync(README, next);
    console.log(`README.md updated (${features.length} feature doc${features.length === 1 ? '' : 's'}).`);
  }
} catch (error) {
  console.error(`docs-readme: ${error.message}`);
  process.exit(1);
}

// Local git guards for agents and humans (workspace agents/ENGINEER.md section 7). Zero dependencies, any OS.
// Identical file in et-be and rt-fe. Installed by `npm install` (package.json "prepare") which runs
// `node scripts/git-hooks.mjs install` -> git config core.hooksPath .githooks
//
//   commit-msg <file>  message format `type(NNN): summary`, no trailers, no AI tool/vendor names
//   pre-commit         staged files: no .env*, no private keys / cloud tokens, no UTF-8 BOM
//   pre-push           (stdin: <local ref> <local sha> <remote ref> <remote sha>)
//                      never push to dev/main; branch name rules; every pushed commit re-checked
//                      (catches commits made with --no-verify); task CHANGELOG line; lockfile in sync;
//                      branch up to date with origin/dev; then the local pipeline (npm run verify)
//
// Never bypass with --no-verify (ENGINEER.md 7). GIT_HOOKS_VERIFY overrides the pipeline command for the
// template's own hook tests only.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const TYPES = 'feat|fix|refactor|perf|test|docs|chore|ci|build|revert';
const SUBJECT_RE = new RegExp(`^(${TYPES})\\((\\d{3})\\): \\S.{1,70}$`);
const BRANCH_RE = /^(feature|fix|refactor|perf|test|docs|chore|ci|hotfix)\/(\d{3})-[a-z0-9]+(-[a-z0-9]+)*$/;
const PROTECTED = new Set(['dev', 'main']);
const NEEDS_CHANGELOG = new Set(['feature', 'fix', 'perf', 'refactor', 'hotfix']);
const AI_RE =
  /claude|anthropic|codex|openai|chat ?gpt|gpt-?[0-9]|gemini|bard|google ai|copilot|cursor (ai|agent|editor)|cursor\.(sh|com)|windsurf|codeium|aider|devin|tabnine|amazon q|codewhisperer|generated (with|by)|written by (an )?ai/i;
const TRAILER_RE = /^(co-authored-by|signed-off-by|generated-by|assisted-by|reviewed-by)\s*:/im;
const SECRET_RE =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|sk-[A-Za-z0-9_-]{24,}|xox[abprs]-[A-Za-z0-9-]{10,}/;
const ZERO = /^0+$/;
// npm bundled with the Node 22 images CI and Docker use. A lockfile accepted by the local npm can still be
// rejected there (platform-only optional packages), so the sync check runs this exact version.
const CI_NPM = 'npm@10.9.8';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const fail = (lines) => {
  console.error(`\n[git-hooks] BLOCKED\n- ${[].concat(lines).join('\n- ')}\n(see agents/ENGINEER.md section 7; never use --no-verify)\n`);
  process.exit(1);
};

export function checkMessage(message) {
  const text = message.replace(/\r\n/g, '\n');
  const lines = text.split('\n').filter((line) => !line.startsWith('#'));
  const subject = (lines[0] || '').trim();
  const problems = [];
  const isMerge = /^Merge (branch|remote-tracking branch|pull request) /.test(subject);
  const isAutosquash = /^(fixup|squash|amend)! /.test(subject);
  if (!isMerge && !isAutosquash && !SUBJECT_RE.test(subject)) {
    problems.push(`commit subject "${subject}" must be "type(NNN): summary" (types: ${TYPES.replace(/\|/g, ', ')}; summary <= 72 chars)`);
  }
  if (TRAILER_RE.test(lines.join('\n'))) problems.push('commit trailers (Co-authored-by, Signed-off-by, ...) are not used in this project');
  if (AI_RE.test(lines.join('\n'))) problems.push('the message names an AI tool/vendor or says "generated with/by" (ENGINEER.md 7)');
  return problems;
}

function install() {
  try {
    git('rev-parse', '--git-dir');
  } catch {
    return; // not a git checkout (e.g. npm ci inside Docker) - nothing to install
  }
  const top = git('rev-parse', '--show-toplevel').replace(/\\/g, '/');
  const here = process.cwd().replace(/\\/g, '/');
  // Only install when this package is the repository root (separate app repository).
  if (top.toLowerCase() !== here.toLowerCase()) return;
  git('config', 'core.hooksPath', '.githooks');
  console.log('[git-hooks] installed (core.hooksPath=.githooks)');
}

function commitMsg(file) {
  const problems = checkMessage(readFileSync(file, 'utf8'));
  if (problems.length > 0) fail(problems);
}

function preCommit() {
  const files = git('diff', '--cached', '--name-only', '--diff-filter=ACMR').split('\n').filter(Boolean);
  const problems = [];
  for (const file of files) {
    const base = file.split('/').pop();
    if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') problems.push(`${file}: environment files with real values are never committed`);
    if (/\.(pem|key|p12|pfx)$/.test(base) || /^id_(rsa|ed25519|ecdsa)$/.test(base)) problems.push(`${file}: key material is never committed`);
    let content;
    try {
      content = execFileSync('git', ['show', `:${file}`], { encoding: 'latin1', maxBuffer: 50 * 1024 * 1024 });
    } catch {
      continue;
    }
    if (content.startsWith('ï»¿')) problems.push(`${file}: UTF-8 BOM - save as UTF-8 without BOM`);
    if (SECRET_RE.test(content)) problems.push(`${file}: looks like a private key or access token`);
  }
  if (problems.length > 0) fail(problems);
}

function prePush() {
  const input = readFileSync(0, 'utf8').trim();
  if (!input) return;
  const problems = [];
  const changedFiles = new Set();
  let pushedBranch = '';
  for (const line of input.split('\n')) {
    const [, localSha, remoteRef, remoteSha] = line.trim().split(/\s+/);
    const branch = (remoteRef || '').replace(/^refs\/heads\//, '');
    if (ZERO.test(localSha || '')) continue; // branch deletion
    if (PROTECTED.has(branch)) {
      problems.push(`never push to "${branch}" - push your task branch and let the PR merge it`);
      continue;
    }
    const match = BRANCH_RE.exec(branch);
    if (!match) {
      problems.push(`branch "${branch}" must be <type>/<NNN>-<kebab-slug> (feature, fix, refactor, perf, test, docs, chore, ci, hotfix)`);
      continue;
    }
    if (branch.length > 60) problems.push(`branch "${branch}" is longer than 60 characters`);
    if (AI_RE.test(branch)) problems.push(`branch "${branch}" names an AI tool`);
    pushedBranch = branch;
    // commits being pushed: everything not yet on the remote branch, else not on origin/dev
    const range = !ZERO.test(remoteSha || '0') ? `${remoteSha}..${localSha}` : hasRef('origin/dev') ? `origin/dev..${localSha}` : localSha;
    const shas = git('rev-list', range).split('\n').filter(Boolean);
    for (const sha of shas) {
      const msg = git('log', '-1', '--format=%B', sha);
      const who = git('log', '-1', '--format=%an <%ae> / %cn <%ce>', sha);
      for (const p of checkMessage(msg)) problems.push(`commit ${sha.slice(0, 8)}: ${p}`);
      if (AI_RE.test(who)) problems.push(`commit ${sha.slice(0, 8)}: author/committer identity names an AI tool (${who})`);
    }
    for (const f of git('diff', '--name-only', hasRef('origin/dev') ? `origin/dev...${localSha}` : `${localSha}`).split('\n')) {
      if (f) changedFiles.add(f);
    }
    if (NEEDS_CHANGELOG.has(match[1])) {
      const changelog = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8') : '';
      if (!changelog.includes(`(${match[2]})`)) problems.push(`CHANGELOG.md has no line for task ${match[2]} under [Unreleased] (ENGINEER.md 11)`);
    }
  }
  if (problems.length > 0) fail(problems);
  if (!pushedBranch) return;

  // Up to date with dev: a branch that does not contain origin/dev can merge into a broken dev
  // even when it is green on its own (semantic conflicts). Merge origin/dev in, re-verify, push.
  try {
    git('fetch', '--quiet', 'origin', 'dev');
  } catch {
    console.warn('[git-hooks] could not fetch origin/dev - up-to-date check skipped (offline?)');
  }
  if (hasRef('origin/dev') && spawnSync('git', ['merge-base', '--is-ancestor', 'origin/dev', 'HEAD']).status !== 0) {
    fail(`branch is behind origin/dev - run "git merge origin/dev" (or rebase if never pushed), resolve conflicts (ENGINEER.md 7), re-run npm run verify, then push`);
  }

  // Always (not only when package files changed): drift can come from dev, a merge, or the template itself.
  {
    const ci = spawnSync('npx', ['--yes', '-p', CI_NPM, 'npm', 'ci', '--dry-run', '--ignore-scripts', '--no-audit', '--no-fund'], { stdio: 'pipe', shell: process.platform === 'win32' });
    if (ci.status !== 0) fail('package.json and package-lock.json are out of sync (npm ci would fail in CI) - run npm run lock:sync and commit the lockfile (never npm install after it)');
  }

  const cmd = process.env.GIT_HOOKS_VERIFY || 'npm run -s verify';
  console.log(`[git-hooks] running the local pipeline: ${cmd}`);
  const run = spawnSync(cmd, { stdio: 'inherit', shell: true });
  if (run.status !== 0) fail(`local pipeline failed (${cmd}) - fix it before pushing; CI would fail the same way`);
}

function hasRef(ref) {
  return spawnSync('git', ['rev-parse', '--verify', '--quiet', ref]).status === 0;
}

const [, , command, arg] = process.argv;
if (command === 'install') install();
else if (command === 'commit-msg') commitMsg(arg);
else if (command === 'pre-commit') preCommit();
else if (command === 'pre-push') prePush();
else if (command) fail(`unknown hook command "${command}"`);

// Regenerate package-lock.json the way CI and the Docker images read it (Linux + the npm bundled with Node 22).
//
// Why: a lockfile written on Windows/macOS can miss platform-only optional packages (for example WASM
// fallbacks of native bindings); `npm ci` on the Linux CI runner then fails with "Missing: ... from lock file"
// although `npm install` worked locally. Run this after every dependency change: `npm run lock:sync`.
// Then reinstalls with `npm ci` (never `npm install`, which would rewrite the lockfile for this platform again).
// Needs Docker. The pre-push hook checks the result with the same npm version (CI_NPM in git-hooks.mjs).
import { spawnSync } from 'node:child_process';

const IMAGE = 'node:22-alpine';
const cwd = process.cwd();
const run = spawnSync(
  'docker',
  ['run', '--rm', '-v', `${cwd}:/app`, '-w', '/app', IMAGE, 'npm', 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
  { stdio: 'inherit', env: { ...process.env, MSYS_NO_PATHCONV: '1' } },
);
if (run.error) {
  process.stderr.write(`lock:sync needs Docker (${run.error.message}). Without Docker, ask the manager (blocker request).\n`);
  process.exit(1);
}
if (run.status !== 0) process.exit(run.status ?? 1);
const ci = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (ci.status === 0) process.stdout.write('package-lock.json regenerated for Linux CI and node_modules reinstalled - commit the lockfile.\n');
process.exit(ci.status ?? 1);

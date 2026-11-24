// Runs Vitest from the canonical path of the project.
// Why: on Windows a lowercase drive letter in the working directory (c: instead of C:, common in editors
// and git hooks) makes Vitest load two copies of its own modules and every suite fails with
// "Vitest failed to find the runner". fs.realpathSync.native returns the canonical casing.
// Usage (package.json): node scripts/run-vitest.mjs run   |   node scripts/run-vitest.mjs (watch)
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { join } from 'node:path';

const cwd = realpathSync.native(process.cwd());
const vitestCli = join(cwd, 'node_modules', 'vitest', 'vitest.mjs'); // the package bin (not in its exports map)
const result = spawnSync(process.execPath, [vitestCli, ...process.argv.slice(2)], { cwd, stdio: 'inherit' });
process.exit(result.status ?? 1);

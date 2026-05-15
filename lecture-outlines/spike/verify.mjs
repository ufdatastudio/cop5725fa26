// Full headless verification: build the test fixtures, then run every check
// (PDF fragment expansion, ::: appear reveal, DuckDB SQL runner).
// Run from lecture-outlines/:  npm run verify
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const MARP = join('node_modules', '.bin', 'marp');

function step(label, cmd, args, env = {}) {
  console.log(`\n# ${label}`);
  // stdin 'ignore' so marp-cli does not block waiting for piped input.
  execFileSync(cmd, args, {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, ...env },
  });
}

mkdirSync('_verify', { recursive: true });

step('build fixture: test-sql', MARP,
  ['spike/test-sql.md', '--html', '-o', '_verify/test-sql.html'], { MARP_TARGET: 'html' });
step('build fixture: test-appear', MARP,
  ['spike/test-appear.md', '--html', '-o', '_verify/test-appear.html'], { MARP_TARGET: 'html' });

step('verify: PDF fragment expansion', process.execPath, ['spike/verify-expand.mjs']);
step('verify: ::: appear reveal', process.execPath, ['spike/verify-appear.mjs']);
step('verify: DuckDB SQL runner', process.execPath, ['spike/verify-runner.mjs']);

console.log('\nAll checks passed.');

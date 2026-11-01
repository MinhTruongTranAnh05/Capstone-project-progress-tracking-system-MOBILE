const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Metro enables color for its workers. Avoid passing a conflicting inherited NO_COLOR flag.
const environment = { ...process.env };
delete environment.NO_COLOR;
const cli = path.resolve(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');
const result = spawnSync(process.execPath, [cli, 'export', '--platform', 'all', '--output-dir', '.expo/alignment-build'], {
  stdio: 'inherit', env: environment,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

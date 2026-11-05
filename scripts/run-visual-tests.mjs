import { spawnSync } from 'node:child_process';
import { globSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`${command} terminated by ${result.signal}`);
  return result.status ?? 1;
}

if (args.includes('--inside-container')) {
  args.splice(args.indexOf('--inside-container'), 1);
  const react = process.env.PLAYWRIGHT_REACT_VERSION;
  if (react) {
    if (!['18', '19'].includes(react)) throw new Error('React version must be 18 or 19.');
    const status = run('node', ['scripts/setup-react-version.mjs', react]);
    if (status !== 0) process.exit(status);
  }
  process.exit(
    run('npm', ['run', 'test:e2e', '--', ...args], {
      env: { ...process.env, PLAYWRIGHT_INCLUDE_VISUAL_TESTS: 'true' },
    })
  );
}

const engines = process.env.CONTAINER_ENGINE
  ? [process.env.CONTAINER_ENGINE]
  : ['docker', 'podman'];
if (engines.some((engine) => !['docker', 'podman'].includes(engine))) {
  throw new Error('CONTAINER_ENGINE must be docker or podman.');
}
const engine = engines.find(
  (candidate) => spawnSync(candidate, ['info'], { stdio: 'ignore' }).status === 0
);
if (!engine) throw new Error('Start Docker or rootless Podman, then retry.');

const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const playwrightVersion = lock.packages['node_modules/@playwright/test'].version;
const dockerfile = readFileSync(join(root, 'playwright/visual.Dockerfile'), 'utf8');
if (!dockerfile.includes(`mcr.microsoft.com/playwright:v${playwrightVersion}-noble`)) {
  throw new Error(
    'Update visual.Dockerfile to match the locked Playwright version, then regenerate baselines.'
  );
}

const all = args.includes('--all');
if (all) args.splice(args.indexOf('--all'), 1);
const updateOption = args.find(
  (arg) => arg === '-u' || arg === '--update-snapshots' || arg.startsWith('--update-snapshots=')
);
const updating = updateOption !== undefined && updateOption !== '--update-snapshots=none';
if (updating && process.env.CI) throw new Error('Regenerate baselines locally, not in CI.');
if (!updating) args.push('--update-snapshots=none');
if (!all) args.unshift('playwright/e2e/rosa-wizard-visual.spec.ts');

const image = 'nxtcm-playwright-visual:local';
const buildStatus = run(engine, [
  'build',
  '--platform',
  'linux/amd64',
  '-f',
  'playwright/visual.Dockerfile',
  '-t',
  image,
  '.',
]);
if (buildStatus !== 0) process.exit(buildStatus);

const containerArgs = ['run', '--rm', '--init', '--ipc=host', '--platform', 'linux/amd64'];
if (process.getuid && process.getgid) {
  if (engine === 'podman') containerArgs.push('--userns=keep-id');
  containerArgs.push('--user', `${process.getuid()}:${process.getgid()}`);
}
for (const name of ['CI', 'PLAYWRIGHT_REACT_VERSION', 'PLAYWRIGHT_JSON_OUTPUT_NAME']) {
  if (process.env[name]) containerArgs.push('--env', `${name}=${process.env[name]}`);
}
const snapshots = (
  all
    ? globSync('playwright/e2e/**/*.spec.ts', { cwd: root })
    : ['playwright/e2e/rosa-wizard-visual.spec.ts']
).map((spec) => `${spec.replaceAll('\\', '/')}-snapshots`);
for (const directory of [...snapshots, 'test-results', 'playwright-report']) {
  mkdirSync(join(root, directory), { recursive: true });
  const mode = snapshots.includes(directory) && !updating ? 'ro,Z' : 'rw,Z';
  containerArgs.push('--volume', `${join(root, directory)}:/work/${directory}:${mode}`);
}
containerArgs.push(image, 'node', 'scripts/run-visual-tests.mjs', '--inside-container', ...args);
process.exit(run(engine, containerArgs));

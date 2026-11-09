const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const script = join(__dirname, 'run-visual-tests.mjs');
const describePosix = process.getuid && process.getgid ? describe : describe.skip;

function runWithEngine(engine, securityOptions, args = [], infoStatus = 0) {
  const directory = mkdtempSync(join(tmpdir(), 'nxtcm-visual-runner-'));
  const log = join(directory, 'calls.jsonl');
  try {
    writeFileSync(
      join(directory, engine),
      `#!${process.execPath}
const { appendFileSync } = require('node:fs');
const args = process.argv.slice(2);
appendFileSync(process.env.ENGINE_LOG, JSON.stringify(args) + '\\n');
if (args[0] === 'info' && args.includes('--format')) {
  process.stdout.write(process.env.SECURITY_OPTIONS);
  process.exit(Number(process.env.INFO_STATUS));
}
`,
      { mode: 0o755 }
    );
    const env = {
      ...process.env,
      PATH: `${directory}:${process.env.PATH}`,
      CONTAINER_ENGINE: engine,
      ENGINE_LOG: log,
      SECURITY_OPTIONS: securityOptions,
      INFO_STATUS: String(infoStatus),
    };
    delete env.CI;
    const result = spawnSync(process.execPath, [script, ...args], { env, encoding: 'utf8' });
    const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
    return { ...result, calls, run: calls.find((call) => call[0] === 'run') };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describePosix('visual runner container user mapping', () => {
  it.each([
    ['comparison', []],
    ['baseline update', ['--update-snapshots']],
  ])('maps rootless Docker to container root for %s', (_mode, args) => {
    const result = runWithEngine(
      'docker',
      '["name=seccomp,profile=builtin","name=rootless"]',
      args
    );
    expect(result.status).toBe(0);
    expect(result.run).toEqual(expect.arrayContaining(['--user', '0:0']));
    expect(result.run).not.toContain('--userns=keep-id');
    expect(result.run).toContainEqual(expect.stringContaining('/work/test-results:rw,Z'));
    expect(result.run).toContainEqual(expect.stringContaining('/work/playwright-report:rw,Z'));
    const mode = args.length ? 'rw' : 'ro';
    expect(result.run).toContainEqual(
      expect.stringContaining(`/work/playwright/e2e/rosa-wizard-visual.spec.ts-snapshots:${mode},Z`)
    );
  });

  it('retains host IDs for regular Docker', () => {
    const result = runWithEngine('docker', '["name=seccomp,profile=builtin"]');
    expect(result.status).toBe(0);
    expect(result.run).toEqual(
      expect.arrayContaining(['--user', `${process.getuid()}:${process.getgid()}`])
    );
    expect(result.run).not.toContain('--userns=keep-id');
  });

  it('retains Podman keep-id mapping without querying Docker security options', () => {
    const result = runWithEngine('podman', '');
    expect(result.status).toBe(0);
    expect(result.run).toEqual(
      expect.arrayContaining([
        '--userns=keep-id',
        '--user',
        `${process.getuid()}:${process.getgid()}`,
      ])
    );
    expect(result.calls).not.toContainEqual(expect.arrayContaining(['--format']));
  });

  it.each([
    ['null', 0],
    ['not json', 0],
    ['[]', 1],
  ])(
    'stops before building when Docker mapping detection fails with %s and status %s',
    (options, status) => {
      const result = runWithEngine('docker', options, [], status);
      expect(result.status).not.toBe(0);
      expect(result.calls.some((call) => ['build', 'run'].includes(call[0]))).toBe(false);
    }
  );
});

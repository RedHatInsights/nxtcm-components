const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'write-storybook-metadata.mjs');
const ROOT = process.cwd();

function runScript(outDir, env = {}) {
  let exitCode = 0;
  let stdout = '';
  let stderr = '';

  try {
    stdout = execFileSync(process.execPath, [SCRIPT_PATH, outDir], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: ROOT,
      env: { ...process.env, ...env },
    });
  } catch (err) {
    exitCode = err.status ?? 1;
    stdout = err.stdout?.toString() || '';
    stderr = err.stderr?.toString() || '';
  }

  return { exitCode, stdout, stderr };
}

describe('write-storybook-metadata script', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-metadata-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('writes metadata with default local deployment type', () => {
    const result = runScript(tempDir);
    expect(result.exitCode).toBe(0);

    const metadata = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'storybook-metadata.json'), 'utf8')
    );
    expect(metadata.deploymentType).toBe('local');
    expect(metadata.dashboardVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(metadata.wizardVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(metadata.commitSha).toBe('');
    expect(metadata.timestamp).toBeTruthy();
  });

  it('writes metadata with release deployment type from env', () => {
    const result = runScript(tempDir, {
      STORYBOOK_DEPLOYMENT_TYPE: 'release',
      STORYBOOK_COMMIT_SHA: 'abc123def456',
    });
    expect(result.exitCode).toBe(0);

    const metadata = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'storybook-metadata.json'), 'utf8')
    );
    expect(metadata.deploymentType).toBe('release');
    expect(metadata.commitSha).toBe('abc123def456');
  });

  it('writes metadata with preview deployment type from env', () => {
    const result = runScript(tempDir, {
      STORYBOOK_DEPLOYMENT_TYPE: 'preview',
      STORYBOOK_COMMIT_SHA: 'deadbeef',
    });
    expect(result.exitCode).toBe(0);

    const metadata = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'storybook-metadata.json'), 'utf8')
    );
    expect(metadata.deploymentType).toBe('preview');
    expect(metadata.commitSha).toBe('deadbeef');
  });

  it('reads real workspace package versions', () => {
    const result = runScript(tempDir);
    expect(result.exitCode).toBe(0);

    const metadata = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'storybook-metadata.json'), 'utf8')
    );
    const dashboardPkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/nxtcm-dashboard/package.json'), 'utf8')
    );
    const wizardPkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/nxtcm-rosa-hcp-wizard/package.json'), 'utf8')
    );

    expect(metadata.dashboardVersion).toBe(dashboardPkg.version);
    expect(metadata.wizardVersion).toBe(wizardPkg.version);
  });

  it('creates output directory if it does not exist', () => {
    const nestedDir = path.join(tempDir, 'nested', 'dir');
    const result = runScript(nestedDir);
    expect(result.exitCode).toBe(0);
    expect(fs.existsSync(path.join(nestedDir, 'storybook-metadata.json'))).toBe(true);
  });
});

const { spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const script = join(__dirname, 'check-peer-dep-versions.mjs');
const supported = '^18.2.0 || ^19.0.0';

function checkVersions(devRange, workspaceRange = supported, peerRange = supported) {
  const directory = mkdtempSync(join(tmpdir(), 'nxtcm-peer-test-'));
  try {
    mkdirSync(join(directory, 'library'));
    writeFileSync(
      join(directory, 'package.json'),
      JSON.stringify({
        workspaces: ['library'],
        peerDependencies: { react: peerRange },
        devDependencies: { react: devRange },
      })
    );
    writeFileSync(
      join(directory, 'library/package.json'),
      JSON.stringify({ peerDependencies: { react: workspaceRange } })
    );
    return spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('peer dependency compatibility', () => {
  it.each(['^18.2.0', '^19.0.0'])('accepts development against %s', (range) => {
    expect(checkVersions(range).status).toBe(0);
  });

  it.each(['^17.0.0', '>=18.2.0', 'invalid'])('rejects unsupported range %s', (range) => {
    const result = checkVersions(range);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('is not covered by peer range');
  });

  it('rejects a workspace that drops one supported major', () => {
    const result = checkVersions('^19.0.0', '^19.0.0');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Peer dependency version mismatch');
  });
});

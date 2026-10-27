import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const major = process.argv[2];
assert.ok(['18', '19'].includes(major), 'Usage: node scripts/setup-react-version.mjs <18|19>');

const packages = ['react', 'react-dom', '@types/react', '@types/react-dom'];

// Start from npm ci in each job, then overlay only the selected React major.
// --no-save keeps the manifests and lockfile unchanged while still reading the
// lockfile for unrelated dependencies (unlike --package-lock=false).
execFileSync(
  'npm',
  [
    'install',
    '--no-save',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    ...packages.map((name) => `${name}@${major}`),
  ],
  { stdio: 'inherit' }
);

const rootRequire = createRequire(resolve('package.json'));
for (const directory of ['.', 'packages/nxtcm-dashboard', 'packages/nxtcm-rosa-hcp-wizard']) {
  const require = createRequire(resolve(directory, 'package.json'));
  for (const name of packages) {
    const manifest = `${name}/package.json`;
    const { version } = require(manifest);
    assert.equal(version.split('.')[0], major, `${directory} resolves ${name}@${version}`);
    assert.equal(
      require.resolve(manifest),
      rootRequire.resolve(manifest),
      `${directory} must use the shared ${name} installation`
    );
    console.log(`${directory}: ${name}@${version}`);
  }
  assert.equal(
    require('react/package.json').version,
    require('react-dom/package.json').version,
    `${directory} must resolve matching react and react-dom versions`
  );
}

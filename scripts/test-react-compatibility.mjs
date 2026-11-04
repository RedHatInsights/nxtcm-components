import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { parse } from '@babel/parser';
import { build, preview } from 'vite';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootRequire = createRequire(join(repo, 'package.json'));
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const packages = ['nxtcm-dashboard', 'nxtcm-rosa-hcp-wizard'].map((name) => ({
  directory: join(repo, 'packages', name),
  manifest: readJson(join(repo, 'packages', name, 'package.json')),
}));

// Check both formats, including sources from bundled dependencies. An external
// import alone is insufficient: a second JSX runtime could still be embedded.
for (const { directory, manifest } of packages) {
  for (const format of ['mjs', 'cjs']) {
    const file = join(directory, 'dist', `index.${format}`);
    assert.ok(existsSync(file), 'Run npm run build before npm run test:react-compat');
    const map = readJson(`${file}.map`);
    assert.deepEqual(
      map.sources.filter((source) => /(?:^|\/)node_modules\/(?:react|react-dom)\//.test(source)),
      [],
      `${file} bundles React or its runtime`
    );
    const imports = new Set();
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'ImportDeclaration') imports.add(node.source.value);
      if (node.type === 'CallExpression' && node.callee?.name === 'require') {
        if (node.arguments[0]?.type === 'StringLiteral') imports.add(node.arguments[0].value);
      }
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object') visit(value);
      }
    }
    visit(parse(readFileSync(file, 'utf8'), { sourceType: 'unambiguous' }).program);
    assert.ok(imports.has('react/jsx-runtime'), `${file} must import the host JSX runtime`);
  }
  function checkExport(value) {
    if (typeof value === 'string') {
      assert.ok(existsSync(join(directory, value)), `${manifest.name}: missing ${value}`);
    } else {
      Object.values(value).forEach(checkExport);
    }
  }
  checkExport(manifest.exports);
}

// Vite compares resolved entry paths with root; normalize macOS /var symlinks.
const temporary = realpathSync(mkdtempSync(join(tmpdir(), 'nxtcm-react-compat-')));
let browser;
try {
  const dependencies = {};
  for (const { directory, manifest } of packages) {
    // Pack once: every React/version-format combination below uses these bytes.
    const output = execFileSync('npm', ['pack', '--json', '--pack-destination', temporary], {
      cwd: directory,
      encoding: 'utf8',
    });
    const packed = JSON.parse(output);
    // npm 12 keys JSON results by package name; earlier npm versions use an array.
    const { filename } = Array.isArray(packed) ? packed[0] : packed[manifest.name];
    dependencies[manifest.name] = pathToFileURL(join(temporary, filename)).href;
    for (const name of Object.keys(manifest.peerDependencies)) {
      if (name === 'react' || name === 'react-dom') continue;
      // Use the versions from npm ci, rather than silently upgrading host peers.
      dependencies[name] = readJson(join(repo, 'node_modules', name, 'package.json')).version;
    }
    // PatternFly charts makes its chart engines optional peers. The dashboard
    // uses Victory, so the host fixture must provide the same engine packages.
    for (const name of Object.keys(manifest.devDependencies).filter((name) =>
      name.startsWith('victory-')
    )) {
      dependencies[name] = readJson(join(repo, 'node_modules', name, 'package.json')).version;
    }
  }

  browser = await chromium.launch();
  for (const reactVersion of ['18.2.0', '19.0.0']) {
    const major = reactVersion.split('.')[0];
    const consumer = join(temporary, `react-${major}`);
    cpSync(join(repo, 'scripts/react-compatibility'), consumer, { recursive: true });
    writeFileSync(
      join(consumer, 'package.json'),
      JSON.stringify({
        name: `nxtcm-react-${major}-consumer`,
        private: true,
        type: 'module',
        dependencies: {
          ...dependencies,
          react: reactVersion,
          'react-dom': reactVersion,
          '@types/react': `^${major}.0.0`,
          '@types/react-dom': `^${major}.0.0`,
        },
      })
    );
    console.log(`Installing isolated React ${reactVersion} consumer`);
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: consumer,
      stdio: 'inherit',
    });
    writeFileSync(
      join(consumer, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          // Match browser consumers and this repo's resolution mode. Preserve
          // keeps import/require distinct so both package type conditions run.
          module: 'Preserve',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          // Like the repo, validate consumer usage rather than third-party .d.ts internals.
          skipLibCheck: true,
          types: ['react', 'react-dom'],
        },
        include: ['consumer.tsx', 'consumer.cts'],
      })
    );
    execFileSync(process.execPath, [rootRequire.resolve('typescript/bin/tsc'), '-p', consumer], {
      cwd: consumer,
      stdio: 'inherit',
    });
    writeFileSync(
      join(consumer, 'index.html'),
      '<!doctype html><html><body><div id="root"></div><script type="module" src="/consumer.tsx"></script></body></html>'
    );
    const consumerRequire = createRequire(join(consumer, 'package.json'));
    for (const format of ['esm', 'cjs']) {
      // ESM uses the package's import condition. For CJS, resolve the require
      // condition and have Vite process those files as a browser consumer would.
      const alias =
        format === 'cjs'
          ? packages.map(({ manifest }) => ({
              find: new RegExp(`^${manifest.name}$`),
              replacement: consumerRequire.resolve(manifest.name),
            }))
          : [];
      await build({
        configFile: false,
        root: consumer,
        logLevel: 'error',
        resolve: { alias },
        build: { outDir: `dist-${format}` },
      });
      const server = await preview({
        configFile: false,
        root: consumer,
        build: { outDir: `dist-${format}` },
        preview: { host: '127.0.0.1', port: 0, open: false },
      });
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      try {
        await page.goto(server.resolvedUrls.local[0]);
        await expect(page.getByLabel('React version')).toHaveText(reactVersion);
        await expect(page.getByRole('heading', { name: 'Total clusters' })).toBeVisible();
        await page.getByRole('button', { name: '23', exact: true }).click();
        await expect(page.getByLabel('Last action')).toHaveText('view clusters');
        await expect(page.getByRole('navigation', { name: 'Wizard steps' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Cluster details' })).toBeVisible();
        const clusterName = page.getByRole('textbox', { name: /cluster name/i });
        await clusterName.fill('compat-cluster');
        await expect(clusterName).toHaveValue('compat-cluster');
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await expect(page.getByLabel('Last action')).toHaveText('cancel wizard');
        assert.deepEqual(errors, [], `React ${reactVersion} / ${format} browser errors`);
        console.log(`PASS React ${reactVersion} / ${format}: dashboard and wizard`);
      } catch (error) {
        throw new AggregateError(
          [error, ...errors.map((message) => new Error(message))],
          `React ${reactVersion} / ${format} consumer failed`
        );
      } finally {
        await page.close();
        await new Promise((resolve, reject) =>
          server.httpServer.close((error) => (error ? reject(error) : resolve()))
        );
      }
    }
  }
} finally {
  await browser?.close();
  rmSync(temporary, { recursive: true, force: true });
}

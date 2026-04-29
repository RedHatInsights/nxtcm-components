'use strict';
const { createInstrumenter } = require('istanbul-lib-instrument');
const TestExclude = require('test-exclude');

const instrumenter = createInstrumenter({
  coverageGlobalScopeFunc: false,
  coverageGlobalScope: 'globalThis',
  preserveComments: true,
  produceSourceMap: true,
  autoWrap: true,
  esModules: true,
  compact: false,
});

const testExclude = new TestExclude({
  cwd: process.cwd(),
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['**/*.spec.tsx', '**/ct-fixture.ts', '**/test-helpers.ts', 'node_modules'],
  extension: ['.ts', '.tsx'],
  excludeNodeModules: true,
});

module.exports = {
  name: 'vite:istanbul',
  enforce: 'post',
  transform(srcCode, id) {
    if (id.includes('\0') || id.includes('node_modules')) return;
    const [filename] = id.split('?');
    if (!testExclude.shouldInstrument(filename)) return;
    const combinedSourceMap = this.getCombinedSourcemap?.();
    const code = instrumenter.instrumentSync(srcCode, filename, combinedSourceMap);
    const map = instrumenter.lastSourceMap();
    return { code, map };
  },
};

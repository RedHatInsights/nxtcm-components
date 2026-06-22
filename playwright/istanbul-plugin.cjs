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
  include: ['packages/**/*.ts', 'packages/**/*.tsx'],
  exclude: [
    'packages/**/*.spec.tsx',
    '**/ct-fixture.ts',
    'packages/**/test-helpers.ts',
    'packages/**/*.stories.*',
    'node_modules',
  ],
  extension: ['.ts', '.tsx'],
  excludeNodeModules: true,
});

module.exports = function istanbulPlugin() {
  return {
    name: 'vite:istanbul',
    transform(srcCode, id) {
      const coverageEnabled = process.env.COVERAGE === 'true';
      if (!coverageEnabled) return;
      if (id.includes('\0') || id.includes('node_modules')) return;
      const [filename] = id.split('?');
      const shouldInstrument = testExclude.shouldInstrument(filename);
      if (!shouldInstrument) return;
      const combinedSourceMap = this.getCombinedSourcemap?.();
      const code = instrumenter.instrumentSync(srcCode, filename, combinedSourceMap);
      const map = instrumenter.lastSourceMap();
      return { code, map };
    },
  };
};

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

const enableCoverage = process.env.COVERAGE === 'true';

function loadIstanbulPlugin(): Plugin {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- The custom plugin is CommonJS.
  const createIstanbulPlugin: unknown = require('./istanbul-plugin.cjs');
  if (typeof createIstanbulPlugin !== 'function') {
    throw new TypeError('Expected the Istanbul plugin module to export a factory function.');
  }
  return (createIstanbulPlugin as () => Plugin)();
}
const istanbulPlugin = enableCoverage ? loadIstanbulPlugin() : null;

export default defineConfig({
  plugins: [react(), ...(istanbulPlugin ? [istanbulPlugin] : [])],
  root: path.resolve(__dirname, '../e2e-app'),
  cacheDir: path.resolve(__dirname, '../node_modules/.vite/e2e'),
  resolve: {
    alias: {
      '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
        __dirname,
        '../packages/nxtcm-dashboard/src'
      ),
      '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
        __dirname,
        '../packages/nxtcm-rosa-hcp-wizard/src'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml', 'path-browserify'],
  },
  server: {
    port: 3200,
    strictPort: true,
    watch: null,
  },
});

import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

const repoRoot = path.resolve(__dirname, '..');
const enableCoverage = process.env.COVERAGE === 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Coverage is enabled at runtime.
const istanbulPlugin = enableCoverage ? require('./istanbul-plugin.cjs')() : null;
const strykerCacheDir = process.env.STRYKER_CT_CACHE_DIR;
const strykerActiveMutant = process.env.__STRYKER_ACTIVE_MUTANT__;

export default defineConfig({
  root: path.join(__dirname, 'gallery'),
  logLevel: process.env.QUIET === 'true' ? 'warn' : 'info',
  plugins: [react(), ...(istanbulPlugin ? [istanbulPlugin] : [])],
  cacheDir: strykerCacheDir ? path.join(strykerCacheDir, 'vite-deps') : undefined,
  define: strykerActiveMutant
    ? { 'import.meta.env.STRYKER_ACTIVE_MUTANT': JSON.stringify(strykerActiveMutant) }
    : undefined,
  resolve: {
    alias: {
      '@': repoRoot,
      '@redhat-cloud-services/nxtcm-dashboard': path.join(repoRoot, 'packages/nxtcm-dashboard/src'),
      '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.join(
        repoRoot,
        'packages/nxtcm-rosa-hcp-wizard/src'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: { include: ['monaco-editor', 'monaco-yaml', 'path-browserify'] },
  server: { strictPort: true, watch: strykerCacheDir ? null : undefined },
  build: strykerCacheDir ? { emptyOutDir: true } : undefined,
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const enableCoverage = process.env.COVERAGE === 'true' || !!process.env.CI;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const istanbulPlugin = enableCoverage ? require('./playwright/istanbul-plugin.cjs') : null;

export default defineConfig({
  plugins: [react(), ...(istanbulPlugin ? [istanbulPlugin] : [])],
  root: './e2e-app',
  resolve: {
    alias: {
      '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
        __dirname,
        './packages/nxtcm-dashboard/src'
      ),
      '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
        __dirname,
        './packages/nxtcm-rosa-hcp-wizard/src'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3200,
    strictPort: true,
    watch: null,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
  },
});

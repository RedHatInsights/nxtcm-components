import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './playwright',
  resolve: {
    alias: {
      '@patternfly-labs/react-form-wizard': path.resolve(
        __dirname,
        './packages/react-form-wizard/src'
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 3200,
    strictPort: true,
  },
});

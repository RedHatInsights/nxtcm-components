import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';
const repoRoot = __dirname;
const libRoot = process.cwd() === repoRoot ? repoRoot : process.cwd();
const libEntry = resolve(libRoot, 'src/index.ts');
const libName = process.env.NXTCM_LIB_NAME ?? 'NXTCM-COMPONENTS';
const libOutDir = resolve(libRoot, 'dist');
const libRollupExternal = [
  'react',
  'react-dom',
  /^@patternfly\/.*/,
  'js-yaml',
  'yaml',
  /^monaco-editor/,
  /^monaco-yaml/,
];
// https://vitejs.dev/config/
export default defineConfig({
  root: libRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, './src'),
      '@patternfly-labs/react-form-wizard': path.resolve(
        repoRoot,
        './packages/react-form-wizard/src'
      ),
      '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
        repoRoot,
        './packages/nxtcm-dashboard/src'
      ),
      '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
        repoRoot,
        './packages/nxtcm-rosa-hcp-wizard/src'
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
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml'],
  },
  server: {
    port: 4004,
    open: true,
  },
  build: {
    lib: {
      entry: libEntry,
      name: libName,
      formats: ['umd', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'js' : format + '.js'}`,
    },
    outDir: libOutDir,
    rollupOptions: {
      external: libRollupExternal,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name || '';
        },
      },
    },
    sourcemap: true,
    emptyOutDir: false,
  },
});

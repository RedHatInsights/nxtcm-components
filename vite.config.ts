import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@patternfly-labs/react-form-wizard': path.resolve(__dirname, './packages/react-form-wizard/src'),
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
    port: 4004,
    open: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NXTCM-COMPONENTS',
      formats: ['umd', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'js' : format + '.js'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: [
        'react',
        'react-dom',
        '@patternfly/react-core',
        '@patternfly/react-icons',
        '@patternfly/react-styles',
        '@patternfly/patternfly',
        '@patternfly/react-component-groups',
        /^@patternfly\/.*/,
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
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
    // Keep declaration files
    emptyOutDir: false,
  },
});


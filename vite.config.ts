import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';
import path from 'path';
import { resolve } from 'path';
const repoRoot = __dirname;
const libRoot = process.cwd() === repoRoot ? repoRoot : process.cwd();
const libEntry = resolve(libRoot, 'src/index.ts');
const libOutDir = resolve(libRoot, 'dist');
const libRollupExternal = [
  /^react(?:$|\/)/,
  /^react-dom(?:$|\/)/,
  /^@patternfly\/.*/,
  'js-yaml',
  'yaml',
  /^monaco-editor/,
  /^monaco-yaml/,
];

const fullySpecifiedPatternFlyImports: Plugin = {
  name: 'fully-specified-patternfly-imports',

  outputOptions(options): typeof options {
    const directory = options.format === 'cjs' ? 'js' : 'esm';

    return {
      ...options,
      paths: (id: string): string => {
        const dynamic = id.match(
          /^(@patternfly\/(?:react-core|react-table))\/dist\/dynamic\/(.+)$/
        );

        if (dynamic) {
          return `${dynamic[1]}/dist/${directory}/${dynamic[2]}/index.js`;
        }

        if (id.startsWith('@patternfly/react-icons/dist/esm/icons/')) {
          const target = id.replace('/dist/esm/', `/dist/${directory}/`);
          return target.endsWith('.js') ? target : `${target}.js`;
        }

        const charts = id.match(/^@patternfly\/react-charts\/(victory|echarts)$/);

        if (charts) {
          return `@patternfly/react-charts/dist/${directory}/${charts[1]}/index.js`;
        }

        return id;
      },
    };
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  root: libRoot,
  plugins: [
    react(),
    fullySpecifiedPatternFlyImports,
    dts({
      processor: 'ts',
      tsconfigPath: resolve(libRoot, 'tsconfig.json'),
      bundleTypes: true,
      outDirs: [
        { dir: libOutDir },
        { dir: libOutDir, moduleFormat: 'esm' },
        { dir: libOutDir, moduleFormat: 'cjs' },
      ],
      exclude: [
        '**/*.spec.tsx',
        '**/*.spec-helpers.tsx',
        '**/*.stories.tsx',
        '**/*.stories.helpers.ts',
        '**/*.fixtures.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.test-data.ts',
        '**/*StorybookHelpers.tsx',
        '**/test/**',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, './'),
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
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml', 'path-browserify'],
  },
  server: {
    port: 4004,
    open: true,
  },
  build: {
    lib: {
      entry: libEntry,
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    outDir: libOutDir,
    rollupOptions: {
      external: libRollupExternal,
      output: {
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          const assetNames = assetInfo.names ?? (assetInfo.name ? [assetInfo.name] : []);
          if (assetNames.some((name) => name.endsWith('.css'))) {
            return 'index.css';
          }
          return assetNames[0] || '';
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});

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
  '@monaco-editor/react',
];

/** Convert kebab-case (e.g. lock-icon) to PascalCase (LockIcon) for UMD globals. */
const kebabToPascalCase = (value: string): string =>
  value
    .replace(/\.js(\?url)?$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Convert @patternfly package ids to Rollup-compatible UMD global names. */
const patternflyPackageToGlobal = (id: string): string => {
  const packagePath = id.replace(/^@patternfly\//, '');
  const segments = packagePath.split('/');

  if (segments.length > 1 && segments[0] === 'react-charts') {
    return segments[segments.length - 1];
  }

  return segments[0]
    .split('-')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
};

const libUmdGlobals: Record<string, string> = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@patternfly/react-core': 'reactCore',
  '@patternfly/react-icons': 'reactIcons',
  '@patternfly/react-table': 'reactTable',
  '@patternfly/widgetized-dashboard': 'widgetizedDashboard',
  '@patternfly/react-charts/victory': 'victory',
  yaml: 'YAML',
  'js-yaml': 'yaml',
  'monaco-editor': 'monaco',
  'monaco-yaml': 'monacoYaml',
  'monaco-editor/esm/vs/editor/editor.worker.js?url': 'editorWorkerUrl',
  'monaco-yaml/yaml.worker.js?url': 'yamlWorkerUrl',
  '@monaco-editor/react': 'MonacoEditorReact',
};

const resolveUmdGlobal = (id: string): string => {
  if (id in libUmdGlobals) {
    return libUmdGlobals[id];
  }

  const iconMatch = id.match(/^@patternfly\/react-icons\/dist\/esm\/icons\/(.+)$/);
  if (iconMatch) {
    return kebabToPascalCase(iconMatch[1]);
  }

  if (id.startsWith('@patternfly/')) {
    return patternflyPackageToGlobal(id);
  }

  if (id.startsWith('monaco-editor')) {
    return 'monaco';
  }

  if (id.startsWith('monaco-yaml')) {
    return 'monacoYaml';
  }

  return id;
};
// https://vitejs.dev/config/
export default defineConfig({
  root: libRoot,
  plugins: [react()],
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
        inlineDynamicImports: true,
        globals: resolveUmdGlobal,
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

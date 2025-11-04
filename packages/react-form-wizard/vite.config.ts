import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Plugin to handle .hbs and .yaml files as raw text
function rawTextPlugin(): Plugin {
  return {
    name: 'vite-plugin-raw-text',
    transform(code, id) {
      if (id.endsWith('.hbs') || id.endsWith('.yaml')) {
        const content = readFileSync(id, 'utf-8');
        return {
          code: `export default ${JSON.stringify(content)}`,
          map: null,
        };
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Enable Fast Refresh for development
        fastRefresh: isDevelopment,
      }),
      svgr({
        // svgr options: https://react-svgr.com/docs/options/
        include: '**/*.svg',
      }),
      rawTextPlugin(),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    server: {
      port: 3000,
      open: false,
      historyApiFallback: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isProduction,
      rollupOptions: {
        input: resolve(__dirname, 'wizards/index.html'),
      },
    },
    base: isProduction ? '/react-form-wizard/' : '/',
  };
});


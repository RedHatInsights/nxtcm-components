import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // merge custom configuration into the default config
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      // configure base path for github pages deployment
      // uses environment variable to set base path, defaults to '/' for local dev
      base: process.env.STORYBOOK_BASE_PATH || '/',
      resolve: {
        alias: {
          '@patternfly-labs/react-form-wizard': path.resolve(
            __dirname,
            '../packages/react-form-wizard/src'
          ),
        },
      },
      optimizeDeps: {
        include: ['ip-address', 'ip-cidr'],
      },
    });
  },
};
export default config;

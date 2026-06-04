import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/components/!(dashboard|Wizards)/**/*.stories.@(js|jsx|mjs|ts|tsx)', // TEMPORARY: Exclude dashboard and rosa hcp wizard stories from main storybook, use new packages for dashboard and rosa hcp wizard stories
    '../src/components/Wizards/!(ROSAHCPWizard)/**/*.stories.@(js|jsx|mjs|ts|tsx)', // TEMPORARY: Exclude dashboard and rosa hcp wizard stories from main storybook, use new packages for dashboard and rosa hcp wizard stories
    '../packages/nxtcm-dashboard/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/nxtcm-rosa-hcp-wizard/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
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
          '@': path.resolve(__dirname, '../src'),
          '@patternfly-labs/react-form-wizard': path.resolve(
            __dirname,
            '../packages/react-form-wizard/src'
          ),
          '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
            __dirname,
            '../packages/nxtcm-dashboard/src'
          ),
          '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
            __dirname,
            '../packages/nxtcm-rosa-hcp-wizard/src'
          ),
        },
      },
      optimizeDeps: {
        include: ['ip-address', 'ip-cidr', 'monaco-editor', 'monaco-yaml'],
      },
    });
  },
};
export default config;

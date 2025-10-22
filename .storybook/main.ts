import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs"
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@patternfly-labs/react-form-wizard': path.resolve(__dirname, '../packages/react-form-wizard/src'),
      };
    }

    // Remove the include restriction from existing CSS rules to allow all CSS files
    if (config.module?.rules) {
      config.module.rules = config.module.rules.map((rule) => {
        if (rule && typeof rule === 'object' && !Array.isArray(rule) && rule.test?.toString().includes('css')) {
          // Remove any exclude that might be blocking node_modules
          const { exclude, ...rest } = rule;
          return rest;
        }
        return rule;
      });
    }

    return config;
  },
};

export default config;
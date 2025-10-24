import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@patternfly-labs/react-form-wizard': path.resolve(__dirname, '../packages/react-form-wizard/src'),
      };
    }

    // Add SCSS module support
    if (config.module && config.module.rules) {
      // Find existing CSS rule and update it to support SCSS modules
      const cssRule = config.module.rules.find((rule) => {
        if (typeof rule === 'object' && rule && 'test' in rule) {
          return rule.test?.toString().includes('css');
        }
        return false;
      });

      // Add SCSS modules rule
      config.module.rules.push({
        test: /\.module\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
              importLoaders: 2,
            },
          },
          'sass-loader',
        ],
      });

      // Add regular SCSS rule (non-module)
      config.module.rules.push({
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      });
    }

    return config;
  },
};
export default config;
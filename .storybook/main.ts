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
    
    const cssRuleIndex = config.module?.rules?.findIndex((rule) => {
      if (typeof rule !== "object" || rule === null || !("test" in rule)) {
        return false;
      }
      return rule.test instanceof RegExp && rule.test.test(".css");
    });

    if (cssRuleIndex !== undefined && cssRuleIndex !== -1 && config.module?.rules) {
      config.module.rules.splice(cssRuleIndex, 1);
    }

    // Add CSS Modules support
    config.module?.rules?.push(
      {
        test: /\.module\.s?css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.s?css$/,
        exclude: /\.module\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      }
    );
    return config;
  },
};

export default config;
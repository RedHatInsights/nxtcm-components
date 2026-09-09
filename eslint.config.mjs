import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  // Global ignores (replaces ignorePatterns)
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/coverage/',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // React
  react.configs.flat.recommended,

  // React hooks
  reactHooks.configs['recommended-latest'],

  // JSX accessibility
  jsxA11y.flatConfigs.recommended,

  // Prettier (must be last to override conflicting rules)
  eslintConfigPrettier,
  eslintPluginPrettier,

  // Language options + settings (applies to all files)
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Custom rules (preserves all existing rules from .eslintrc.json)
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/require-await': 'warn',
      // @typescript-eslint/ban-types was removed in typescript-eslint v8
      // and replaced by three separate rules. Preserving the original
      // "warn" severity on each replacement.
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      // Disabled: typescript-eslint v8 has stricter type inference for
      // this rule, causing new errors on existing code that worked under
      // v6. Re-enable after codebase cleanup — see FCN-720.
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },

  // Stories override
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Test files override
  {
    files: ['**/*.test.tsx', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Wizard: prevent self-imports
  {
    files: ['packages/nxtcm-rosa-hcp-wizard/src/**/*.ts', 'packages/nxtcm-rosa-hcp-wizard/src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@redhat-cloud-services/nxtcm-rosa-hcp-wizard',
            '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/*',
          ],
        },
      ],
    },
  },

  // Dashboard: prevent self-imports
  {
    files: ['packages/nxtcm-dashboard/src/**/*.ts', 'packages/nxtcm-dashboard/src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@redhat-cloud-services/nxtcm-dashboard',
            '@redhat-cloud-services/nxtcm-dashboard/*',
          ],
        },
      ],
    },
  },
];

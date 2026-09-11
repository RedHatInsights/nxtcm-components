/**
 * @fileoverview Tests for the enforce-field-name-constants ESLint rule.
 *
 * Uses ESLint RuleTester. Run via: node --test eslint-rules/enforce-field-name-constants.test.js
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./enforce-field-name-constants');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('enforce-field-name-constants', rule, {
  valid: [
    // --- FIELD_NAME definition itself should NOT be flagged ---
    {
      code: `const FIELD_NAME = { REGION: 'region', CLUSTER_NAME: 'name' };`,
    },
    {
      code: `const FIELD_NAME = { ENCRYPTION: { ENCRYPTION_KEYS: 'encryption_keys' } };`,
    },

    // --- Using the constant (correct usage) ---
    {
      code: `setValue(FIELD_NAME.REGION, 'us-east-1');`,
    },
    {
      code: `getValues(FIELD_NAME.CLUSTER_NAME);`,
    },
    {
      code: `useWatch({ name: FIELD_NAME.CONFIGURE_PROXY });`,
    },
    {
      code: `useWatch({ control, name: FIELD_NAME.REGION });`,
    },
    {
      code: `schema.when(FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS, { is: 'custom' });`,
    },

    // --- setError / clearErrors / getFieldState with constants ---
    {
      code: `setError(FIELD_NAME.CLUSTER_NAME, { type: 'x', message: 'err' });`,
    },
    {
      code: `clearErrors(FIELD_NAME.REGION);`,
    },
    {
      code: `getFieldState(FIELD_NAME.CLUSTER_NAME);`,
    },

    // --- Array arguments with constants ---
    {
      code: `getValues([FIELD_NAME.REGION, FIELD_NAME.CLUSTER_NAME]);`,
    },
    {
      code: `watch([FIELD_NAME.REGION]);`,
    },
    {
      code: `trigger([FIELD_NAME.CLUSTER_VERSION, FIELD_NAME.REGION]);`,
    },
    {
      code: `schema.when([FIELD_NAME.REGION, FIELD_NAME.CLUSTER_NAME], { is: true });`,
    },

    // --- Unknown field names (not in FIELD_NAME) should NOT be flagged ---
    {
      code: `setValue('some_other_field', value);`,
    },
    {
      code: `useWatch({ name: 'unknown_field' });`,
    },
    {
      code: `schema.when('unknown_dep', { is: true });`,
    },
    {
      code: `const obj = { ID: 'multi_az' };`,
    },
    {
      code: `const obj = { ID: 'hypershift' };`,
    },
    {
      code: `setError('unknown_field', { type: 'x' });`,
    },
    {
      code: `clearErrors('unknown_field');`,
    },
    {
      code: `getFieldState('unknown_field');`,
    },
    {
      code: `getValues(['unknown1', 'unknown2']);`,
    },
    {
      code: `schema.when(['unknown_dep1', 'unknown_dep2'], { is: true });`,
    },

    // --- Non-form contexts should NOT be flagged ---
    {
      code: `const x = 'region';`,
    },
    {
      code: `console.log('security_groups_worker');`,
    },
    {
      code: `if (field === 'region') {}`,
    },

    // --- Array elements NOT in metadata properties should NOT be flagged ---
    {
      code: `const arr = ['region', 'name'];`,
    },
    {
      code: `const obj = { someOtherProp: ['region'] };`,
    },

    // --- Metadata arrays with constants (correct usage) ---
    {
      code: `const obj = { RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: [FIELD_NAME.NO_PROXY_DOMAINS] };`,
    },
    {
      code: `const obj = { setDefaults: [FIELD_NAME.MIN_REPLICAS, FIELD_NAME.MAX_REPLICAS] };`,
    },
  ],

  invalid: [
    // --- React Hook Form: setValue ---
    {
      code: `setValue('region', 'us-east-1');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },
    {
      code: `setValue('security_groups_worker', []);`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.SECURITY_GROUPS_WORKER',
            value: 'security_groups_worker',
          },
        },
      ],
    },

    // --- React Hook Form: getValues ---
    {
      code: `getValues('name');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },

    // --- React Hook Form: watch ---
    {
      code: `methods.watch('region');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- React Hook Form: trigger ---
    {
      code: `trigger('cluster_version');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.CLUSTER_VERSION',
            value: 'cluster_version',
          },
        },
      ],
    },

    // --- React Hook Form: setError ---
    {
      code: `setError('region', { type: 'custom', message: 'err' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },
    {
      code: `setError('name', { type: 'unique', message: 'taken' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },

    // --- React Hook Form: clearErrors ---
    {
      code: `clearErrors('name');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },

    // --- React Hook Form: getFieldState ---
    {
      code: `getFieldState('name');`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },

    // --- Array arguments: getValues ---
    {
      code: `getValues(['region', 'name']);`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },

    // --- Array arguments: watch ---
    {
      code: `watch(['region']);`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- Array arguments: trigger ---
    {
      code: `trigger(['cluster_version', 'region']);`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.CLUSTER_VERSION',
            value: 'cluster_version',
          },
        },
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- Array arguments: Yup .when() ---
    {
      code: `schema.when(['cluster_privacy', 'region'], { is: true });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME',
            value: 'cluster_privacy',
          },
        },
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- Mixed array: one known, one unknown ---
    {
      code: `getValues(['region', 'unknown_field']);`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- useWatch with name property ---
    {
      code: `useWatch({ name: 'configure_proxy' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.CONFIGURE_PROXY',
            value: 'configure_proxy',
          },
        },
      ],
    },
    {
      code: `useWatch({ control, name: 'region' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },
    {
      code: `useWatch({ name: 'encryption_keys' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS',
            value: 'encryption_keys',
          },
        },
      ],
    },

    // --- Yup .when() scalar ---
    {
      code: `schema.when('cluster_privacy', { is: 'external' });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME',
            value: 'cluster_privacy',
          },
        },
      ],
    },
    {
      code: `yup.string().when('etcd_encryption', { is: true });`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION',
            value: 'etcd_encryption',
          },
        },
      ],
    },

    // --- Metadata array properties ---
    {
      code: `const obj = { RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['no_proxy_domains'] };`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.NO_PROXY_DOMAINS',
            value: 'no_proxy_domains',
          },
        },
      ],
    },
    {
      code: `const obj = { RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['machine_pools_subnets', FIELD_NAME.X] };`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.MACHINE_POOLS_SUBNETS',
            value: 'machine_pools_subnets',
          },
        },
      ],
    },
    {
      code: `const obj = { setDefaults: ['min_replicas', 'max_replicas'] };`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.MIN_REPLICAS',
            value: 'min_replicas',
          },
        },
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.MAX_REPLICAS',
            value: 'max_replicas',
          },
        },
      ],
    },
    {
      code: `const obj = { clear: ['nodes_compute'] };`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: {
            constant: 'FIELD_NAME.NODES_COMPUTE',
            value: 'nodes_compute',
          },
        },
      ],
    },

    // --- Metadata ID property ---
    {
      code: `const obj = { ID: 'region' };`,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- Template literal (static, no expressions) ---
    {
      code: 'setValue(`region`, value);',
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
      ],
    },

    // --- Multiple violations in one file ---
    {
      code: `
        setValue('region', 'us-east-1');
        const x = getValues('name');
      `,
      errors: [
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.REGION', value: 'region' },
        },
        {
          messageId: 'useFieldNameConstant',
          data: { constant: 'FIELD_NAME.CLUSTER_NAME', value: 'name' },
        },
      ],
    },
  ],
});

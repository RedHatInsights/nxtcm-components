/**
 * @fileoverview ESLint rule that prevents magic-string references to known
 * ROSA HCP wizard form field names and requires use of the corresponding
 * `FIELD_NAME` constant from `src/constants/index.ts`.
 *
 * Detects magic strings in:
 * - React Hook Form APIs: setValue, getValues, watch, trigger
 * - useWatch options ({ name: '...' })
 * - Yup schema .when() first argument
 * - Wizard field metadata arrays (RESETS_FIELDS_TO_DEFAULT_ON_CHANGE, etc.)
 */

'use strict';

/**
 * Mapping of known form field name string values → the FIELD_NAME constant
 * path that should be used instead.
 *
 * Sourced from `packages/nxtcm-rosa-hcp-wizard/src/constants/index.ts`.
 * When new fields are added to the FIELD_NAME object, add them here too.
 */
const KNOWN_FIELD_NAMES = new Map([
  ['associated_aws_id', 'FIELD_NAME.ASSOCIATED_AWS_ACCOUNT_ID'],
  ['billing_account_id', 'FIELD_NAME.BILLING_ACCOUNT_ID'],
  ['region', 'FIELD_NAME.REGION'],
  ['name', 'FIELD_NAME.CLUSTER_NAME'],
  ['cluster_version', 'FIELD_NAME.CLUSTER_VERSION'],
  ['installer_role_arn', 'FIELD_NAME.INSTALLER_ROLE_ARN'],
  ['worker_role_arn', 'FIELD_NAME.WORKER_ROLE_ARN'],
  ['support_role_arn', 'FIELD_NAME.SUPPORT_ROLE_ARN'],
  ['byo_oidc_config_id', 'FIELD_NAME.BYO_OIDC_CONFIG_ID'],
  ['custom_operator_roles_prefix', 'FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX'],
  ['cluster_privacy', 'FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME'],
  [
    'cluster_privacy_public_subnet_id',
    'FIELD_NAME.CLUSTER_PRIVACY_FIELD.PUBLIC_SUBNET_ID',
  ],
  ['configure_proxy', 'FIELD_NAME.CONFIGURE_PROXY'],
  ['cidr_default', 'FIELD_NAME.CIDR_DEFAULT'],
  ['network_machine_cidr', 'FIELD_NAME.NETWORK_MACHINE_CIDR'],
  ['network_service_cidr', 'FIELD_NAME.NETWORK_SERVICE_CIDR'],
  ['network_pod_cidr', 'FIELD_NAME.NETWORK_POD_CIDR'],
  ['network_host_prefix', 'FIELD_NAME.NETWORK_HOST_PREFIX'],
  ['selected_vpc', 'FIELD_NAME.SELECTED_VPC'],
  ['machine_pools_subnets', 'FIELD_NAME.MACHINE_POOLS_SUBNETS'],
  [
    'machine_pools_subnets.0.machine_pool_subnet',
    'FIELD_NAME.SELECTED_MACHINE_POOL',
  ],
  ['machine_type', 'FIELD_NAME.MACHINE_TYPE'],
  ['autoscaling', 'FIELD_NAME.AUTOSCALING'],
  ['nodes_compute', 'FIELD_NAME.NODES_COMPUTE'],
  ['min_replicas', 'FIELD_NAME.MIN_REPLICAS'],
  ['max_replicas', 'FIELD_NAME.MAX_REPLICAS'],
  ['imds', 'FIELD_NAME.IMDS'],
  ['compute_root_volume', 'FIELD_NAME.COMPUTE_ROOT_VOLUME'],
  ['security_groups_worker', 'FIELD_NAME.SECURITY_GROUPS_WORKER'],
  ['http_proxy_url', 'FIELD_NAME.HTTP_PROXY_URL'],
  ['https_proxy_url', 'FIELD_NAME.HTTPS_PROXY_URL'],
  ['no_proxy_domains', 'FIELD_NAME.NO_PROXY_DOMAINS'],
  ['additional_trust_bundle', 'FIELD_NAME.ADDITIONAL_TRUST_BUNDLE'],
  ['upgrade_policy', 'FIELD_NAME.UPGRADE_POLICY'],
  ['upgrade_schedule', 'FIELD_NAME.UPGRADE_SCHEDULE.NAME'],
  ['upgrade-schedule-hour', 'FIELD_NAME.UPGRADE_SCHEDULE.HOUR'],
  ['upgrade-schedule-day', 'FIELD_NAME.UPGRADE_SCHEDULE.DAY'],
  ['encryption_keys', 'FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS'],
  ['kms_key_arn', 'FIELD_NAME.ENCRYPTION.KMS_KEY_ARN'],
  ['etcd_encryption', 'FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION'],
  ['etcd_key_arn', 'FIELD_NAME.ENCRYPTION.ETCD_KEY_ARN'],
]);

/** React Hook Form function names whose first argument is a field name path. */
const RHF_FIELD_NAME_FUNCTIONS = new Set([
  'setValue',
  'getValues',
  'watch',
  'trigger',
]);

/**
 * Metadata property names whose array values contain field name strings.
 * Used in the wizard's `yupSchemas/constants.ts` field meta objects.
 */
const METADATA_ARRAY_PROPERTIES = new Set([
  'RESETS_FIELDS_TO_DEFAULT_ON_CHANGE',
  // Nested within SYNCS_FIELDS_ON_CHANGE objects:
  'setDefaults',
  'clear',
]);

/**
 * Returns the name of a callee node (Identifier or MemberExpression).
 * For member expressions, returns only the property name.
 */
function getCalleeName(node) {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (
    node.type === 'MemberExpression' &&
    node.property.type === 'Identifier'
  ) {
    return node.property.name;
  }
  return null;
}

/**
 * Returns true if `node` is inside the FIELD_NAME object definition
 * (i.e. the initialiser of `const FIELD_NAME = { ... }`).
 */
function isInsideFieldNameDefinition(node) {
  let current = node.parent;
  while (current) {
    if (
      current.type === 'VariableDeclarator' &&
      current.id &&
      current.id.type === 'Identifier' &&
      current.id.name === 'FIELD_NAME'
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Returns the property key name if the node is a value inside an object
 * property (e.g. `{ ID: 'field_name' }` → 'ID').
 */
function getParentPropertyKeyName(node) {
  const parent = node.parent;
  if (
    parent &&
    parent.type === 'Property' &&
    parent.value === node &&
    parent.key
  ) {
    if (parent.key.type === 'Identifier') return parent.key.name;
    if (parent.key.type === 'Literal') return String(parent.key.value);
  }
  return null;
}

/**
 * Returns the property key name when the node is an element inside an array
 * that is the value of a known metadata property.
 */
function getParentArrayPropertyName(node) {
  const parent = node.parent;
  if (parent && parent.type === 'ArrayExpression') {
    return getParentPropertyKeyName(parent);
  }
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce use of FIELD_NAME constants instead of magic strings for wizard form field names',
      recommended: true,
    },
    messages: {
      useFieldNameConstant:
        "Use {{ constant }} instead of the magic string '{{ value }}'.",
    },
    schema: [],
  },

  create(context) {
    /**
     * Reports a violation if the string value matches a known FIELD_NAME entry
     * and the node is not inside the FIELD_NAME definition itself.
     */
    function checkStringLiteral(node, value) {
      const constant = KNOWN_FIELD_NAMES.get(value);
      if (!constant) return;
      if (isInsideFieldNameDefinition(node)) return;

      context.report({
        node,
        messageId: 'useFieldNameConstant',
        data: { constant, value },
      });
    }

    /** Extracts the raw string value from a Literal or TemplateLiteral node. */
    function getStringValue(node) {
      if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
      }
      if (
        node.type === 'TemplateLiteral' &&
        node.quasis.length === 1 &&
        node.expressions.length === 0
      ) {
        return node.quasis[0].value.cooked;
      }
      return null;
    }

    return {
      CallExpression(node) {
        const calleeName = getCalleeName(node.callee);
        if (!calleeName || node.arguments.length === 0) return;

        // 1. React Hook Form APIs: setValue, getValues, watch, trigger
        //    First argument is the field name path.
        if (RHF_FIELD_NAME_FUNCTIONS.has(calleeName)) {
          const firstArg = node.arguments[0];
          const value = getStringValue(firstArg);
          if (value != null) {
            checkStringLiteral(firstArg, value);
          }
          return;
        }

        // 2. useWatch({ name: '...' })
        if (calleeName === 'useWatch') {
          const firstArg = node.arguments[0];
          if (firstArg && firstArg.type === 'ObjectExpression') {
            for (const prop of firstArg.properties) {
              if (
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'name'
              ) {
                const value = getStringValue(prop.value);
                if (value != null) {
                  checkStringLiteral(prop.value, value);
                }
              }
            }
          }
          return;
        }

        // 3. Yup .when('field_name', ...)
        if (calleeName === 'when') {
          const firstArg = node.arguments[0];
          const value = getStringValue(firstArg);
          if (value != null) {
            checkStringLiteral(firstArg, value);
          }
        }
      },

      // 4. Metadata arrays: RESETS_FIELDS_TO_DEFAULT_ON_CHANGE, setDefaults, clear
      //    String elements inside arrays assigned to these property keys.
      'ArrayExpression > Literal'(node) {
        if (typeof node.value !== 'string') return;

        const arrayPropName = getParentArrayPropertyName(node);
        if (arrayPropName && METADATA_ARRAY_PROPERTIES.has(arrayPropName)) {
          checkStringLiteral(node, node.value);
        }
      },

      // 5. Metadata ID property: ID: 'field_name'
      'Property[key.name="ID"] > Literal'(node) {
        if (typeof node.value !== 'string') return;
        checkStringLiteral(node, node.value);
      },
    };
  },
};

/**
 * @fileoverview ESLint rule that prevents magic-string references to known
 * ROSA HCP wizard form field names and requires use of the corresponding
 * `FIELD_NAME` constant from `src/constants/index.ts`.
 *
 * The known-field-name map is auto-generated at load time by parsing the
 * FIELD_NAME constant from its source file, keeping it as the single source
 * of truth.
 *
 * Detects magic strings in:
 * - React Hook Form APIs: setValue, getValues, watch, trigger,
 *   setError, clearErrors, getFieldState
 * - useWatch options ({ name: '...' })
 * - Yup schema .when() first argument (scalar or array)
 * - Wizard field metadata arrays (RESETS_FIELDS_TO_DEFAULT_ON_CHANGE, etc.)
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Reads the FIELD_NAME constant from the wizard constants source file and
 * builds a reverse map: string value → FIELD_NAME constant path.
 *
 * This keeps the ESLint rule in sync with FIELD_NAME automatically — when
 * new fields are added to the FIELD_NAME object the rule picks them up
 * without any manual changes.
 */
function buildKnownFieldNamesFromSource() {
  const constantsPath = path.resolve(
    __dirname,
    '../packages/nxtcm-rosa-hcp-wizard/src/constants/index.ts'
  );

  let source;
  try {
    source = fs.readFileSync(constantsPath, 'utf8');
  } catch {
    return new Map();
  }

  // Locate the FIELD_NAME assignment
  const startMatch = source.match(/export\s+const\s+FIELD_NAME\s*=\s*/);
  if (!startMatch) return new Map();

  // Find the matching closing brace (handles nested objects)
  const startIdx = startMatch.index + startMatch[0].length;
  let depth = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  const objectLiteral = source.slice(startIdx, endIdx);
  const map = new Map();

  try {
    // Safe to evaluate: FIELD_NAME contains only string literals and plain
    // nested objects — no function calls, imports, or side effects.
    // eslint-disable-next-line no-new-func
    const obj = new Function(`return ${objectLiteral}`)();

    (function traverse(o, prefix) {
      for (const [key, value] of Object.entries(o)) {
        const constantPath = prefix ? `${prefix}.${key}` : `FIELD_NAME.${key}`;
        if (typeof value === 'string') {
          map.set(value, constantPath);
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, constantPath);
        }
      }
    })(obj, '');
  } catch {
    return new Map();
  }

  return map;
}

/**
 * Map of known form field name string values → the FIELD_NAME constant path.
 * Auto-generated from `packages/nxtcm-rosa-hcp-wizard/src/constants/index.ts`.
 */
const KNOWN_FIELD_NAMES = buildKnownFieldNamesFromSource();

/**
 * React Hook Form APIs whose first argument is a single field name path.
 * These do NOT accept arrays.
 */
const RHF_SCALAR_FUNCTIONS = new Set([
  'setValue',
  'setError',
  'clearErrors',
  'getFieldState',
]);

/**
 * React Hook Form APIs whose first argument can be a single field name path
 * OR an array of field name paths.
 */
const RHF_SCALAR_OR_ARRAY_FUNCTIONS = new Set([
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

    /**
     * Checks a node that may be a scalar string or an ArrayExpression of
     * strings (e.g. `getValues(['region', 'name'])`).
     */
    function checkScalarOrArray(node) {
      if (!node) return;

      if (node.type === 'ArrayExpression') {
        for (const element of node.elements) {
          if (element) {
            const value = getStringValue(element);
            if (value != null) {
              checkStringLiteral(element, value);
            }
          }
        }
        return;
      }

      const value = getStringValue(node);
      if (value != null) {
        checkStringLiteral(node, value);
      }
    }

    return {
      CallExpression(node) {
        const calleeName = getCalleeName(node.callee);
        if (!calleeName || node.arguments.length === 0) return;

        // 1. RHF APIs with scalar-only field name argument:
        //    setValue, setError, clearErrors, getFieldState
        if (RHF_SCALAR_FUNCTIONS.has(calleeName)) {
          const firstArg = node.arguments[0];
          const value = getStringValue(firstArg);
          if (value != null) {
            checkStringLiteral(firstArg, value);
          }
          return;
        }

        // 2. RHF APIs that accept scalar OR array field name arguments:
        //    getValues, watch, trigger
        if (RHF_SCALAR_OR_ARRAY_FUNCTIONS.has(calleeName)) {
          checkScalarOrArray(node.arguments[0]);
          return;
        }

        // 3. useWatch({ name: '...' })
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

        // 4. Yup .when('field_name', ...) or .when(['f1', 'f2'], ...)
        if (calleeName === 'when') {
          checkScalarOrArray(node.arguments[0]);
        }
      },

      // 5. Metadata arrays: RESETS_FIELDS_TO_DEFAULT_ON_CHANGE, setDefaults, clear
      //    String elements inside arrays assigned to these property keys.
      'ArrayExpression > Literal'(node) {
        if (typeof node.value !== 'string') return;

        const arrayPropName = getParentArrayPropertyName(node);
        if (arrayPropName && METADATA_ARRAY_PROPERTIES.has(arrayPropName)) {
          checkStringLiteral(node, node.value);
        }
      },

      // 6. Metadata ID property: ID: 'field_name'
      'Property[key.name="ID"] > Literal'(node) {
        if (typeof node.value !== 'string') return;
        checkStringLiteral(node, node.value);
      },
    };
  },
};

import Handlebars from 'handlebars';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import IPCIDR from 'ip-cidr';
import * as yaml from 'js-yaml';

import {
  findLineForPath,
  formatAjvError,
  splitYamlDocuments,
  yamlExceptionToValidationError,
} from '../../Steps/YamlEditor/yamlValidation';
import type {
  YamlResourceGenerator,
  ValidationError,
  ResourceSchema,
} from '../../Steps/YamlEditor/types';

export interface TemplateBasedGeneratorOptions {
  template: string;
  resourceSchemas: ResourceSchema[];
  helpers?: Record<string, Handlebars.HelperDelegate>;
}

/**
 * Reference implementation of `YamlResourceGenerator` for a multi-document, multi-resource
 * YAML string. The Ajv-specific wiring below (one validator per `kind`,
 * the `cidr` custom format, the `[Kind] message` convention) is this fixture's own choice —
 * consuming apps are free to use a different schema validation library entirely.
 */
export function createTemplateBasedGenerator(
  options: TemplateBasedGeneratorOptions
): YamlResourceGenerator {
  const { template, resourceSchemas, helpers } = options;

  const primaryEntry = resourceSchemas.find((s) => s.primary);
  const primaryKind = primaryEntry?.kind;
  const hbs = Handlebars.create();

  if (helpers) {
    for (const [name, helper] of Object.entries(helpers)) {
      hbs.registerHelper(name, helper);
    }
  }

  const compiled = hbs.compile(template);

  // Compile an Ajv validator for every resource schema, keyed by `kind`, so each
  // document in the multi-document YAML is checked against its own schema.
  const validatorsByKind = new Map<string, ReturnType<Ajv['compile']>>();
  if (resourceSchemas.length > 0) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    ajv.addFormat('cidr', {
      type: 'string',
      validate: (value: string) => IPCIDR.isValidCIDR(value),
    });
    for (const { kind, schema } of resourceSchemas) {
      validatorsByKind.set(kind, ajv.compile(schema));
    }
  }

  return {
    renderYaml(formValues) {
      try {
        const raw = compiled({ cluster: formValues });
        return raw
          .split('\n')
          .filter((line) => line.trim() !== '')
          .join('\n');
      } catch {
        return '';
      }
    },

    validateYaml(yamlStr): ValidationError[] {
      // No resource schemas at all — only surface YAML parse errors.
      if (validatorsByKind.size === 0) {
        try {
          yaml.loadAll(yamlStr);
        } catch (e) {
          const parseError = yamlExceptionToValidationError(e);
          if (parseError) return [parseError];
        }
        return [];
      }

      const errors: ValidationError[] = [];
      const seenKinds = new Set<string>();
      let hasParseError = false;

      for (const { content, startLine } of splitYamlDocuments(yamlStr)) {
        if (!content.trim()) continue;

        let document: unknown;
        try {
          document = yaml.load(content);
        } catch (e) {
          hasParseError = true;
          const parseError = yamlExceptionToValidationError(e, startLine - 1);
          if (parseError) errors.push(parseError);
          continue;
        }

        if (document === null || typeof document !== 'object') continue;

        const kind = (document as Record<string, unknown>).kind;
        if (typeof kind !== 'string') continue;
        seenKinds.add(kind);

        const validateDoc = validatorsByKind.get(kind);
        if (!validateDoc) continue;

        const valid = validateDoc(document);
        if (valid || !validateDoc.errors) continue;

        errors.push(
          ...validateDoc.errors.map((err) => ({
            message: `[${kind}] ${formatAjvError(err)}`,
            line: startLine + findLineForPath(content, err.instancePath) - 1,
            column: 1,
            severity: 'error' as const,
            path: err.instancePath,
          }))
        );
      }

      if (primaryKind && !hasParseError && !seenKinds.has(primaryKind)) {
        errors.unshift({
          message: `Missing ${primaryKind} document`,
          line: 1,
          column: 1,
          severity: 'error',
        });
      }

      return errors;
    },

    resourceSchemas,
  };
}

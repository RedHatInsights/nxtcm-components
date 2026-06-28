import Handlebars from 'handlebars';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import IPCIDR from 'ip-cidr';
import * as yaml from 'js-yaml';

import { findLineForPath, formatAjvError } from '../yamlValidation';
import type { YamlResourceGenerator, ValidationError, ResourceSchema } from '../types';
import type { ROSAHCPCluster } from '../../../types';

export interface TemplateBasedGeneratorOptions {
  template: string;
  resourceSchemas: ResourceSchema[];
  parseYamlToForm: (yamlStr: string) => Record<string, unknown> | null;
  formFields: ReadonlyArray<keyof ROSAHCPCluster>;
  helpers?: Record<string, Handlebars.HelperDelegate>;
}

export function createTemplateBasedGenerator(
  options: TemplateBasedGeneratorOptions
): YamlResourceGenerator {
  const { template, resourceSchemas, parseYamlToForm, formFields, helpers } = options;

  const primaryEntry = resourceSchemas.find((s) => s.primary);
  const primaryKind = primaryEntry?.kind;
  const primarySchema = primaryEntry?.schema;

  if (helpers) {
    for (const [name, helper] of Object.entries(helpers)) {
      Handlebars.registerHelper(name, helper);
    }
  }

  const compiled = Handlebars.compile(template);

  // Compile Ajv validator only for the primary resource schema.
  let validateDoc: ReturnType<Ajv['compile']> | undefined;
  if (primarySchema) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    ajv.addFormat('cidr', {
      type: 'string',
      validate: (value: string) => IPCIDR.isValidCIDR(value),
    });
    validateDoc = ajv.compile(primarySchema);
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
      // No primary schema — only surface YAML parse errors.
      if (!primaryKind || !validateDoc) {
        try {
          yaml.loadAll(yamlStr);
        } catch (e) {
          if (e instanceof yaml.YAMLException) {
            return [
              {
                message: e.message.split('\n')[0],
                line: (e.mark?.line ?? 0) + 1,
                column: (e.mark?.column ?? 0) + 1,
                severity: 'error',
              },
            ];
          }
        }
        return [];
      }

      let documents: unknown[];
      try {
        documents = yaml.loadAll(yamlStr);
      } catch (e) {
        if (e instanceof yaml.YAMLException) {
          return [
            {
              message: e.message.split('\n')[0],
              line: (e.mark?.line ?? 0) + 1,
              column: (e.mark?.column ?? 0) + 1,
              severity: 'error',
            },
          ];
        }
        return [];
      }

      const primary = documents.find(
        (doc) =>
          doc !== null &&
          typeof doc === 'object' &&
          (doc as Record<string, unknown>).kind === primaryKind
      );

      if (!primary) {
        return [
          { message: `Missing ${primaryKind} document`, line: 1, column: 1, severity: 'error' },
        ];
      }

      const valid = validateDoc(primary);
      if (valid || !validateDoc.errors) return [];

      return validateDoc.errors.map((err) => ({
        message: formatAjvError(err),
        line: findLineForPath(yamlStr, err.instancePath),
        column: 1,
        severity: 'error' as const,
        path: err.instancePath,
      }));
    },

    parseYamlToForm,
    formFields,
    resourceSchemas,
  };
}

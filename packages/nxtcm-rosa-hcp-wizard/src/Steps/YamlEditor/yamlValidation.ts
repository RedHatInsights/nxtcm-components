import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import IPCIDR from 'ip-cidr';
import * as yaml from 'js-yaml';

import rosaControlPlaneSchema from './schemas/rosaControlPlaneSchema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addFormat('cidr', {
  type: 'string',
  validate: (value: string) => IPCIDR.isValidCIDR(value),
});

const validateRosaControlPlane = ajv.compile(rosaControlPlaneSchema);

export interface ValidationError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  path?: string;
}

function detectChildIndent(lines: string[], fromLine: number, parentIndent: number): number {
  for (let j = fromLine + 1; j < lines.length; j++) {
    const t = lines[j].trimStart();
    if (!t || t.startsWith('#')) continue;
    const ci = lines[j].length - t.length;
    if (ci > parentIndent) return ci;
    break;
  }
  return parentIndent + 2;
}

function findLineForPath(content: string, instancePath: string): number {
  if (!instancePath) return 1;

  const segments = instancePath.split('/').filter(Boolean);
  const lines = content.split('\n');
  let depth = 0;
  let minIndent = 0;
  let arrayItemCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - trimmed.length;

    if (depth > 0 && indent < minIndent) break;

    const target = segments[depth];
    const isArrayIndex = /^\d+$/.test(target);

    if (isArrayIndex) {
      // Match YAML list items ('- ') at the expected indentation
      if ((trimmed.startsWith('- ') || trimmed === '-') && indent === minIndent) {
        if (arrayItemCount === parseInt(target, 10)) {
          depth++;
          minIndent = detectChildIndent(lines, i, indent);
          arrayItemCount = 0;
          if (depth >= segments.length) return i + 1;
        } else {
          arrayItemCount++;
        }
      }
    } else {
      // Match quoted or unquoted YAML keys at the expected indentation level
      const keyMatch =
        trimmed.match(/^'([^']*)'\s*:/) ??
        trimmed.match(/^"([^"]*)"\s*:/) ??
        trimmed.match(/^([^:'"#{[\s][^:]*?)\s*:/);
      const matchedKey = (keyMatch?.[1] ?? '').trim();

      if (matchedKey === target && indent === minIndent) {
        depth++;
        minIndent = detectChildIndent(lines, i, indent);
        arrayItemCount = 0;
        if (depth >= segments.length) return i + 1;
      }
    }
  }
  return 1;
}

function formatAjvError(err: ErrorObject): string {
  const path = err.instancePath || '/';
  switch (err.keyword) {
    case 'additionalProperties':
      return `Unknown field "${(err.params as { additionalProperty: string }).additionalProperty}" at ${path}`;
    case 'required':
      return `Missing required field "${(err.params as { missingProperty: string }).missingProperty}" at ${path}`;
    case 'type':
      return `Expected type "${(err.params as { type: string }).type}" at ${path}`;
    case 'enum':
      return `Must be one of [${(err.params as { allowedValues: string[] }).allowedValues.join(', ')}] at ${path}`;
    case 'pattern':
      return `Invalid format at ${path}: must match ${(err.params as { pattern: string }).pattern}`;
    case 'const':
      return `Must be "${(err.params as { allowedValue: string }).allowedValue}" at ${path}`;
    default:
      return `${err.message ?? 'Validation error'} at ${path}`;
  }
}

export function validateYaml(yamlStr: string): ValidationError[] {
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

  const controlPlane = documents.find(
    (doc) =>
      doc !== null &&
      typeof doc === 'object' &&
      (doc as Record<string, unknown>).kind === 'ROSAControlPlane'
  );

  if (!controlPlane) {
    return [
      { message: 'Missing ROSAControlPlane document', line: 1, column: 1, severity: 'error' },
    ];
  }

  const valid = validateRosaControlPlane(controlPlane);
  if (valid || !validateRosaControlPlane.errors) return [];

  return validateRosaControlPlane.errors.map((err) => ({
    message: formatAjvError(err),
    line: findLineForPath(yamlStr, err.instancePath),
    column: 1,
    severity: 'error' as const,
    path: err.instancePath,
  }));
}

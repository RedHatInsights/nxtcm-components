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

function findLineForPath(content: string, instancePath: string): number {
  if (!instancePath) return 1;

  const segments = instancePath.split('/').filter(Boolean);
  const lines = content.split('\n');
  let depth = 0;
  let targetKey = segments[depth];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    const keyMatch = trimmed.match(/^["']?([^"':]+)["']?\s*:/);
    if (keyMatch && keyMatch[1] === targetKey) {
      depth++;
      if (depth >= segments.length) {
        return i + 1;
      }
      targetKey = segments[depth];
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
  let parsed: unknown;
  try {
    parsed = yaml.load(yamlStr);
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

  if (!parsed || typeof parsed !== 'object') return [];

  const valid = validateRosaControlPlane(parsed);
  if (valid || !validateRosaControlPlane.errors) return [];

  return validateRosaControlPlane.errors.map((err) => ({
    message: formatAjvError(err),
    line: findLineForPath(yamlStr, err.instancePath),
    column: 1,
    severity: 'error' as const,
    path: err.instancePath,
  }));
}

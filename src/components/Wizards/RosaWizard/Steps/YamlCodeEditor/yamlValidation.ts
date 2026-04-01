import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import * as yaml from 'js-yaml';
import rosaControlPlaneSchema from './schemas/rosaControlPlaneSchema.json';
import rosaNetworkSchema from './schemas/rosaNetworkSchema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaMap: Record<string, object> = {
  ROSAControlPlane: rosaControlPlaneSchema,
  ROSANetwork: rosaNetworkSchema,
};

export interface ValidationError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  path?: string;
}

interface DocRange {
  startLine: number;
  content: string;
  kind?: string;
}

function splitDocuments(yamlStr: string): DocRange[] {
  const lines = yamlStr.split('\n');
  const docs: DocRange[] = [];
  let currentLines: string[] = [];
  let currentStart = 1;

  for (let i = 0; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i])) {
      if (currentLines.length > 0 && currentLines.some((l) => l.trim())) {
        docs.push({ startLine: currentStart, content: currentLines.join('\n') });
        currentLines = [];
      }
      currentStart = i + 2;
    } else {
      if (currentLines.length === 0) {
        currentStart = i + 1;
      }
      currentLines.push(lines[i]);
    }
  }
  if (currentLines.length > 0 && currentLines.some((l) => l.trim())) {
    docs.push({ startLine: currentStart, content: currentLines.join('\n') });
  }

  for (const doc of docs) {
    try {
      const parsed = yaml.load(doc.content) as Record<string, unknown> | null;
      if (parsed && typeof parsed === 'object') {
        doc.kind = parsed.kind as string | undefined;
      }
    } catch {
      // eslint-disable-next-line no-empty
    }
  }

  return docs;
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
  const errors: ValidationError[] = [];
  const docs = splitDocuments(yamlStr);

  for (const doc of docs) {
    let parsed: unknown;
    try {
      parsed = yaml.load(doc.content);
    } catch (e) {
      if (e instanceof yaml.YAMLException) {
        errors.push({
          message: e.message.split('\n')[0],
          line: doc.startLine + (e.mark?.line ?? 0),
          column: (e.mark?.column ?? 0) + 1,
          severity: 'error',
        });
      }
      continue;
    }

    if (!parsed || typeof parsed !== 'object') continue;

    const kind = doc.kind;
    if (kind && schemaMap[kind]) {
      const validate = ajv.compile(schemaMap[kind]);
      const valid = validate(parsed);

      if (!valid && validate.errors) {
        for (const err of validate.errors) {
          const localLine = findLineForPath(doc.content, err.instancePath);
          errors.push({
            message: formatAjvError(err),
            line: doc.startLine + localLine - 1,
            column: 1,
            severity: 'error',
            path: err.instancePath,
          });
        }
      }
    }
  }

  return errors;
}

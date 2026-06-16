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

const SINGLE_QUOTED_YAML_KEY = /^'([^']*)'\s*:/;
const DOUBLE_QUOTED_YAML_KEY = /^"([^"]*)"\s*:/;

function parseUnquotedYamlKey(trimmed: string): string | undefined {
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex <= 0) {
    return undefined;
  }

  const key = trimmed.slice(0, colonIndex).trim();
  if (!key || key.startsWith('#')) {
    return undefined;
  }

  return key;
}

function parseYamlKey(trimmed: string): string | undefined {
  for (const pattern of [SINGLE_QUOTED_YAML_KEY, DOUBLE_QUOTED_YAML_KEY]) {
    const match = pattern.exec(trimmed);
    if (match) {
      return match[1].trim();
    }
  }
  return parseUnquotedYamlKey(trimmed);
}

function tryMatchArraySegment(
  trimmed: string,
  indent: number,
  minIndent: number,
  target: string,
  arrayItemCount: number
): { matched: boolean; nextArrayItemCount: number } {
  if (!(trimmed.startsWith('- ') || trimmed === '-') || indent !== minIndent) {
    return { matched: false, nextArrayItemCount: arrayItemCount };
  }
  if (arrayItemCount === parseInt(target, 10)) {
    return { matched: true, nextArrayItemCount: 0 };
  }
  return { matched: false, nextArrayItemCount: arrayItemCount + 1 };
}

function tryMatchKeySegment(
  trimmed: string,
  indent: number,
  minIndent: number,
  target: string
): boolean {
  const matchedKey = parseYamlKey(trimmed);
  return matchedKey === target && indent === minIndent;
}

function getInlineContentAfterArrayMarker(trimmed: string): string {
  if (trimmed.startsWith('- ')) {
    return trimmed.slice(2);
  }
  if (trimmed === '-') {
    return '';
  }
  return trimmed;
}

function tryMatchInlineKeyAfterArray(
  trimmed: string,
  indent: number,
  minIndent: number,
  nextTarget: string
): boolean {
  const inlineTrimmed = getInlineContentAfterArrayMarker(trimmed);
  return Boolean(inlineTrimmed) && tryMatchKeySegment(inlineTrimmed, indent, minIndent, nextTarget);
}

interface PathSegmentMatch {
  matched: boolean;
  depthAdvance: number;
  nextArrayItemCount: number;
}

function tryMatchPathSegment(
  trimmed: string,
  indent: number,
  minIndent: number,
  segments: string[],
  depth: number,
  arrayItemCount: number
): PathSegmentMatch {
  const target = segments[depth];
  if (/^\d+$/.test(target)) {
    const arrayMatch = tryMatchArraySegment(trimmed, indent, minIndent, target, arrayItemCount);
    if (!arrayMatch.matched) {
      return {
        matched: false,
        depthAdvance: 0,
        nextArrayItemCount: arrayMatch.nextArrayItemCount,
      };
    }

    const nextTarget = segments[depth + 1];
    if (
      depth + 1 < segments.length &&
      !/^\d+$/.test(nextTarget) &&
      tryMatchInlineKeyAfterArray(trimmed, indent, minIndent, nextTarget)
    ) {
      return { matched: true, depthAdvance: 2, nextArrayItemCount: 0 };
    }

    return { matched: true, depthAdvance: 1, nextArrayItemCount: 0 };
  }

  const matched = tryMatchKeySegment(trimmed, indent, minIndent, target);
  return {
    matched,
    depthAdvance: matched ? 1 : 0,
    nextArrayItemCount: matched ? 0 : arrayItemCount,
  };
}

export function findLineForPath(content: string, instancePath: string): number {
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

    const match = tryMatchPathSegment(trimmed, indent, minIndent, segments, depth, arrayItemCount);
    arrayItemCount = match.nextArrayItemCount;
    if (!match.matched) {
      continue;
    }

    depth += match.depthAdvance;
    minIndent = detectChildIndent(lines, i, indent);
    if (depth >= segments.length) return i + 1;
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

  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    (parsed as Record<string, unknown>).kind !== 'ROSAControlPlane'
  ) {
    return [
      { message: 'Missing ROSAControlPlane document', line: 1, column: 1, severity: 'error' },
    ];
  }

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

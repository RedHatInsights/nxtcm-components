import { type ErrorObject } from 'ajv';
import * as yaml from 'js-yaml';

export interface ValidationError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  path?: string;
}

/** A single `---`-delimited document within a multi-document YAML string. */
export interface YamlDocumentChunk {
  content: string;
  /** 1-indexed line number where this chunk starts within the full YAML string. */
  startLine: number;
}

/**
 * Splits a multi-document YAML string on `---` document separators, tracking the
 * starting line of each chunk. Useful when building a `YamlResourceGenerator.validateYaml`
 * that validates each Kubernetes resource in a multi-doc YAML string against its own schema
 * while still reporting accurate line numbers.
 */
export function splitYamlDocuments(yamlStr: string): YamlDocumentChunk[] {
  const lines = yamlStr.split('\n');
  const chunks: YamlDocumentChunk[] = [];
  let currentLines: string[] = [];
  let currentStart = 1;

  lines.forEach((line, i) => {
    if (/^---\s*$/.test(line)) {
      chunks.push({ content: currentLines.join('\n'), startLine: currentStart });
      currentLines = [];
      currentStart = i + 2;
    } else {
      currentLines.push(line);
    }
  });
  chunks.push({ content: currentLines.join('\n'), startLine: currentStart });

  return chunks;
}

/**
 * Converts a caught YAML parse exception into a {@link ValidationError}, offsetting the
 * reported line by `lineOffset` (the start line of the chunk being parsed, minus one, when
 * parsing an individual document produced by {@link splitYamlDocuments}). Returns `undefined`
 * for anything that isn't a `js-yaml` parse error.
 */
export function yamlExceptionToValidationError(
  e: unknown,
  lineOffset = 0
): ValidationError | undefined {
  if (!(e instanceof yaml.YAMLException)) return undefined;
  return {
    message: e.message.split('\n')[0],
    line: lineOffset + (e.mark?.line ?? 0) + 1,
    column: (e.mark?.column ?? 0) + 1,
    severity: 'error',
  };
}

export function detectChildIndent(lines: string[], fromLine: number, parentIndent: number): number {
  for (let j = fromLine + 1; j < lines.length; j++) {
    const t = lines[j].trimStart();
    if (!t || t.startsWith('#')) continue;
    const ci = lines[j].length - t.length;
    if (ci > parentIndent) return ci;
    break;
  }
  return parentIndent + 2;
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

export function formatAjvError(err: ErrorObject): string {
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

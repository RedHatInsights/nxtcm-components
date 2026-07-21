import * as yaml from 'js-yaml';
import type { ErrorObject } from 'ajv';

import {
  splitYamlDocuments,
  yamlExceptionToValidationError,
  findLineForPath,
  formatAjvError,
} from './yamlValidation';

describe('splitYamlDocuments', () => {
  it('returns a single chunk starting at line 1 when there are no separators', () => {
    const chunks = splitYamlDocuments('kind: Foo\nmetadata:\n  name: a');

    expect(chunks).toEqual([{ content: 'kind: Foo\nmetadata:\n  name: a', startLine: 1 }]);
  });

  it('splits on `---` separators and tracks each chunk starting line', () => {
    const yamlStr = ['kind: Foo', '---', 'kind: Bar', '---', 'kind: Baz'].join('\n');

    const chunks = splitYamlDocuments(yamlStr);

    expect(chunks).toEqual([
      { content: 'kind: Foo', startLine: 1 },
      { content: 'kind: Bar', startLine: 3 },
      { content: 'kind: Baz', startLine: 5 },
    ]);
  });

  it('treats a separator followed by only a comment as a valid document boundary', () => {
    const yamlStr = ['kind: Foo', '--- # next resource', 'kind: Bar'].join('\n');

    const chunks = splitYamlDocuments(yamlStr);

    expect(chunks).toEqual([
      { content: 'kind: Foo', startLine: 1 },
      { content: 'kind: Bar', startLine: 3 },
    ]);
  });

  it('does not treat a separator line with arbitrary inline content as a boundary', () => {
    const yamlStr = ['kind: Foo', '--- foo: bar', 'kind: Bar'].join('\n');

    const chunks = splitYamlDocuments(yamlStr);

    expect(chunks).toEqual([
      { content: ['kind: Foo', '--- foo: bar', 'kind: Bar'].join('\n'), startLine: 1 },
    ]);
  });

  it('produces an empty leading chunk when the string starts with a separator', () => {
    const yamlStr = ['---', 'kind: Foo'].join('\n');

    const chunks = splitYamlDocuments(yamlStr);

    expect(chunks).toEqual([
      { content: '', startLine: 1 },
      { content: 'kind: Foo', startLine: 2 },
    ]);
  });
});

describe('yamlExceptionToValidationError', () => {
  it('returns undefined for errors that are not YAML parse exceptions', () => {
    expect(yamlExceptionToValidationError(new Error('not a yaml error'))).toBeUndefined();
  });

  it('converts a YAMLException into a validation error with 1-indexed line/column', () => {
    let caught: unknown;
    try {
      yaml.load('kind: Foo\n  bad indent: true');
    } catch (e) {
      caught = e;
    }

    const error = yamlExceptionToValidationError(caught);
    expect(error).toEqual({
      message: 'bad indentation of a mapping entry (2:13)',
      line: 2,
      column: 13,
      severity: 'error',
    });
  });

  it('offsets the reported line by lineOffset for chunked documents', () => {
    let caught: unknown;
    try {
      yaml.load('kind: Foo\n  bad indent: true');
    } catch (e) {
      caught = e;
    }

    expect(yamlExceptionToValidationError(caught)?.line).toBe(2);
    expect(yamlExceptionToValidationError(caught, 10)?.line).toBe(12);
  });
});

describe('findLineForPath', () => {
  it('returns line 1 when instancePath is empty', () => {
    expect(findLineForPath('kind: Foo\nspec:\n  name: a', '')).toBe(1);
  });

  it('resolves a nested object path to its line number', () => {
    const content = ['kind: Foo', 'spec:', '  name: a', '  region: us-east-1'].join('\n');

    expect(findLineForPath(content, '/spec/region')).toBe(4);
  });

  it('resolves an array index path to the line where that item starts', () => {
    const content = [
      'kind: Foo',
      'spec:',
      '  items:',
      '    - name: first',
      '    - name: second',
    ].join('\n');

    expect(findLineForPath(content, '/spec/items/1')).toBe(5);
  });

  it('falls back to line 1 when the path cannot be resolved', () => {
    const content = ['kind: Foo', 'spec:', '  name: a'].join('\n');

    expect(findLineForPath(content, '/spec/missing')).toBe(1);
  });
});

describe('formatAjvError', () => {
  const baseError = { instancePath: '/spec/name', message: 'fallback message' } as ErrorObject;

  it('formats additionalProperties errors', () => {
    const err = {
      ...baseError,
      keyword: 'additionalProperties',
      params: { additionalProperty: 'extra' },
    };

    expect(formatAjvError(err as ErrorObject)).toBe('Unknown field "extra" at /spec/name');
  });

  it('formats required errors', () => {
    const err = { ...baseError, keyword: 'required', params: { missingProperty: 'name' } };

    expect(formatAjvError(err as ErrorObject)).toBe('Missing required field "name" at /spec/name');
  });

  it('formats type errors', () => {
    const err = { ...baseError, keyword: 'type', params: { type: 'string' } };

    expect(formatAjvError(err as ErrorObject)).toBe('Expected type "string" at /spec/name');
  });

  it('formats enum errors', () => {
    const err = { ...baseError, keyword: 'enum', params: { allowedValues: ['a', 'b'] } };

    expect(formatAjvError(err as ErrorObject)).toBe('Must be one of [a, b] at /spec/name');
  });

  it('formats pattern errors', () => {
    const err = { ...baseError, keyword: 'pattern', params: { pattern: '^[a-z]+$' } };

    expect(formatAjvError(err as ErrorObject)).toBe(
      'Invalid format at /spec/name: must match ^[a-z]+$'
    );
  });

  it('formats const errors', () => {
    const err = { ...baseError, keyword: 'const', params: { allowedValue: 'fixed' } };

    expect(formatAjvError(err as ErrorObject)).toBe('Must be "fixed" at /spec/name');
  });

  it('falls back to the Ajv message for unknown keywords', () => {
    const err = { ...baseError, keyword: 'someOtherKeyword', params: {} };

    expect(formatAjvError(err as ErrorObject)).toBe('fallback message at /spec/name');
  });

  it('falls back to root path "/" when instancePath is empty', () => {
    const err = { ...baseError, instancePath: '', keyword: 'someOtherKeyword', params: {} };

    expect(formatAjvError(err as ErrorObject)).toBe('fallback message at /');
  });
});

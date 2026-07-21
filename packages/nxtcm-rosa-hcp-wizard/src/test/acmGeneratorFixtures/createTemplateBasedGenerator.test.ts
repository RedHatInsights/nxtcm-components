import type { ResourceSchema } from '../../Steps/YamlEditor/types';
import { createTemplateBasedGenerator } from './createTemplateBasedGenerator';

const fooSchema: ResourceSchema = {
  kind: 'Foo',
  primary: true,
  schema: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      spec: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
    },
    required: ['kind', 'spec'],
  },
};

const barSchema: ResourceSchema = {
  kind: 'Bar',
  schema: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
    },
  },
};

const buildGenerator = (resourceSchemas: ResourceSchema[]) =>
  createTemplateBasedGenerator({ template: '', resourceSchemas });

describe('createTemplateBasedGenerator validateYaml', () => {
  it('returns no errors for a valid multi-document YAML with the primary kind present', () => {
    const generator = buildGenerator([fooSchema, barSchema]);
    const yamlStr = ['kind: Foo', 'spec:', '  name: cluster-1', '---', 'kind: Bar'].join('\n');

    expect(generator.validateYaml(yamlStr)).toEqual([]);
  });

  it('reports a schema validation error with the kind-prefixed message and correct line', () => {
    const generator = buildGenerator([fooSchema]);
    const yamlStr = ['kind: Foo', 'spec:', '  other: value'].join('\n');

    const errors = generator.validateYaml(yamlStr);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('[Foo] Missing required field "name" at /spec');
    expect(errors[0].line).toBe(2);
    expect(errors[0].severity).toBe('error');
  });

  it('offsets schema error line numbers by the document start line in a multi-doc string', () => {
    const generator = buildGenerator([fooSchema, barSchema]);
    const yamlStr = ['kind: Bar', '---', 'kind: Foo', 'spec:', '  other: value'].join('\n');

    const errors = generator.validateYaml(yamlStr);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('[Foo] Missing required field "name" at /spec');
    expect(errors[0].line).toBe(4);
  });

  it('reports a missing primary kind document when it never appears', () => {
    const generator = buildGenerator([fooSchema, barSchema]);
    const yamlStr = 'kind: Bar';

    const errors = generator.validateYaml(yamlStr);

    expect(errors).toEqual([
      { message: 'Missing Foo document', line: 1, column: 1, severity: 'error' },
    ]);
  });

  it('does not duplicate the missing-primary-kind error when a document fails to parse', () => {
    const generator = buildGenerator([fooSchema, barSchema]);
    const yamlStr = ['kind: Bar', '---', 'kind: Foo', '  bad indent: true'].join('\n');

    const errors = generator.validateYaml(yamlStr);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).not.toContain('Missing');
  });

  it('only surfaces parse errors when there are no resource schemas at all', () => {
    const generator = buildGenerator([]);

    expect(generator.validateYaml('kind: Foo\nspec:\n  name: a')).toEqual([]);

    const errors = generator.validateYaml('kind: Foo\n  bad indent: true');
    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe('error');
  });

  it('ignores documents whose kind has no matching schema', () => {
    const generator = buildGenerator([fooSchema]);
    const yamlStr = ['kind: Foo', 'spec:', '  name: a', '---', 'kind: Unrelated'].join('\n');

    expect(generator.validateYaml(yamlStr)).toEqual([]);
  });
});

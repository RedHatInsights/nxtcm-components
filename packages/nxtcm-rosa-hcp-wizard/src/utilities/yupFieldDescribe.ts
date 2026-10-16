import * as yup from 'yup';

import { isObjectRecord } from './typeGuards';

/** Options forwarded to {@link yup.Schema.describe} (e.g. `value` when the field uses `.when()`). */
export type YupFieldDescribeOptions = NonNullable<Parameters<yup.AnySchema['describe']>[0]>;

/** Test entry shape from {@link yup.Schema.describe} (not on every {@link yup.SchemaFieldDescription} variant). */
export type YupSchemaDescribeTest = { name?: string; message?: unknown; params?: unknown };

export function metaFromDescription(description: unknown): Record<string, unknown> {
  if (description === null || typeof description !== 'object' || !('meta' in description)) {
    return {};
  }
  const { meta } = description;
  if (isObjectRecord(meta)) {
    return meta;
  }
  return {};
}

export function testsFromDescription(description: unknown): YupSchemaDescribeTest[] {
  if (
    description !== null &&
    typeof description === 'object' &&
    'tests' in description &&
    Array.isArray(description.tests)
  ) {
    return (description as { tests: YupSchemaDescribeTest[] }).tests;
  }
  return [];
}

function fieldDescriptionFromObjectDescribe(
  schema: yup.AnyObjectSchema,
  path: string,
  describeOptions?: YupFieldDescribeOptions
): yup.SchemaFieldDescription | undefined {
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  let current: yup.SchemaFieldDescription = schema.describe(describeOptions);

  for (const segment of segments) {
    if (!('fields' in current)) {
      return undefined;
    }
    const fields: yup.SchemaObjectDescription['fields'] = current.fields;
    if (!(segment in fields)) {
      return undefined;
    }
    current = fields[segment];
  }

  return current;
}

/**
 * {@link yup.Schema.describe} result for a field at `path` on an object schema.
 *
 * Prefer this over `yup.reach(schema, path).describe(options)` when the field uses
 * `.when()` on a sibling — only the parent object describe resolves those branches.
 * Falls back to reach when the path is not present on the object description.
 */
export function getYupFieldDescriptionAtPath(
  schema: yup.AnyObjectSchema,
  path: string,
  describeOptions?: YupFieldDescribeOptions
): yup.SchemaFieldDescription {
  const fromObjectDescribe = fieldDescriptionFromObjectDescribe(schema, path, describeOptions);
  if (fromObjectDescribe !== undefined) {
    return fromObjectDescribe;
  }

  const fieldSchema = yup.reach(schema, path);
  return fieldSchema.describe(describeOptions);
}

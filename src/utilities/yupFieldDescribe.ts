import * as yup from 'yup';

/** Options forwarded to {@link yup.Schema.describe} (e.g. `value` when the field uses `.when()`). */
export type YupFieldDescribeOptions = NonNullable<Parameters<yup.AnySchema['describe']>[0]>;

/** Test entry shape from {@link yup.Schema.describe} (not on every {@link yup.SchemaFieldDescription} variant). */
export type YupSchemaDescribeTest = { name?: string; message?: unknown; params?: unknown };

export function metaFromDescription(description: unknown): Record<string, unknown> {
  if (description === null || typeof description !== 'object' || !('meta' in description)) {
    return {};
  }
  const { meta } = description as { meta?: unknown };
  if (meta !== undefined && meta !== null && typeof meta === 'object' && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return {};
}

export function testsFromDescription(description: unknown): YupSchemaDescribeTest[] {
  if (
    description !== null &&
    typeof description === 'object' &&
    'tests' in description &&
    Array.isArray((description as { tests: unknown }).tests)
  ) {
    return (description as { tests: YupSchemaDescribeTest[] }).tests;
  }
  return [];
}

function hasFields(description: unknown): description is { fields: Record<string, unknown> } {
  return (
    description !== null &&
    typeof description === 'object' &&
    'fields' in description &&
    typeof (description as { fields?: unknown }).fields === 'object' &&
    (description as { fields: Record<string, unknown> }).fields !== null
  );
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

  let current: unknown = schema.describe(describeOptions);

  for (const segment of segments) {
    if (!hasFields(current)) {
      return undefined;
    }
    const { fields } = current;
    if (!(segment in fields)) {
      return undefined;
    }
    current = fields[segment];
  }

  return current as yup.SchemaFieldDescription;
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

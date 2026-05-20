import * as yup from 'yup';

/** Options forwarded to {@link yup.Schema.describe} (e.g. `value` when the field uses `.when()`). */
export type YupFieldDescribeOptions = NonNullable<Parameters<yup.AnySchema['describe']>[0]>;

/** {@link rosaCommonRequiredNonEmptyTest} / {@link rosaCommonRequiredNonEmptyIncludingAbsentTest} name. */
export const ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME = 'rosa-common-required-nonempty';

/** Set on Yup `.when()` `then` branches so {@link isYupFieldRequired} can show required UI without `.required()`. */
export const YUP_FIELD_REQUIRED_UI_META_KEY = 'fieldRequiredUi';

function metaFromDescription(description: unknown): Record<string, unknown> {
  if (description === null || typeof description !== 'object' || !('meta' in description)) {
    return {};
  }
  const { meta } = description as { meta?: unknown };
  if (meta !== undefined && meta !== null && typeof meta === 'object' && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return {};
}

/**
 * Whether Yup treats the value at `path` as non-optional (i.e. `undefined` is invalid),
 * matching the usual `.required()` / non-optional leaf schema behavior.
 *
 * Also treats fields with {@link ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME} or
 * {@link YUP_FIELD_REQUIRED_UI_META_KEY} as required for UI (conditional `.when()` branches
 * that use the shared non-empty test without `.required()`).
 *
 * Uses {@link yup.reach} + {@link yup.Schema.describe}. For conditional schemas, pass the
 * same shape of `value` you rely on at validation time so `describe` resolves `.when()` branches.
 */
function descriptionIsRequired(description: yup.SchemaFieldDescription): boolean {
  if ('optional' in description && description.optional === false) {
    return true;
  }
  if (metaFromDescription(description)[YUP_FIELD_REQUIRED_UI_META_KEY] === true) {
    return true;
  }
  if (
    'tests' in description &&
    Array.isArray(description.tests) &&
    description.tests.some((test) => test.name === ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME)
  ) {
    return true;
  }
  return false;
}

export function isYupFieldRequired(
  schema: yup.AnyObjectSchema,
  path: string,
  describeOptions?: YupFieldDescribeOptions
): boolean {
  const fieldSchema = yup.reach(schema, path);
  return descriptionIsRequired(fieldSchema.describe(describeOptions));
}

/**
 * Yup-derived required UI for `name` when `schema` is set; `undefined` when `schema` is omitted.
 * Pair with an explicit prop: `isRequiredProp ?? requiredFromYup(schema, name, yupDescribeOptions)`.
 */
export function requiredFromYup(
  schema: yup.AnyObjectSchema | undefined,
  name: string | number,
  describeOptions?: YupFieldDescribeOptions
): boolean | undefined {
  if (schema === undefined) {
    return undefined;
  }
  return isYupFieldRequired(schema, String(name), describeOptions);
}

import * as yup from 'yup';

/** Options forwarded to {@link yup.Schema.describe} (e.g. `value` when the field uses `.when()`). */
export type YupFieldDescribeOptions = NonNullable<Parameters<yup.AnySchema['describe']>[0]>;

/**
 * Whether Yup treats the value at `path` as non-optional (i.e. `undefined` is invalid),
 * matching the usual `.required()` / non-optional leaf schema behavior.
 *
 * Uses {@link yup.reach} + {@link yup.Schema.describe}. For conditional schemas, pass the
 * same shape of `value` you rely on at validation time so `describe` resolves `.when()` branches.
 */
function descriptionIsRequired(description: yup.SchemaFieldDescription): boolean {
  return 'optional' in description && description.optional === false;
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

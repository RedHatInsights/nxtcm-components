import * as yup from 'yup';

import {
  getYupFieldDescriptionAtPath,
  metaFromDescription,
  testsFromDescription,
  type YupFieldDescribeOptions,
} from './yupFieldDescribe';

export type { YupFieldDescribeOptions } from './yupFieldDescribe';

/** {@link rosaCommonRequiredNonEmptyTest} / {@link rosaCommonRequiredNonEmptyIncludingAbsentTest} name. */
export const ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME = 'rosa-common-required-nonempty';

/** Set on Yup `.when()` `then` branches so {@link isYupFieldRequired} can show required UI without `.required()`. */
export const YUP_FIELD_REQUIRED_UI_META_KEY = 'fieldRequiredUi';

/**
 * Whether Yup treats the value at `path` as non-optional (i.e. `undefined` is invalid),
 * matching the usual `.required()` / non-optional leaf schema behavior.
 *
 * Also treats fields with {@link ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME} or
 * {@link YUP_FIELD_REQUIRED_UI_META_KEY} as required for UI (conditional `.when()` branches
 * that use the shared non-empty test without `.required()`).
 *
 * Uses {@link getYupFieldDescriptionAtPath} so sibling `.when()` branches resolve.
 * Pass the same `value` shape you use at validation time in `describeOptions`.
 */
function descriptionIsRequired(description: yup.SchemaFieldDescription): boolean {
  if ('optional' in description && description.optional === false) {
    return true;
  }
  if (metaFromDescription(description)[YUP_FIELD_REQUIRED_UI_META_KEY] === true) {
    return true;
  }
  if (
    testsFromDescription(description).some(
      (test) => test.name === ROSA_COMMON_REQUIRED_NONEMPTY_TEST_NAME
    )
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
  return descriptionIsRequired(getYupFieldDescriptionAtPath(schema, path, describeOptions));
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

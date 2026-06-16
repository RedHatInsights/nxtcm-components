import { hasRefetchableStringValue } from '../utilities/hasRefetchableStringValue';

/** Normalizes select-backed form values (string id or `{ id }` object) for comparison. */
function normalizeSelectBackedFormValue(value: unknown): unknown {
  if (hasRefetchableStringValue(value)) {
    return value;
  }
  if (value != null && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'string' && id !== '') {
      return id;
    }
  }
  return value;
}

/**
 * Whether two wizard form field values are the same for meta-change detection.
 * Uses semantic equality for arrays and select-backed ids so reference churn on
 * dependents (e.g. `security_groups_worker`, `machine_pools_subnets`) does not
 * re-run source-field effects.
 */
export function wizardFormFieldValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  const leftNormalized = normalizeSelectBackedFormValue(left);
  const rightNormalized = normalizeSelectBackedFormValue(right);
  if (leftNormalized !== left || rightNormalized !== right) {
    return leftNormalized === rightNormalized;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => wizardFormFieldValuesEqual(item, right[index]))
    );
  }

  if (
    left != null &&
    right != null &&
    typeof left === 'object' &&
    typeof right === 'object' &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every((key) => wizardFormFieldValuesEqual(leftRecord[key], rightRecord[key]));
  }

  return false;
}

/**
 * Coerces `value` to a typed array. Returns `value` as `T[]` when it is an array,
 * otherwise returns an empty `T[]`.
 *
 * Used at react-hook-form boundaries where `field.value` is loosely typed (often `any`)
 * and must be narrowed before passing to a strongly-typed presentational component.
 *
 * The caller is responsible for ensuring the array contents match `T` at the
 * form-schema level (e.g. via Yup `array().of()`).
 */
export function coerceToArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    // Array.isArray narrows to any[]; the generic parameter is enforced by the
    // form schema, not by runtime inspection.
    return value as T[];
  }
  return [];
}

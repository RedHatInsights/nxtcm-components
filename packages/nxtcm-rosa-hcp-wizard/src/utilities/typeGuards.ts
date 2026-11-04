/** Narrows `value` so that `value[key]` is allowed without a cast. */
export function hasObjectProperty<K extends PropertyKey>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return value !== null && typeof value === 'object' && key in value;
}

/** Narrows dictionary-like runtime values; excludes arrays. */
export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Non-empty string suitable for resource refetch args and string-backed derived sync sources. */
export function hasRefetchableStringValue(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

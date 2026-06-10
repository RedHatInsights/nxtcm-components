/** Non-empty string suitable for resource refetch args and string-backed field checks. */
export function hasRefetchableStringValue(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

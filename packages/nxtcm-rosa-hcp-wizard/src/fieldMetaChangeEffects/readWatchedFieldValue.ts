/** Reads one field value from a react-hook-form `useWatch` result (scalar or parallel array). */
export function readWatchedFieldValue(watchedValues: unknown, fieldIndex: number): unknown {
  return Array.isArray(watchedValues) ? watchedValues[fieldIndex] : watchedValues;
}

/** Synthetic menu rows — must not commit as a real selection. */
export const SYNTHETIC_OPTION_IDS = new Set(['no-results', 'loading', 'empty']);

export function isSyntheticOptionId(optionId: string | undefined): boolean {
  return optionId != null && SYNTHETIC_OPTION_IDS.has(optionId);
}

export function getStatus(isError: boolean, isSuccess: boolean): 'danger' | 'success' | undefined {
  if (isError) return 'danger';
  if (isSuccess) return 'success';
  return undefined;
}

export function lowercaseFirst(label: string): string {
  return label ? label[0].toLowerCase() + label.substring(1) : label;
}

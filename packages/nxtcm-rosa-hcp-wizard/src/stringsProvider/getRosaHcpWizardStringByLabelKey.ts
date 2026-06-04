import get from 'get-value';

import type { RosaHcpWizardStrings } from './rosaHcpWizardStrings.types';

/**
 * Reads a string from {@link RosaHcpWizardStrings} using a Yup `.meta().labelKey` path
 * (e.g. `details.billingLabel` → `strings.details.billingLabel`).
 */
export function getRosaHcpWizardStringByLabelKey(
  strings: RosaHcpWizardStrings,
  labelKey: string
): string | undefined {
  const path = labelKey.split('.').filter(Boolean);
  if (path.length === 0) {
    return undefined;
  }
  const value = get(strings as object, path);
  return typeof value === 'string' ? value : undefined;
}

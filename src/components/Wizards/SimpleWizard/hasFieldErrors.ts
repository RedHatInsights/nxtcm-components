import type { FieldErrors } from 'react-hook-form';

/** True when react-hook-form `errors` contains at least one field-level `message`. */
export const hasFieldErrors = (errors: FieldErrors | undefined): boolean => {
  if (!errors || typeof errors !== 'object') {
    return false;
  }
  for (const value of Object.values(errors)) {
    if (value == null) {
      continue;
    }
    if (
      typeof value === 'object' &&
      'message' in value &&
      (value as { message?: unknown }).message != null &&
      (value as { message?: unknown }).message !== ''
    ) {
      return true;
    }
    if (typeof value === 'object' && hasFieldErrors(value as FieldErrors)) {
      return true;
    }
  }
  return false;
};

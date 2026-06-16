import type { ReactNode } from 'react';

/** Matches PatternFly `ValidatedOptions.error` | `ValidatedOptions.success` for form helpers. */
export type ValidatedErrorOrSuccess = 'error' | 'success';

export const helperTextId = ({
  id,
  errorMessage,
  helperText,
  isError,
  isSuccess,
  successMessage,
}: {
  id: string;
  errorMessage?: ReactNode | string;
  helperText?: ReactNode | string;
  isError?: boolean;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
}): string => {
  const isErrorAndErrorMessage = !!isError && !!errorMessage;
  const isSuccessAndSuccessMessage = !!isSuccess && !!successMessage;

  return isErrorAndErrorMessage || !!helperText || isSuccessAndSuccessMessage
    ? `${id}-helper-text`
    : '';
};

export const getValidated = (
  isError: boolean | undefined,
  isSuccess: boolean | undefined
): ValidatedErrorOrSuccess | undefined => {
  if (isError) {
    return 'error';
  }
  if (isSuccess) {
    return 'success';
  }
  return undefined;
};

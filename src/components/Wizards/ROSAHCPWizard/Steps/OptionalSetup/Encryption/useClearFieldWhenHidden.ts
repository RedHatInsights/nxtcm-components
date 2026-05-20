import { useEffect } from 'react';
import { type FieldPath, useFormContext, type FieldValues } from 'react-hook-form';

/**
 * Clears a conditionally shown field and its validation state when it is hidden
 * (e.g. Key ARN when custom KMS or etcd encryption is turned off).
 */
export function useClearFieldWhenHidden<TFieldValues extends FieldValues>(
  fieldName: FieldPath<TFieldValues>,
  isHidden: boolean
): void {
  const { setValue, clearErrors } = useFormContext<TFieldValues>();

  useEffect(() => {
    if (!isHidden) {
      return;
    }
    setValue(fieldName, undefined as never, { shouldValidate: true });
    clearErrors(fieldName);
  }, [clearErrors, fieldName, isHidden, setValue]);
}

import { useEffect, useRef } from 'react';
import { type FieldPath, useFormContext, type FieldValues } from 'react-hook-form';

/**
 * Clears a conditionally shown field and its validation state when it becomes hidden
 * (e.g. Key ARN when custom KMS or etcd encryption is turned off).
 * Skips the initial mount so remounting a step does not clear values that are still shown.
 */
export function useClearFieldWhenHidden<TFieldValues extends FieldValues>(
  fieldName: FieldPath<TFieldValues>,
  isHidden: boolean
): void {
  const { setValue, clearErrors } = useFormContext<TFieldValues>();
  const previousIsHiddenRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (previousIsHiddenRef.current === null) {
      previousIsHiddenRef.current = isHidden;
      return;
    }

    if (isHidden && !previousIsHiddenRef.current) {
      setValue(fieldName, undefined as never, { shouldValidate: true });
      clearErrors(fieldName);
    }

    previousIsHiddenRef.current = isHidden;
  }, [clearErrors, fieldName, isHidden, setValue]);
}

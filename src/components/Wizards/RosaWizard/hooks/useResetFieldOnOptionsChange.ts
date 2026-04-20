import React from 'react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';

type OptionWithValue = { value: string };

/**
 * Clears a field when its current value is no longer present in `options` (e.g. region list refresh).
 */
export function useResetFieldOnOptionsChange(
  path: FieldPath<RosaWizardFormData>,
  options: OptionWithValue[],
  _stepId?: string
) {
  const { setValue } = useFormContext<RosaWizardFormData>();
  const currentValue = useWatch({ name: path });

  React.useEffect(() => {
    if (currentValue && options.length > 0) {
      const isStillValid = options.some((o) => o.value === currentValue);
      if (!isStillValid) {
        setValue(path, undefined as never, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [options, currentValue, path, setValue]);
}

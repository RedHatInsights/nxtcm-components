import React from 'react';
import { useRosaForm } from '../RosaFormContext';
import { type DeepKeys } from '@tanstack/react-form';
import { type RosaWizardFormData } from '../../types';

type OptionWithValue = { value: string };

/**
 * Clears a form field when its current value is no longer present
 * in the provided options list.
 */
export function useResetFieldOnOptionsChange(
  path: DeepKeys<RosaWizardFormData>,
  options: OptionWithValue[]
): void {
  const form = useRosaForm();

  React.useEffect(() => {
    const currentValue = form.getFieldValue(path) as string | undefined;
    if (currentValue && options.length > 0) {
      const isStillValid = options.some((o) => o.value === currentValue);
      if (!isStillValid) {
        form.setFieldValue(path, undefined as never);
      }
    }
  }, [options, path, form]);
}

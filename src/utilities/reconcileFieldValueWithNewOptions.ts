import type { DropdownType } from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/types';

export type ReconcileFieldOption = Omit<DropdownType, 'value'> & {
  value: string | number;
};

export type ReconcileFieldValueWithNewOptionsParams = {
  currentValue: string | undefined | null;
  currentLabel?: string | undefined | null;
  newOptions: readonly ReconcileFieldOption[];
  defaultValue?: string;
};

export function reconcileFieldValueWithNewOptions(
  params: ReconcileFieldValueWithNewOptionsParams
): string {
  const { currentValue, currentLabel, newOptions, defaultValue = '' } = params;
  const value = currentValue ?? '';

  if (value === '') {
    return defaultValue;
  }

  const labelProvided = currentLabel != null && currentLabel !== '';

  const stillValid = newOptions.some((opt) => {
    if (String(opt.value) !== value) {
      return false;
    }
    if (labelProvided) {
      return opt.label === currentLabel;
    }
    return true;
  });

  return stillValid ? value : defaultValue;
}

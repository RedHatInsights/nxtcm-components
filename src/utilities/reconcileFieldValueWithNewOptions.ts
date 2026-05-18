import type { DropdownType } from '../components/Wizards/ROSAHCPWizard/types';

export function getFieldOptionIdentity(option: Pick<DropdownType, 'value'>): string {
  return option.value;
}

export type ReconcileFieldValueWithNewOptionsParams = {
  currentValue: string | undefined | null;
  currentLabel?: string | undefined | null;
  newOptions: readonly DropdownType[];
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
    if (getFieldOptionIdentity(opt) !== value) {
      return false;
    }
    if (labelProvided) {
      return opt.label === currentLabel;
    }
    return true;
  });

  return stillValid ? value : defaultValue;
}

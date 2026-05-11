export type FieldOptionLike =
  | { value: string; label?: string | null | undefined }
  | { key: string; label?: string | null | undefined };

export function getFieldOptionIdentity(option: FieldOptionLike): string {
  return 'value' in option ? option.value : option.key;
}

function optionLabel(option: FieldOptionLike): string | null | undefined {
  return option.label;
}

export type ReconcileFieldValueWithNewOptionsParams<TOption extends FieldOptionLike> = {
  currentValue: string | undefined | null;
  currentLabel?: string | undefined | null;
  newOptions: readonly TOption[];
  defaultValue?: string;
};

export function reconcileFieldValueWithNewOptions<TOption extends FieldOptionLike>(
  params: ReconcileFieldValueWithNewOptionsParams<TOption>
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
      return (optionLabel(opt) ?? '') === currentLabel;
    }
    return true;
  });

  return stillValid ? value : defaultValue;
}

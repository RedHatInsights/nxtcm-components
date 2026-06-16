import { getNestedValue } from '../../../utilities/helpers';
import { isSyntheticOptionId } from './selectFieldUtils';
import type { Option, OptionType } from './SelectTypes';

function isPrimitiveOption<T>(option: Option<T> | string | number): option is string | number {
  return typeof option === 'string' || typeof option === 'number';
}

/**
 * Stable string/number key for PF `Select` wiring when `value` may be a nested object.
 * Uses `keyPath` only for non-array object values.
 */
function keyedValueFromRawValue<T>(
  rawValue: string | number | T,
  keyPath: string
): string | number {
  const resolved =
    typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)
      ? getNestedValue(rawValue, keyPath)
      : rawValue;

  if (resolved === undefined || resolved === null) return '';
  if (typeof resolved === 'string' || typeof resolved === 'number') return resolved;
  return '';
}

function objectValuesMatchKeyPath(a: object, b: object, keyPath: string): boolean {
  const keyedA = getNestedValue(a, keyPath);
  const keyedB = getNestedValue(b, keyPath);
  return keyedA !== undefined && keyedA === keyedB;
}

/** Never yield `[object Object]`; always return a render-safe string. */
export function toDisplayString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (typeof o.label === 'string') return o.label;
    if (typeof o.value === 'string') return o.value;
    if (typeof o.value === 'number') return String(o.value);
  }
  return '';
}

export function normalizeOption<T>(
  option: Option<T> | string | number,
  keyPath: string
): OptionType<T> {
  if (isPrimitiveOption(option)) {
    const text = option.toString();
    return {
      id: text,
      label: text,
      value: option,
      keyedValue: option,
    };
  }

  return {
    id: option.id ?? option.label,
    label: option.label,
    value: option.value,
    keyedValue: keyedValueFromRawValue(option.value, keyPath),
    description: option.description,
    title: option.title,
    disabled: option.disabled,
    ariaDisabled: option.ariaDisabled,
    tooltipProps: option.tooltipProps,
  };
}

export function findOptionByValue<T>(
  flat: OptionType<T>[] | undefined,
  value: unknown,
  keyPath: string
): OptionType<T> | undefined {
  if (!flat || value === undefined || value === null || value === '') return undefined;

  return flat.find((o) => {
    if (o.value === value) return true;
    if (o.keyedValue === value || String(o.keyedValue) === String(value)) return true;

    const ov = o.value;
    if (typeof ov === 'object' && ov !== null && typeof value === 'object' && value !== null) {
      return objectValuesMatchKeyPath(ov as object, value, keyPath);
    }
    return false;
  });
}

export function optionContainsValue<T>(
  opt: OptionType<T>,
  selected: T[],
  keyPath: string
): boolean {
  return selected.some((v) => findOptionByValue([opt], v, keyPath) !== undefined);
}

export function toggleOptionInValues<T>(current: T[], opt: OptionType<T>, keyPath: string): T[] {
  if (optionContainsValue(opt, current, keyPath)) {
    return current.filter((v) => findOptionByValue([opt], v, keyPath) === undefined);
  }
  return [...current, opt.value as T];
}

export function findOptionByMenuId<T>(
  flatForLookup: OptionType<T>[],
  optionId: string
): OptionType<T> | undefined {
  return flatForLookup.find((o) => String(o.id) === optionId);
}

/**
 * Applies a PF menu selection id to a multiselect value array.
 * Returns `null` when the id is synthetic, missing, or does not match an option.
 */
export function toggleValuesFromPfSelectId<T>(
  current: T[],
  optionId: string | undefined,
  flatForLookup: OptionType<T>[],
  keyPath: string
): T[] | null {
  if (isSyntheticOptionId(optionId)) {
    return null;
  }
  if (optionId == null) {
    return null;
  }
  const opt = findOptionByMenuId(flatForLookup, optionId);
  if (!opt) {
    return null;
  }
  return toggleOptionInValues(current, opt, keyPath);
}

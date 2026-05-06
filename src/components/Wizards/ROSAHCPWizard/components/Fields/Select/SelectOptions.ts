import type { Option, OptionType } from './SelectTypes';

/** Dot-separated path lookup on plain objects (e.g. `metadata.name`). */
function getNestedValue(source: unknown, path: string): unknown {
  if (source == null || path === '') return undefined;
  let current: unknown = source;
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

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

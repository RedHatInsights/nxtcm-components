import type { TooltipProps } from '@patternfly/react-core';

export type Option<T> = {
  id?: string;
  label: string;
  description?: string;
  value: T;
  disabled?: boolean;
  ariaDisabled?: boolean;
  tooltipProps?: TooltipProps;
};

export type OptionType<T> = Omit<Option<T>, 'value'> & {
  value: string | number | T;
  keyedValue: string | number;
};

export interface OptionGroup<T> {
  id?: string;
  label: string;
  options: (Option<T> | string | number)[] | undefined;
}

export type NormalizedOptionGroup<T> = {
  label: string;
  options: OptionType<T>[];
};

/** PfSelect onSelect can pass an object; extract a stable option id/value. */
export function extractOptionValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const key of ['value', 'id', 'keyedValue'] as const) {
      const candidate = o[key];
      if (typeof candidate === 'string') return candidate;
      if (typeof candidate === 'number') return String(candidate);
    }
  }
  return undefined;
}

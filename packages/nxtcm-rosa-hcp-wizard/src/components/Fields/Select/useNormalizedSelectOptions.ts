import { useMemo } from 'react';
import type { NormalizedOptionGroup, Option, OptionGroup, OptionType } from './SelectTypes';
import { normalizeOption } from './SelectOptions';

export interface UseNormalizedSelectOptionsParams<T> {
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  keyPath: string;
}

export interface NormalizedSelectOptionsModel<T> {
  normalizedFlat: OptionType<T>[] | undefined;
  normalizedGroups: NormalizedOptionGroup<T>[] | undefined;
  flatForLookup: OptionType<T>[];
  hasGroups: boolean;
}

export function useNormalizedSelectOptions<T>(
  params: UseNormalizedSelectOptionsParams<T>
): NormalizedSelectOptionsModel<T> {
  const { options, optionGroups, keyPath } = params;

  const normalizedFlat = useMemo(() => {
    if (!options) return undefined;
    return options.map((o) => normalizeOption(o, keyPath));
  }, [options, keyPath]);

  const normalizedGroups = useMemo(() => {
    if (!optionGroups) return undefined;
    return optionGroups.map((g) => ({
      label: g.label,
      options: (g.options ?? []).map((o: Option<T> | string | number) =>
        normalizeOption(o, keyPath)
      ),
    }));
  }, [optionGroups, keyPath]);

  const flatForLookup = useMemo(() => {
    if (normalizedGroups?.length) {
      return normalizedGroups.flatMap((g) => g.options);
    }
    return normalizedFlat ?? [];
  }, [normalizedFlat, normalizedGroups]);

  const hasGroups = normalizedGroups != null && normalizedGroups.length > 0;

  return { normalizedFlat, normalizedGroups, flatForLookup, hasGroups };
}

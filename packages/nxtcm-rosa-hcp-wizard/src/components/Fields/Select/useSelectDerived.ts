import { useMemo } from 'react';
import type { NormalizedOptionGroup, Option, OptionGroup, OptionType } from './SelectTypes';
import { findOptionByValue, toDisplayString } from './SelectOptions';
import { useNormalizedSelectOptions } from './useNormalizedSelectOptions';

export interface UseSelectDerivedParams<T> {
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  keyPath: string;
  isTypeAhead: boolean;
  value: T | string | number | null | undefined;
  typeaheadQuery: string;
}

export interface SelectDerivedModel<T> {
  normalizedFlat: OptionType<T>[] | undefined;
  normalizedGroups: NormalizedOptionGroup<T>[] | undefined;
  flatForLookup: OptionType<T>[];
  selectedOption: OptionType<T> | undefined;
  hasGroups: boolean;
  displayedFlat: OptionType<T>[];
  displayedGroups: NormalizedOptionGroup<T>[];
}

export function useSelectDerived<T>(params: UseSelectDerivedParams<T>): SelectDerivedModel<T> {
  const { options, optionGroups, keyPath, isTypeAhead, value, typeaheadQuery } = params;

  const { normalizedFlat, normalizedGroups, flatForLookup, hasGroups } = useNormalizedSelectOptions(
    { options, optionGroups, keyPath }
  );

  const selectedOption = useMemo(
    () => findOptionByValue(flatForLookup.length ? flatForLookup : undefined, value, keyPath),
    [flatForLookup, value, keyPath]
  );

  const filterLower = typeaheadQuery.toLowerCase();

  const displayedFlat = useMemo(() => {
    if (!normalizedFlat) return [];
    if (!isTypeAhead) return normalizedFlat;
    return normalizedFlat.filter((o) =>
      toDisplayString(o.label).toLowerCase().includes(filterLower)
    );
  }, [normalizedFlat, isTypeAhead, filterLower]);

  const displayedGroups = useMemo(() => {
    if (!normalizedGroups) return [];
    if (!isTypeAhead) return normalizedGroups;
    return normalizedGroups.map((g) => ({
      ...g,
      options: g.options.filter((o: OptionType<T>) =>
        toDisplayString(o.label).toLowerCase().includes(filterLower)
      ),
    }));
  }, [normalizedGroups, isTypeAhead, filterLower]);

  return {
    normalizedFlat,
    normalizedGroups,
    flatForLookup,
    selectedOption,
    hasGroups,
    displayedFlat,
    displayedGroups,
  };
}

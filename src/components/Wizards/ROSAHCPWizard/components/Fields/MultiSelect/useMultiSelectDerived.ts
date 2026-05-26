import type { Option, OptionGroup } from '../Select/SelectTypes';
import {
  useNormalizedSelectOptions,
  type NormalizedSelectOptionsModel,
  type UseNormalizedSelectOptionsParams,
} from '../Select/useNormalizedSelectOptions';

export interface UseMultiSelectDerivedParams<T> {
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  keyPath: string;
}

export type MultiSelectDerivedModel<T> = NormalizedSelectOptionsModel<T>;

export function useMultiSelectDerived<T>(
  params: UseMultiSelectDerivedParams<T>
): MultiSelectDerivedModel<T> {
  const normalizedParams: UseNormalizedSelectOptionsParams<T> = params;
  return useNormalizedSelectOptions(normalizedParams);
}

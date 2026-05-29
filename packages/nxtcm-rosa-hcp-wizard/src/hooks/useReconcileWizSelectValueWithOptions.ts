import { useEffect, useRef } from 'react';
import type * as yup from 'yup';

import type { Option, OptionGroup } from '../components/Fields/Select/SelectTypes';
import {
  flattenWizSelectOptionsForReconcile,
  reconcileWizSelectFormValue,
} from './wizSelectOptionsReconcile';

export type UseReconcileWizSelectValueWithOptionsParams<T> = {
  name: string;
  schema?: yup.AnySchema;
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  keyPath?: string;
  isLoading?: boolean;
  enabled?: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
};

/**
 * When select options change (e.g. after a resource refetch), clears the field if the
 * current value is no longer present in the new option list.
 */
export function useReconcileWizSelectValueWithOptions<T>(
  params: UseReconcileWizSelectValueWithOptionsParams<T>
): void {
  const {
    name,
    schema,
    options,
    optionGroups,
    keyPath,
    isLoading,
    enabled = true,
    value,
    onChange,
  } = params;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (isLoading) {
      return;
    }
    if (options === undefined && optionGroups === undefined) {
      return;
    }

    const newOptions = flattenWizSelectOptionsForReconcile({ options, optionGroups, keyPath });
    const nextValue = reconcileWizSelectFormValue({
      currentValue: value,
      newOptions,
      schema,
      name,
      keyPath,
    });

    if (!Object.is(nextValue, value)) {
      onChangeRef.current(nextValue);
    }
  }, [enabled, isLoading, keyPath, name, optionGroups, options, schema, value]);
}

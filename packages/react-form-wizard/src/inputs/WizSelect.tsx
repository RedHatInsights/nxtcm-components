/* Copyright Contributors to the Open Cluster Management project */
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  InputGroup,
  InputGroupItem,
  MenuToggleElement,
  Select as PfSelect,
} from '@patternfly/react-core';
import get from 'get-value';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { InputCommonProps, getSelectPlaceholder, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { WizFormGroup } from './WizFormGroup';

import './Select.css';
import { RedoIcon } from '@patternfly/react-icons';

/** PfSelect onSelect can pass an object (e.g. option); calling .toString() on it yields "[object Object]". Extract the option id/value instead. */
/** Extract option value from whatever PatternFly Select passes to onSelect (string, number, or object with .value/.id/.keyedValue). Avoids [object Object] when PF passes an object. */
export function extractOptionValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const x = o.value ?? o.id ?? o.keyedValue;
    if (typeof x === 'string') return x;
    if (typeof x === 'number') return String(x);
  }
  return undefined;
}

export interface Option<T> {
  id?: string;
  label: string;
  description?: string;
  value: T;
  disabled?: boolean;
}

export type OptionType<T> = Omit<Option<T>, 'value'> & {
  value: string | number | T;
  keyedValue: string | number;
};

export interface OptionGroup<T> {
  id?: string;
  label: string;
  options: (Option<T> | string | number)[] | undefined;
}

type WizSelectCommonProps<T> = InputCommonProps<T> & {
  placeholder?: string;
  footer?: ReactNode;
  label: string;
  style?: T;

  /** key path is the path to get the key of the value
   * Used in cases where the value is an object, but we need to track select by a string or number
   */
  keyPath?: string;
  isCreatable?: boolean;
  onCreate?: (value: string) => void;
  callbackFunction?: (value: unknown) => void;
  isFill?: boolean;
  refreshCallback?: () => void;
  isPending?: boolean;
};

export type NormalizedOptionGroup<T> = {
  label: string;
  options: OptionType<T>[];
};

interface WizSelectSingleProps<T> extends WizSelectCommonProps<T> {
  variant: 'single';
  /** Flat list of options (use this or optionGroups, not both) */
  options?: (Option<T> | string | number)[];
  /** Grouped options for the versions dropdown (e.g. Stable, Preview). Use this or options, not both. */
  optionGroups?: OptionGroup<T>[];
}

export function WizSelect<T>(props: Omit<WizSelectSingleProps<T>, 'variant'>) {
  return <WizSelectBase<T> {...props} variant="single" />;
}

type SelectProps<T> = WizSelectSingleProps<T>;

function WizSelectBase<T = any>(props: SelectProps<T>) {
  const {
    displayMode: mode,
    value,
    setValue,
    validated,
    hidden,
    id,
    disabled,
    required,
  } = useInput(props);

  const placeholder = getSelectPlaceholder(props);
  const keyPath = props.keyPath ?? props.path;
  const isCreatable = props.isCreatable;
  const [open, setOpen] = useState(false);

  const [filteredOptions, setFilteredOptions] = useState<(string | OptionType<T>)[]>([]);
  const [filteredOptionGroups, setFilteredOptionGroups] = useState<NormalizedOptionGroup<T>[]>([]);
  // Local display value so selection shows immediately even if form context updates async
  const [localSelection, setLocalSelection] = useState<string | number | null>(null);

  function normalizeOption(option: Option<T> | string | number): OptionType<T> {
    let id: string;
    let label: string;
    let value: string | number | T;
    let keyedValue: string | number;
    let description: string | undefined;
    let disabled: boolean | undefined;
    if (typeof option === 'string' || typeof option === 'number') {
      id = option.toString();
      label = option.toString();
      value = option;
      keyedValue = option;
    } else {
      id = option.id ?? option.label;
      label = option.label;
      if (!keyPath) throw new Error('keyPath is required');
      value = option.value;
      description = option.description;
      disabled = option.disabled;
      keyedValue = get(value as any, keyPath);
      switch (typeof keyedValue) {
        case 'string':
        case 'number':
          break;
        default:
          throw new Error('keyedValue is not a string or number');
      }
    }
    return { id, label, value, keyedValue, description, disabled };
  }

  // The drop down items with descriptions - from flat options or flattened from optionGroups
  const selectOptions: OptionType<T>[] | undefined = useMemo(() => {
    if (props.optionGroups) {
      return props.optionGroups.flatMap((group) =>
        (group.options ?? []).map((opt) => normalizeOption(opt))
      );
    }
    return props.options?.map((opt) => normalizeOption(opt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options, props.optionGroups, keyPath]);

  const normalizedOptionGroups: NormalizedOptionGroup<T>[] | undefined = useMemo(() => {
    if (!props.optionGroups) return undefined;
    return props.optionGroups.map((group) => ({
      label: group.label,
      options: (group.options ?? []).map((opt) => normalizeOption(opt)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.optionGroups, keyPath]);

  const hasOptionGroups = normalizedOptionGroups != null && normalizedOptionGroups.length > 0;

  const displayValue = (() => {
    const val = value != null && value !== '' ? value : localSelection;
    if (val == null || val === '') return '';
    if (typeof val === 'string' || typeof val === 'number') {
      const option = selectOptions?.find(
        (o) => o.keyedValue === val || o.value === val || String(o.keyedValue) === String(val)
      );
      const label = option?.label;
      return typeof label === 'string'
        ? label
        : typeof option?.value === 'string' || typeof option?.value === 'number'
        ? String(option.value)
        : String(val);
    }
    if (typeof val === 'object') {
      const o = val as Record<string, unknown>;
      if (typeof o.label === 'string') return o.label;
      if (typeof o.value === 'string' || typeof o.value === 'number') return String(o.value);
      return '';
    }
    return '';
  })();

  useEffect(() => {
    if (normalizedOptionGroups) setFilteredOptionGroups(normalizedOptionGroups);
  }, [normalizedOptionGroups]);

  // Sync local display from form: when form value is set, show it; when it is cleared (e.g. by clear button, Delete, or parent), clear local display
  useEffect(() => {
    if (value != null && value !== '') {
      setLocalSelection(value as string | number);
    } else {
      setLocalSelection(null);
    }
  }, [value]);

  const onSelect = useCallback(
    (selectOptionObject: string | undefined) => {
      const idOption = selectOptions?.find((o) => o.id === selectOptionObject);
      if (idOption) {
        setLocalSelection(idOption.keyedValue);
        props.callbackFunction?.(idOption.value);
        setValue(idOption.value);
      } else {
        setLocalSelection(selectOptionObject ?? null);
        setValue(selectOptionObject);
      }
      setOpen(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, selectOptions]
  );

  if (hidden) return null;

  if (mode === DisplayMode.Details) {
    if (!value) return null;
    return (
      <DescriptionListGroup>
        <DescriptionListTerm>{props.label}</DescriptionListTerm>
        <DescriptionListDescription id={id}>{value}</DescriptionListDescription>
      </DescriptionListGroup>
    );
  }

  return (
    <div id={id}>
      <WizFormGroup {...props}>
        <InputGroup>
          <InputGroupItem isFill={props.isFill}>
            <PfSelect
              onOpenChange={(isOpen) => {
                !isOpen && setOpen(false);
              }}
              isOpen={open}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <InputSelect
                  required={required}
                  disabled={disabled}
                  validated={validated}
                  placeholder={placeholder}
                  options={selectOptions ?? []}
                  setOptions={setFilteredOptions}
                  optionGroups={hasOptionGroups ? normalizedOptionGroups : undefined}
                  setFilteredOptionGroups={hasOptionGroups ? setFilteredOptionGroups : undefined}
                  toggleRef={toggleRef}
                  value={displayValue}
                  onSelect={onSelect}
                  open={open}
                  setOpen={setOpen}
                  isPending={props.isPending}
                />
              )}
              selected={displayValue}
              onSelect={(_event, val) => onSelect(extractOptionValue(val) ?? '')}
            >
              <SelectListOptions
                value={displayValue}
                options={filteredOptions}
                optionGroups={hasOptionGroups ? filteredOptionGroups : undefined}
                isCreatable={isCreatable}
                onCreate={props.onCreate}
                footer={props.footer}
                isMultiSelect={false}
                isPending={props.isPending}
              />
            </PfSelect>
          </InputGroupItem>
          {props.refreshCallback && (
            <InputGroupItem>
              <Button
                variant="control"
                aria-label="Refresh"
                onClick={props.refreshCallback}
                icon={<RedoIcon />}
                isDisabled={props.isPending}
              />
            </InputGroupItem>
          )}
        </InputGroup>
      </WizFormGroup>
    </div>
  );
}

/* Copyright Contributors to the Open Cluster Management project */
import {
  Button,
  Divider,
  Label,
  LabelGroup,
  MenuFooter,
  MenuToggle,
  MenuToggleElement,
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { FormEvent, Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useStringContext } from '../contexts/StringContext';
import { Option, OptionType } from './WizSelect';
import type { NormalizedOptionGroup } from './WizSelect';

/** Never return [object Object]; always a string safe for display. */
function toDisplayString(v: unknown): string {
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

type InputSelectProps<T> = {
  disabled?: boolean;
  validated?: 'error';
  options: (OptionType<T> | string)[];
  setOptions: (options: (OptionType<T> | string)[]) => void;
  optionGroups?: NormalizedOptionGroup<T>[];
  setFilteredOptionGroups?: (groups: NormalizedOptionGroup<T>[]) => void;
  placeholder: string;
  value: string;
  onSelect: (value: string | undefined) => void;
  toggleRef: React.Ref<MenuToggleElement>;
  open: boolean;
  setOpen: (open: boolean) => void;
  required?: boolean;
  /** When true and no value selected, toggle shows "Loading..." instead of placeholder */
  isPending?: boolean;
};

export function InputSelect<T>({
  disabled,
  validated,
  options,
  setOptions,
  optionGroups,
  setFilteredOptionGroups,
  placeholder,
  value,
  onSelect,
  toggleRef,
  open,
  setOpen,
  isPending,
}: InputSelectProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);
  const onInputClick = useCallback(() => setOpen(!open), [open, setOpen]);

  useEffect(
    () =>
      setOptions([
        ...options.filter((option) =>
          typeof option === 'string' || typeof option === 'number'
            ? option.toString().toLowerCase().includes(inputValue.toLowerCase())
            : (option as Option<T>).label
                .toString()
                .toLowerCase()
                .includes(inputValue.toLowerCase())
        ),
        inputValue,
      ] as OptionType<T>[]),
    [inputValue, options, setOptions]
  );

  useEffect(() => {
    if (optionGroups && setFilteredOptionGroups) {
      const lower = inputValue.toLowerCase();
      setFilteredOptionGroups(
        optionGroups.map((group) => ({
          label: group.label,
          options: group.options.filter((opt) =>
            opt.label.toString().toLowerCase().includes(lower)
          ),
        }))
      );
    }
  }, [inputValue, optionGroups, setFilteredOptionGroups]);

  const onClear = useCallback(() => {
    onSelect(undefined);
    setInputValue('');
    textInputRef?.current?.focus();
  }, [onSelect]);

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!disabled) {
        if (!Array.isArray(value)) {
          onSelect('');
        }
        setOpen(true);
        switch (event.key) {
          case 'Backspace':
            !Array.isArray(value) && onSelect('');
            break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelect, open, setOpen, value]
  );

  const onTextInputChange = useCallback((_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
  }, []);

  const valueString = useCallback(() => {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return toDisplayString(value);
    }
    const isSimpleOption = options.every(
      (option) => typeof option === 'string' || typeof option === 'number'
    );
    if (isSimpleOption) {
      return toDisplayString(value);
    }
    const option = options.find(
      (opt) => (opt as OptionType<T>).value === value || (opt as OptionType<T>).keyedValue === value
    ) as OptionType<T> | undefined;
    return toDisplayString(option?.label ?? option?.value ?? value);
  }, [options, value]);

  const rawDisplay = !Array.isArray(value) ? valueString() || inputValue : inputValue;
  const displayText = toDisplayString(rawDisplay);
  const toggleDisplayText = isPending && !displayText ? 'Loading...' : displayText;

  // When parent passes a selected value, sync our internal inputValue so it persists (typing persists because it uses inputValue; selection didn't because we never set inputValue)
  useEffect(() => {
    if (Array.isArray(value)) return;
    if (value != null && value !== '') {
      let toShow: string;
      if (typeof value === 'object') {
        toShow = toDisplayString(value);
      } else {
        const isSimple = options.every((o) => typeof o === 'string' || typeof o === 'number');
        const option = isSimple
          ? null
          : (options.find(
              (opt) =>
                (opt as OptionType<T>).value === value ||
                (opt as OptionType<T>).keyedValue === value
            ) as OptionType<T> | undefined);
        toShow = toDisplayString(option?.label ?? option?.value ?? value);
      }
      setInputValue(toShow);
    }
  }, [value, options]);

  // Force the actual input to show the selected value (run after menu close so PF doesn't overwrite it)
  useEffect(() => {
    const node = textInputRef?.current;
    const input =
      node && typeof node.querySelector === 'function'
        ? (node as HTMLElement).querySelector('input')
        : node;
    if (input && typeof input.value !== 'undefined') {
      const el = input;
      const target = toggleDisplayText ?? '';
      if (el.value !== target) {
        const set = () => {
          el.value = target;
        };
        requestAnimationFrame(set);
      }
    }
  }, [toggleDisplayText]);

  return (
    <MenuToggle
      variant="typeahead"
      ref={toggleRef}
      onClick={() => setOpen(!open)}
      isExpanded={open}
      isDisabled={disabled}
      isFullWidth
      status={validated === 'error' ? 'danger' : undefined}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={toggleDisplayText}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          innerRef={textInputRef}
          placeholder={isPending ? undefined : placeholder}
          isExpanded={open}
          autoComplete="off"
          aria-label={placeholder}
          role="combobox"
          aria-controls="select-typeahead-listbox"
        >
          {Array.isArray(value) && (
            <LabelGroup style={{ marginTop: -8, marginBottom: -8 }} numLabels={9999}>
              {value.map((selection) => (
                <Label readOnly key={selection}>
                  {selection}
                </Label>
              ))}
            </LabelGroup>
          )}
        </TextInputGroupMain>

        <TextInputGroupUtilities
          {...(Array.isArray(value)
            ? value.length === 0
              ? { style: { display: 'none' } }
              : {}
            : !displayText
              ? { style: { display: 'none' } }
              : {})}
        >
          <Button
            variant="plain"
            onClick={onClear}
            aria-label="Clear input value"
            icon={<TimesIcon aria-hidden />}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
}

type SelectListOptionsProps<T = any> = {
  value: string;
  options: (string | OptionType<T>)[];
  optionGroups?: NormalizedOptionGroup<T>[];
  footer?: ReactNode;
  isCreatable?: boolean;
  onCreate?: (value: string) => void;
  isMultiSelect?: boolean;
  isPending?: boolean;
};

function renderSelectOption<T>(
  option: string | OptionType<T>,
  index: number,
  value: string,
  options: (string | OptionType<T>)[],
  isCreatable: boolean | undefined,
  onCreate: ((value: string) => void) | undefined,
  noResults: string,
  createOption: string
) {
  const isLastItem = index === options.length - 1;
  const isSingleItem = options.length === 1;
  const isSimpleOption = typeof option === 'string';
  const valueString = toDisplayString(isSimpleOption ? option : option.value);
  const isCreateOption = isSingleItem && isCreatable && value !== valueString;
  const shouldSkipLastItem =
    isLastItem && (!isSingleItem || (isCreatable && value === valueString));

  if (shouldSkipLastItem) {
    return null;
  }

  let displayText: string;
  if (isCreateOption) {
    displayText = `${createOption} "${valueString}"`;
  } else if (isSingleItem) {
    displayText = noResults;
  } else if (isSimpleOption) {
    displayText = option;
  } else {
    displayText = toDisplayString(option.label) || toDisplayString(option.value);
  }

  const opt = option as OptionType<T>;
  const isAriaDisabled = !isSimpleOption && Boolean(opt.ariaDisabled);
  const isDisabled =
    displayText === noResults || (!isSimpleOption && Boolean(opt.disabled) && !isAriaDisabled);
  const optionValue = isSimpleOption ? option : opt.id;

  return (
    <SelectOption
      id={isSimpleOption ? option : opt.id || `option-${index}`}
      key={isSimpleOption ? option : opt.id || `option-${index}`}
      value={optionValue}
      description={!isSimpleOption && !isAriaDisabled ? opt.description : undefined}
      isDisabled={isDisabled}
      isAriaDisabled={isAriaDisabled}
      tooltipProps={isAriaDisabled ? opt.tooltipProps : undefined}
      onClick={
        isCreateOption
          ? () => onCreate?.(toDisplayString(isSimpleOption ? option : opt.value))
          : undefined
      }
      isSelected={
        !isDisabled &&
        !isAriaDisabled &&
        !isCreateOption &&
        (Array.isArray(value) ? value.includes(optionValue) : optionValue === value)
      }
    >
      {displayText}
    </SelectOption>
  );
}

export const SelectListOptions = ({
  value,
  options,
  optionGroups,
  isCreatable,
  onCreate,
  footer,
  isMultiSelect,
  isPending,
}: SelectListOptionsProps) => {
  const { noResults, createOption } = useStringContext();

  if (isPending) {
    return (
      <SelectList>
        <SelectOption id="loading" isDisabled key="loading">
          <span
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-global--spacer--sm)' }}
          >
            <Spinner size="sm" />
            Loading...
          </span>
        </SelectOption>
      </SelectList>
    );
  }

  if (optionGroups && optionGroups.length > 0) {
    const groupsToRender = optionGroups.filter((g) => g.options.length > 0);
    return (
      <SelectList isAriaMultiselectable={isMultiSelect}>
        {groupsToRender.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <Divider />}
            <SelectGroup label={group.label}>
              {group.options.map((option, optIndex) => {
                const optionValue = option.id;
                const isAriaDisabled = Boolean(option.ariaDisabled);
                return (
                  <SelectOption
                    id={option.id || `option-${optIndex}`}
                    key={option.id || `option-${optIndex}`}
                    value={optionValue}
                    description={
                      !isAriaDisabled && typeof option.description === 'string'
                        ? option.description
                        : undefined
                    }
                    isDisabled={Boolean(option.disabled) && !isAriaDisabled}
                    isAriaDisabled={isAriaDisabled}
                    tooltipProps={isAriaDisabled ? option.tooltipProps : undefined}
                    isSelected={optionValue === value && !isAriaDisabled}
                  >
                    {toDisplayString(option.label) || toDisplayString(option.value)}
                  </SelectOption>
                );
              })}
            </SelectGroup>
          </Fragment>
        ))}
        {footer && <MenuFooter>{footer}</MenuFooter>}
      </SelectList>
    );
  }

  return (
    <SelectList isAriaMultiselectable={isMultiSelect}>
      {options.map((option, index) =>
        renderSelectOption(
          option,
          index,
          value,
          options,
          isCreatable,
          onCreate,
          noResults,
          createOption
        )
      )}
      {footer && <MenuFooter>{footer}</MenuFooter>}
    </SelectList>
  );
};

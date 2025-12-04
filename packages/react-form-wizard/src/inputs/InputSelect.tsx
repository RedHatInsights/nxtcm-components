/* Copyright Contributors to the Open Cluster Management project */
import {
  Button,
  Label,
  LabelGroup,
  MenuFooter,
  MenuToggle,
  MenuToggleElement,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useStringContext } from '../contexts/StringContext';
import { Option, OptionType } from './WizSelect';

type InputSelectProps<T> = {
  disabled?: boolean;
  validated?: 'error';
  options: (OptionType<T> | string)[];
  setOptions: (options: (OptionType<T> | string)[]) => void;
  placeholder: string;
  value: string;
  onSelect: (value: string | undefined) => void;
  toggleRef: React.Ref<MenuToggleElement>;
  open: boolean;
  setOpen: (open: boolean) => void;
  required?: boolean;
};

export function InputSelect<T>({
  required,
  disabled,
  validated,
  options,
  setOptions,
  placeholder,
  value,
  onSelect,
  toggleRef,
  open,
  setOpen,
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
    [onSelect, open, setOpen, value]
  );

  const onTextInputChange = useCallback((_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
  }, []);

  const valueString = useCallback(() => {
    //can you add a check to see if the options array is a string or number?
    const isSimpleOption = options.every(
      (option) => typeof option === 'string' || typeof option === 'number'
    );
    if (isSimpleOption) {
      return value;
    } else {
      return (
        (options.find((option) => (option as OptionType<T>).value === value) as OptionType<T>)
          ?.label ?? ''.toString()
      );
    }
  }, [options, value]);

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
          value={!Array.isArray(value) ? valueString() || inputValue : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          innerRef={textInputRef}
          placeholder={placeholder}
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
          {...((!inputValue && !value) || required ? { style: { display: 'none' } } : {})}
        >
          <Button variant="plain" onClick={onClear}>
            <TimesIcon aria-hidden />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
}

type SelectListOptionsProps<T = any> = {
  value: string;
  options: (string | OptionType<T>)[];
  footer?: ReactNode;
  isCreatable?: boolean;
  onCreate?: (value: string) => void;
  isMultiSelect?: boolean;
};

export const SelectListOptions = ({
  value,
  options,
  isCreatable,
  onCreate,
  footer,
  isMultiSelect,
}: SelectListOptionsProps) => {
  const { noResults, createOption } = useStringContext();
  return (
    <SelectList isAriaMultiselectable={isMultiSelect}>
      {options.map((option, index) => {
        const isLastItem = index === options.length - 1;
        const isSingleItem = options.length === 1;
        const isSimpleOption = typeof option === 'string';
        const valueString = String(isSimpleOption ? option : option.value);
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
          displayText = option.label;
        }

        const isDisabled = displayText === noResults || (!isSimpleOption && option.disabled);
        const optionValue = !isSimpleOption ? option.id : option;

        return (
          <SelectOption
            id={isSimpleOption ? option : option.id || `option-${index}`}
            key={isSimpleOption ? option : option.id || `option-${index}`}
            value={optionValue}
            description={!isSimpleOption ? option.description : undefined}
            isDisabled={isDisabled}
            onClick={
              isCreateOption ? () => onCreate?.(!isSimpleOption ? option.value : option) : undefined
            }
            isSelected={
              !isDisabled && !isCreateOption && Array.isArray(value)
                ? value.includes(optionValue)
                : optionValue === value
            }
          >
            {displayText}
          </SelectOption>
        );
      })}
      {footer && <MenuFooter>{footer}</MenuFooter>}
    </SelectList>
  );
};

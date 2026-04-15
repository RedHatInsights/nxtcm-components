import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { type FormFieldProps, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

/** A single option in the select dropdown */
export interface SelectOptionItem {
  /** Unique value for this option */
  value: string;
  /** Display label — falls back to value if not provided */
  label?: string;
  /** Optional description rendered below the label */
  description?: string;
  /** Whether the option is disabled */
  isDisabled?: boolean;
  /** Tooltip shown on disabled options to explain why they are unavailable */
  tooltip?: string;
}

/** A group of options rendered under a visual heading in the dropdown */
export interface SelectOptionGroup {
  /** Group heading label */
  label: string;
  /** Options within this group */
  options: SelectOptionItem[];
}

export interface FormSelectProps extends FormFieldProps {
  /** Placeholder text shown when no value is selected */
  placeholder?: string;
  /** List of options to render in the dropdown (ignored when optionGroups is provided) */
  options?: SelectOptionItem[];
  /** Grouped options with visual headings — takes precedence over flat options */
  optionGroups?: SelectOptionGroup[];
  /** Optional callback fired alongside TanStack field change */
  onSelectionChange?: (value: string) => void;
  /** When provided, a refresh button appears beside the dropdown */
  onRefresh?: () => void;
  /** Shows a loading spinner on the dropdown toggle */
  isPending?: boolean;
  /** Tooltip text for the refresh button */
  refreshTooltip?: string;
}

/**
 * PatternFly Select (single-select) wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="region">
 *   {(field) => (
 *     <FormSelect
 *       field={field}
 *       label="Region"
 *       isRequired
 *       options={[
 *         { value: 'us-east-1', label: 'US East' },
 *         { value: 'eu-west-1', label: 'EU West' },
 *       ]}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormSelect(props: FormSelectProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    placeholder = 'Select an option',
    options = [],
    optionGroups,
    onSelectionChange,
    onRefresh,
    isPending,
    refreshTooltip = 'Refresh',
    id,
  } = props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);
  const [isOpen, setIsOpen] = useState(false);

  const flatOptions = useMemo(
    (): SelectOptionItem[] => (optionGroups ? optionGroups.flatMap((g) => g.options) : options),
    [optionGroups, options]
  );

  const optionMap = useMemo(() => new Map(flatOptions.map((o) => [o.value, o])), [flatOptions]);

  const selectedLabel = useMemo((): string => {
    const value = field.state.value as string | undefined;
    if (!value) return '';
    const opt = optionMap.get(value);
    return opt?.label ?? value;
  }, [field.state.value, optionMap]);

  const handleSelect = useCallback(
    (_event: React.MouseEvent | undefined, value: string | number | undefined): void => {
      const stringValue = value != null ? String(value) : '';
      field.handleChange(stringValue);
      onSelectionChange?.(stringValue);
      setIsOpen(false);
    },
    [field, onSelectionChange]
  );

  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleContent = isPending ? (
    <span>
      <Spinner size="sm" /> {selectedLabel || placeholder}
    </span>
  ) : (
    selectedLabel || placeholder
  );

  const toggle = useCallback(
    (toggleRef: React.Ref<MenuToggleElement>): JSX.Element => (
      <MenuToggle
        ref={toggleRef}
        onClick={handleToggle}
        isExpanded={isOpen}
        isFullWidth
        isDisabled={isDisabled || isPending}
        status={validated === 'error' ? 'danger' : undefined}
      >
        {toggleContent}
      </MenuToggle>
    ),
    [handleToggle, isOpen, isDisabled, isPending, validated, toggleContent]
  );

  const renderOption = useCallback((option: SelectOptionItem): JSX.Element => {
    const optionEl = (
      <SelectOption
        key={option.value}
        value={option.value}
        description={option.description}
        isDisabled={option.isDisabled}
      >
        {option.label ?? option.value}
      </SelectOption>
    );
    return option.tooltip && option.isDisabled ? (
      <Tooltip key={option.value} content={option.tooltip}>
        <span>{optionEl}</span>
      </Tooltip>
    ) : (
      optionEl
    );
  }, []);

  const selectEl = (
    <PfSelect
      id={fieldId}
      isOpen={isOpen}
      selected={field.state.value as string}
      onSelect={handleSelect}
      onOpenChange={setIsOpen}
      toggle={toggle}
    >
      {optionGroups ? (
        <>
          {optionGroups.map((group) => (
            <SelectGroup key={group.label} label={group.label}>
              <SelectList>{group.options.map(renderOption)}</SelectList>
            </SelectGroup>
          ))}
        </>
      ) : (
        <SelectList>{options.map(renderOption)}</SelectList>
      )}
    </PfSelect>
  );

  return (
    <FieldGroup
      field={field}
      label={label}
      isRequired={isRequired}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      helperText={helperText}
      id={fieldId}
    >
      {onRefresh ? (
        <InputGroup>
          <InputGroupItem isFill>{selectEl}</InputGroupItem>
          <InputGroupItem>
            <Tooltip content={refreshTooltip}>
              <Button
                variant="control"
                aria-label={refreshTooltip}
                onClick={onRefresh}
                isDisabled={isPending}
              >
                {isPending ? <Spinner size="sm" /> : <SyncAltIcon />}
              </Button>
            </Tooltip>
          </InputGroupItem>
        </InputGroup>
      ) : (
        selectEl
      )}
    </FieldGroup>
  );
}

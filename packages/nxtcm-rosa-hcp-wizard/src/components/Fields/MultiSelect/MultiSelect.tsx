import {
  type FocusEventHandler,
  Fragment,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Badge,
  Button,
  Divider,
  Flex,
  FormGroup,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons';
import { HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';
import {
  findOptionByValue,
  optionContainsValue,
  toDisplayString,
  toggleValuesFromPfSelectId,
} from '../Select/SelectOptions';
import { getStatus, lowercaseFirst } from '../Select/selectFieldUtils';
import {
  extractOptionValue,
  type Option,
  type OptionGroup,
  type OptionType,
} from '../Select/SelectTypes';
import { useMultiSelectDerived } from './useMultiSelectDerived';

/** Stable fallback when `value` is null/undefined so hook deps stay referentially stable. */
const EMPTY_MULTISELECT_VALUE: never[] = [];

export interface MultiSelectProps<T = unknown> {
  /** Stable field id (toggle and listbox wiring). */
  id: string;
  /** When set, wraps the control in a {@link FormGroup} with this label. */
  label?: string;
  placeholder?: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  helperText?: ReactNode;
  errorMessage?: ReactNode | string;
  isError?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /**
   * Selected values (one entry per chosen option; matches each option’s `value` / `keyPath` keying).
   */
  value: T[] | null | undefined;
  /** Called when the user toggles options in the menu. */
  onChange: (next: T[]) => void;
  /** Fires when the menu toggle loses focus (e.g. react-hook-form `field.onBlur`). */
  onBlur?: FocusEventHandler<HTMLElement>;
  /** Use `keyPath` when option values are objects and selection is compared via a nested field. */
  keyPath?: string;
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  isFill?: boolean;
  /** Invoked when the refresh control is pressed. */
  onRefresh?: () => void;
  isLoading?: boolean;
  /** Copy for the empty menu state. */
  noResultsText?: string;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
  /** Fires when the dropdown menu opens or closes (after internal `open` updates). */
  onMenuOpenChange?: (isOpen: boolean) => void;
  /** Optional max height for the dropdown list. */
  maxMenuHeight?: string;
  'data-testid'?: string;
  /**
   * When `true` (default), follows PatternFly checkbox select: toggle shows {@link placeholderText} plus a count {@link Badge}.
   * When `false`, one selection shows its label; multiple show "N selected".
   */
  checkboxMenuToggle?: boolean;
  /** Passed to the count badge for screen readers (checkbox menu toggle). */
  badgeScreenReaderText?: string;
  /** Optional accessible name for the menu toggle (e.g. when using checkbox + badge layout). */
  menuToggleAriaLabel?: string;
}

export function MultiSelect<T = unknown>(props: MultiSelectProps<T>) {
  const {
    id,
    label,
    placeholder,
    labelHelp,
    labelHelpTitle,
    helperText,
    errorMessage,
    isError,
    isRequired,
    isDisabled,
    value: valueProp,
    onChange,
    onBlur,
    keyPath = 'value',
    options,
    optionGroups,
    isFill = true,
    onRefresh,
    isLoading,
    noResultsText = 'No results found',
    isSuccess,
    successMessage,
    onMenuOpenChange,
    maxMenuHeight,
    'data-testid': dataTestId,
    checkboxMenuToggle = true,
    badgeScreenReaderText,
    menuToggleAriaLabel,
  } = props;

  const disabled = isDisabled;

  if (optionGroups && options) {
    throw new Error('MultiSelect: use either `options` or `optionGroups`, not both.');
  }

  const value = useMemo(
    () => (valueProp != null ? valueProp : (EMPTY_MULTISELECT_VALUE as T[])),
    [valueProp]
  );

  const { normalizedFlat, normalizedGroups, flatForLookup, hasGroups } = useMultiSelectDerived<T>({
    options,
    optionGroups,
    keyPath,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  const selectedMenuIds = useMemo(() => {
    const ids: string[] = [];
    for (const v of value) {
      const opt = findOptionByValue(flatForLookup, v, keyPath);
      if (opt?.id != null && opt.id !== '') {
        ids.push(String(opt.id));
      }
    }
    return ids;
  }, [value, flatForLookup, keyPath]);

  const placeholderText =
    placeholder ?? (label?.length ? `Select the ${lowercaseFirst(label)}` : 'Select options');

  const legacyToggleLabel = useMemo(() => {
    if (value.length === 0) {
      return '';
    }
    if (value.length === 1) {
      const opt = findOptionByValue(flatForLookup, value[0], keyPath);
      return opt ? toDisplayString(opt.label) || toDisplayString(opt.value) : '';
    }
    return `${value.length} selected`;
  }, [value, flatForLookup, keyPath]);

  const showCountBadge = checkboxMenuToggle && value.length > 0;

  const toggleMainText = useMemo(() => {
    if (isLoading && value.length === 0) {
      return 'Loading...';
    }
    if (checkboxMenuToggle) {
      return placeholderText;
    }
    return legacyToggleLabel || placeholderText;
  }, [isLoading, value.length, checkboxMenuToggle, placeholderText, legacyToggleLabel]);

  const toggleBadge = showCountBadge ? (
    <Badge screenReaderText={badgeScreenReaderText}>{value.length}</Badge>
  ) : undefined;

  const handleToggle = useCallback(() => setOpen((o) => !o), []);

  const onPfSelect = useCallback(
    (_event: MouseEvent<Element> | undefined, val: unknown) => {
      const next = toggleValuesFromPfSelectId(
        value,
        extractOptionValue(val),
        flatForLookup,
        keyPath
      );
      if (next != null) {
        onChange(next);
      }
    },
    [flatForLookup, value, keyPath, onChange]
  );

  const renderSelectOptionRow = (opt: OptionType<T>, optId: string) => {
    const isAriaDisabled = Boolean(opt.ariaDisabled);
    const rowSelected = optionContainsValue(opt, value, keyPath);
    return (
      <SelectOption
        id={optId}
        key={optId}
        value={optId}
        title={typeof opt.title === 'string' && opt.title ? opt.title : undefined}
        description={
          !isAriaDisabled && typeof opt.description === 'string' ? opt.description : undefined
        }
        isDisabled={Boolean(opt.disabled) && !isAriaDisabled}
        isAriaDisabled={isAriaDisabled}
        tooltipProps={isAriaDisabled ? opt.tooltipProps : undefined}
        hasCheckbox
        isSelected={rowSelected && !isAriaDisabled}
      >
        {toDisplayString(opt.label) || toDisplayString(opt.value)}
      </SelectOption>
    );
  };

  const renderMenuBody = () => {
    if (isLoading) {
      return (
        <SelectList id={`${id}-listbox`}>
          <SelectOption id={`${id}-loading`} isDisabled value="loading">
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <Spinner size="sm" />
              Loading...
            </Flex>
          </SelectOption>
        </SelectList>
      );
    }

    if (hasGroups) {
      const groups = normalizedGroups ?? [];
      const toRender = groups.filter((g) => g.options.length > 0);
      if (toRender.length === 0) {
        return (
          <SelectList id={`${id}-listbox`}>
            <SelectOption id={`${id}-no-results`} isAriaDisabled value="no-results">
              {noResultsText}
            </SelectOption>
          </SelectList>
        );
      }
      return (
        <SelectList id={`${id}-listbox`}>
          {toRender.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 ? <Divider /> : null}
              <SelectGroup label={group.label}>
                {group.options.map((opt: OptionType<T>, optIdx: number) =>
                  renderSelectOptionRow(opt, opt.id || `option-${group.label}-${optIdx}`)
                )}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectList>
      );
    }

    const flatOpts = normalizedFlat ?? [];
    if (flatOpts.length === 0) {
      return (
        <SelectList id={`${id}-listbox`}>
          <SelectOption id={`${id}-empty`} isAriaDisabled value="empty">
            {noResultsText}
          </SelectOption>
        </SelectList>
      );
    }

    return (
      <SelectList id={`${id}-listbox`}>
        {flatOpts.map((opt, idx) => renderSelectOptionRow(opt, opt.id || `opt-${idx}`))}
      </SelectList>
    );
  };

  const describedBy = helperTextId({
    id,
    errorMessage,
    helperText,
    isError,
    isSuccess,
    successMessage,
  });

  const plainToggleAriaLabel = useMemo(() => {
    if (menuToggleAriaLabel) {
      return menuToggleAriaLabel;
    }
    if (checkboxMenuToggle) {
      return undefined;
    }
    return !legacyToggleLabel && !isLoading ? placeholderText : undefined;
  }, [menuToggleAriaLabel, checkboxMenuToggle, legacyToggleLabel, isLoading, placeholderText]);

  const plainToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={handleToggle}
      onBlur={onBlur}
      isExpanded={open}
      isDisabled={!!disabled}
      isFullWidth
      isPlaceholder={checkboxMenuToggle && toggleMainText === placeholderText}
      status={getStatus(!!isError, !!isSuccess)}
      aria-label={plainToggleAriaLabel}
      aria-describedby={describedBy || undefined}
      badge={toggleBadge}
    >
      {toggleMainText}
    </MenuToggle>
  );

  const selectBlock = (
    <InputGroup>
      <InputGroupItem isFill={isFill}>
        <PfSelect
          id={id}
          isOpen={open}
          selected={selectedMenuIds}
          onSelect={onPfSelect}
          onOpenChange={setOpen}
          shouldFocusToggleOnSelect={false}
          toggle={plainToggle}
          maxMenuHeight={maxMenuHeight}
          data-testid={dataTestId}
        >
          {renderMenuBody()}
        </PfSelect>
      </InputGroupItem>
      {onRefresh ? (
        <InputGroupItem>
          <Button
            variant="control"
            aria-label="Refresh"
            onClick={onRefresh}
            icon={isLoading ? <Spinner size="sm" /> : <RedoIcon />}
            isDisabled={!!disabled || !!isLoading}
          />
        </InputGroupItem>
      ) : null}
    </InputGroup>
  );

  const labelHelpEl =
    labelHelp || labelHelpTitle ? (
      <LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />
    ) : undefined;

  const inner = (
    <>
      {selectBlock}
      <HelperText
        id={id}
        errorMessage={errorMessage}
        helperText={helperText}
        isError={isError}
        isDisabled={disabled}
        isSuccess={isSuccess}
        successMessage={successMessage}
      />
    </>
  );

  if (!label) {
    return inner;
  }

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={label}
      isRequired={isRequired}
      labelHelp={labelHelpEl}
    >
      {inner}
    </FormGroup>
  );
}

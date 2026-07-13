import {
  type FocusEventHandler,
  type FormEvent,
  Fragment,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
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
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { RedoIcon, TimesIcon } from '@patternfly/react-icons';
import { toDisplayString } from './SelectOptions';
import { extractOptionValue, type Option, type OptionGroup, type OptionType } from './SelectTypes';
import { getStatus, isSyntheticOptionId, lowercaseFirst } from './selectFieldUtils';
import { useSelectDerived } from './useSelectDerived';
import { HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';

export interface SelectProps<T = unknown> {
  /** Stable field id (toggle and listbox wiring). */
  id: string;
  /** When set, wraps the control in a {@link FormGroup} with this label. */
  label?: string;
  placeholder?: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  /** Passed to the label help {@link Popover} as `maxWidth`. */
  labelHelpMaxWidth?: string;
  helperText?: ReactNode;
  errorMessage?: ReactNode | string;
  isError?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /**
   * When `true`, uses PatternFly `Select` `variant="typeahead"` and a filterable text toggle.
   * When `false`, uses a standard menu toggle showing the selected label.
   */
  isTypeAhead?: boolean;
  /**
   * Current value (matches an option’s `value` / `keyedValue`, or a primitive for string options).
   */
  value: T | string | number | null | undefined;
  /** Called when the user picks an option or clears the field. */
  onChange: (next: T | string | number | undefined) => void;
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
  /** Copy for the empty filter state in the menu (typeahead). */
  noResultsText?: string;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
  /** Fires when the dropdown menu opens or closes (after internal `open` updates). */
  onMenuOpenChange?: (isOpen: boolean) => void;
  /** Optional max height for the dropdown list (passed to PatternFly `Select`). */
  maxMenuHeight?: string;
  /** When `true`, constrains the menu height and scrolls overflow (requires `maxMenuHeight`). */
  isScrollable?: boolean;
  /** Optional test ID for the menu toggle button (for E2E testing). */
  'data-testid'?: string;
}

export function Select<T = unknown>(props: SelectProps<T>) {
  const {
    id,
    label,
    placeholder,
    labelHelp,
    labelHelpTitle,
    labelHelpMaxWidth,
    helperText,
    errorMessage,
    isError,
    isRequired,
    isDisabled,
    isTypeAhead = false,
    value,
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
    isScrollable,
    'data-testid': dataTestId,
  } = props;

  const disabled = isDisabled;

  if (optionGroups && options) {
    throw new Error('Select: use either `options` or `optionGroups`, not both.');
  }

  const [open, setOpen] = useState(false);
  const [typeaheadQuery, setTypeaheadQuery] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  const {
    normalizedFlat,
    hasGroups,
    displayedFlat,
    displayedGroups,
    flatForLookup,
    selectedOption,
  } = useSelectDerived({
    options,
    optionGroups,
    keyPath,
    isTypeAhead,
    value,
    typeaheadQuery,
  });

  const toggleLabel =
    selectedOption != null
      ? toDisplayString(selectedOption.label) || toDisplayString(selectedOption.value)
      : '';

  const placeholderText =
    placeholder ?? (label?.length ? `Select the ${lowercaseFirst(label)}` : 'Select an option');

  const handleSelectById = useCallback(
    (optionId: string | undefined) => {
      if (isSyntheticOptionId(optionId)) {
        return;
      }
      if (optionId == null || optionId === '') {
        /**
         * PatternFly can emit `onSelect` with an empty selection while the menu is closing or
         * during option transitions. Clearing the RHF value here briefly fails `.required()` and
         * flashes the error state. Plain selects have no in-menu "clear"; use {@link onClearTypeahead}
         * for typeahead clears.
         */
        if (isTypeAhead) {
          onChange(undefined as T | string | number | undefined);
        }
        setOpen(false);
        return;
      }
      const opt = flatForLookup.find((o) => o.id === optionId);
      if (opt) {
        onChange(opt.value as T | string | number | undefined);
      }
      setOpen(false);
    },
    [flatForLookup, isTypeAhead, onChange]
  );

  const onPfSelect = useCallback(
    (_event: MouseEvent<Element> | undefined, val: unknown) => {
      handleSelectById(extractOptionValue(val));
    },
    [handleSelectById]
  );

  const selectedForMenu = selectedOption?.id ?? '';

  /** Visible text in the typeahead input (loading placeholder vs filter query). */
  const typeaheadToggleDisplay = isLoading && !toggleLabel ? 'Loading...' : typeaheadQuery;

  const renderSelectOptionRow = (opt: OptionType<T>, optId: string) => {
    const isAriaDisabled = Boolean(opt.ariaDisabled);
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
        isSelected={opt.id === selectedForMenu && !isAriaDisabled}
      >
        {toDisplayString(opt.label) || toDisplayString(opt.value)}
      </SelectOption>
    );
  };

  const renderMenuBody = () => {
    if (isLoading) {
      return (
        <SelectList>
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
      const toRender = displayedGroups.filter((g) => g.options.length > 0);
      if (toRender.length === 0) {
        return (
          <SelectList>
            <SelectOption id={`${id}-no-results`} isAriaDisabled value="no-results">
              {noResultsText}
            </SelectOption>
          </SelectList>
        );
      }
      return (
        <SelectList>
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
        <SelectList id={isTypeAhead ? `${id}-listbox` : undefined}>
          <SelectOption id={`${id}-empty`} isAriaDisabled value="empty">
            {noResultsText}
          </SelectOption>
        </SelectList>
      );
    }
    if (isTypeAhead && displayedFlat.length === 0) {
      return (
        <SelectList id={`${id}-listbox`}>
          <SelectOption id={`${id}-no-results`} isAriaDisabled value="no-results">
            {noResultsText}
          </SelectOption>
        </SelectList>
      );
    }

    const listRows = isTypeAhead ? displayedFlat : flatOpts;

    return (
      <SelectList id={isTypeAhead ? `${id}-listbox` : undefined}>
        {listRows.map((opt, idx) => renderSelectOptionRow(opt, opt.id || `opt-${idx}`))}
      </SelectList>
    );
  };

  const onTypeaheadInputChange = useCallback((_e: FormEvent<HTMLInputElement>, v: string) => {
    setTypeaheadQuery(v);
  }, []);

  const onClearTypeahead = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(undefined as T | string | number | undefined);
      setTypeaheadQuery('');
      textInputRef.current?.focus();
    },
    [onChange]
  );

  const toggleOpen = useCallback(() => setOpen((o) => !o), []);

  const describedBy = helperTextId({
    id,
    errorMessage,
    helperText,
    isError,
    isSuccess,
    successMessage,
  });

  const plainToggleAriaLabel = !toggleLabel && !isLoading ? placeholderText : undefined;

  const plainToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={toggleOpen}
      onBlur={onBlur}
      isExpanded={open}
      isDisabled={!!disabled}
      isFullWidth
      status={getStatus(!!isError, !!isSuccess)}
      aria-label={plainToggleAriaLabel}
      aria-describedby={describedBy || undefined}
      data-testid={dataTestId}
    >
      {isLoading && !toggleLabel ? 'Loading...' : toggleLabel || placeholderText}
    </MenuToggle>
  );

  const typeaheadToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      ref={toggleRef}
      onClick={toggleOpen}
      onBlur={onBlur}
      isExpanded={open}
      isDisabled={!!disabled}
      isFullWidth
      status={getStatus(!!isError, !!isSuccess)}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={typeaheadToggleDisplay}
          onClick={toggleOpen}
          onChange={onTypeaheadInputChange}
          innerRef={textInputRef}
          placeholder={isLoading ? undefined : placeholderText}
          isExpanded={open}
          autoComplete="off"
          aria-label={placeholderText}
          aria-describedby={describedBy || undefined}
          role="combobox"
          aria-controls={`${id}-listbox`}
          id={`${id}-typeahead-input`}
        />
        <TextInputGroupUtilities
          {...(!typeaheadQuery || typeaheadToggleDisplay === 'Loading...'
            ? { style: { display: 'none' } }
            : {})}
        >
          <Button
            variant="plain"
            onClick={onClearTypeahead}
            aria-label="Clear selection"
            icon={<TimesIcon aria-hidden />}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  useEffect(() => {
    if (!isTypeAhead) return;
    /** Keeps query text in sync when the controlled selection (`value`) changes. Typing filters without changing selection leaves `toggleLabel` stable, so the input is not reset. */
    setTypeaheadQuery(toggleLabel || '');
  }, [isTypeAhead, toggleLabel]);

  const selectBlock = (
    <InputGroup>
      <InputGroupItem isFill={isFill}>
        <PfSelect
          id={id}
          isOpen={open}
          selected={selectedForMenu}
          onSelect={onPfSelect}
          onOpenChange={setOpen}
          toggle={isTypeAhead ? typeaheadToggle : plainToggle}
          variant={isTypeAhead ? 'typeahead' : undefined}
          shouldFocusToggleOnSelect={!isTypeAhead}
          maxMenuHeight={maxMenuHeight}
          isScrollable={isScrollable}
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
      <LabelHelp
        id={id}
        labelHelp={labelHelp}
        labelHelpTitle={labelHelpTitle}
        maxWidth={labelHelpMaxWidth}
      />
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

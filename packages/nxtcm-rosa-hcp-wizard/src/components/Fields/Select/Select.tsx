import {
  type ComponentProps,
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

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  InputGroup,
  InputGroupItem,
} from '@patternfly/react-core/dist/dynamic/components/InputGroup';
import {
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import {
  Select as PfSelect,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/dynamic/components/Select';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import {
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core/dist/dynamic/components/TextInputGroup';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import { HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';
import { getStatus, isSyntheticOptionId, lowercaseFirst } from './selectFieldUtils';
import { toDisplayString } from './SelectOptions';
import { extractOptionValue, type Option, type OptionGroup, type OptionType } from './SelectTypes';
import { useSelectDerived } from './useSelectDerived';

interface RenderedOption<T> {
  option: OptionType<T>;
  menuId: string;
}

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
  /** Heading level for option group labels; match the surrounding page headings. */
  groupHeadingLevel?: ComponentProps<typeof SelectGroup>['labelHeadingLevel'];
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
    groupHeadingLevel,
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
  const [activeOption, setActiveOption] = useState<OptionType<T> | undefined>();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showTooltip = useCallback(() => {
    clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setTooltipVisible(true), 300);
  }, []);
  const hideTooltip = useCallback(() => {
    clearTimeout(tooltipTimerRef.current);
    setTooltipVisible(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(tooltipTimerRef.current);
  }, []);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  const {
    normalizedFlat,
    normalizedGroups,
    hasGroups,
    displayedFlat,
    displayedGroups,
    selectedOption,
  } = useSelectDerived({
    options,
    optionGroups,
    keyPath,
    isTypeAhead,
    value,
    typeaheadQuery,
  });
  const displayedGroupsWithOptions = displayedGroups.filter((group) => group.options.length > 0);
  // Field-scoped menu IDs also identify options for aria-activedescendant.
  const groupedRows = displayedGroupsWithOptions.map((group, groupIndex) => ({
    label: group.label,
    listId: `${id}-listbox-${groupIndex}`,
    rows: group.options.map((option, optionIndex): RenderedOption<T> => ({
      option,
      menuId: `${id}-option-${groupIndex}-${optionIndex}`,
    })),
  }));
  const flatRows = (isTypeAhead ? displayedFlat : (normalizedFlat ?? [])).map(
    (option, optionIndex): RenderedOption<T> => ({
      option,
      menuId: `${id}-option-${optionIndex}`,
    })
  );
  const displayedRows = isLoading
    ? []
    : hasGroups
      ? groupedRows.flatMap((group) => group.rows)
      : flatRows;
  const navigableRows = displayedRows.filter(
    ({ option }) => !option.disabled && !option.ariaDisabled
  );
  // An option removed or disabled by new props cannot leave a stale active reference.
  const activeRow =
    open && isTypeAhead ? navigableRows.find(({ option }) => option === activeOption) : undefined;
  const groupedTypeaheadListboxIds = groupedRows.map(({ listId }) => listId).join(' ');
  const typeaheadListboxIds =
    !isLoading && hasGroups && groupedTypeaheadListboxIds
      ? groupedTypeaheadListboxIds
      : `${id}-listbox`;

  const toggleLabel =
    selectedOption != null
      ? toDisplayString(selectedOption.label) || toDisplayString(selectedOption.value)
      : '';

  const placeholderText =
    placeholder ?? (label?.length ? `Select the ${lowercaseFirst(label)}` : 'Select an option');
  const menuLabel = label || placeholderText;

  /**
   * Clears the typeahead filter when opening so all options are visible.
   * Restores the selected label when closing without a new selection.
   */
  const syncTypeaheadQueryForOpenState = useCallback(
    (isOpen: boolean) => {
      if (isTypeAhead) {
        setTypeaheadQuery(isOpen ? '' : toggleLabel || '');
      }
    },
    [isTypeAhead, toggleLabel]
  );

  const handleSelectById = (optionId: string | undefined): void => {
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
        onChange(undefined);
      }
      setOpen(false);
      setActiveOption(undefined);
      syncTypeaheadQueryForOpenState(false);
      return;
    }
    const row = navigableRows.find(({ menuId }) => menuId === optionId);
    if (!row) {
      return;
    }
    onChange(row.option.value);
    setOpen(false);
    setActiveOption(undefined);
    syncTypeaheadQueryForOpenState(false);
    if (isTypeAhead) {
      textInputRef.current?.focus();
    }
  };

  const onPfSelect = (_event: MouseEvent<Element> | undefined, val: unknown): void => {
    handleSelectById(extractOptionValue(val));
  };

  const selectedForMenu =
    displayedRows.find(({ option }) => option === selectedOption)?.menuId ?? '';

  /** Visible text in the typeahead input (loading placeholder vs filter query). */
  const typeaheadToggleDisplay = isLoading && !toggleLabel ? 'Loading...' : typeaheadQuery;

  const renderSelectOptionRow = ({
    option: opt,
    menuId,
  }: RenderedOption<T>): React.ReactElement => {
    const isAriaDisabled = Boolean(opt.ariaDisabled);
    return (
      <SelectOption
        id={menuId}
        key={menuId}
        value={menuId}
        title={typeof opt.title === 'string' && opt.title ? opt.title : undefined}
        description={
          !isAriaDisabled && typeof opt.description === 'string' ? opt.description : undefined
        }
        isDisabled={Boolean(opt.disabled) && !isAriaDisabled}
        isAriaDisabled={isAriaDisabled}
        tooltipProps={isAriaDisabled ? opt.tooltipProps : undefined}
        isSelected={menuId === selectedForMenu}
        isFocused={menuId === activeRow?.menuId}
      >
        {toDisplayString(opt.label) || toDisplayString(opt.value)}
      </SelectOption>
    );
  };

  const renderMenuBody = (): React.ReactElement => {
    if (isLoading) {
      return (
        <SelectList id={isTypeAhead ? `${id}-listbox` : undefined} aria-label={menuLabel}>
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
      if (groupedRows.length === 0) {
        return (
          <SelectList id={isTypeAhead ? `${id}-listbox` : undefined} aria-label={menuLabel}>
            <SelectOption id={`${id}-no-results`} isAriaDisabled value="no-results">
              {noResultsText}
            </SelectOption>
          </SelectList>
        );
      }
      return (
        <>
          {groupedRows.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 ? <Divider /> : null}
              <SelectGroup label={group.label} labelHeadingLevel={groupHeadingLevel}>
                <SelectList
                  id={isTypeAhead ? group.listId : undefined}
                  aria-label={`${menuLabel}: ${group.label}`}
                >
                  {group.rows.map(renderSelectOptionRow)}
                </SelectList>
              </SelectGroup>
            </Fragment>
          ))}
        </>
      );
    }

    const flatOpts = normalizedFlat ?? [];
    if (flatOpts.length === 0) {
      return (
        <SelectList id={`${id}-listbox`} aria-label={menuLabel}>
          <SelectOption id={`${id}-empty`} isAriaDisabled value="empty">
            {noResultsText}
          </SelectOption>
        </SelectList>
      );
    }
    if (isTypeAhead && displayedFlat.length === 0) {
      return (
        <SelectList id={`${id}-listbox`} aria-label={menuLabel}>
          <SelectOption id={`${id}-no-results`} isAriaDisabled value="no-results">
            {noResultsText}
          </SelectOption>
        </SelectList>
      );
    }

    return (
      <SelectList id={`${id}-listbox`} aria-label={menuLabel}>
        {flatRows.map(renderSelectOptionRow)}
      </SelectList>
    );
  };

  const onTypeaheadInputChange = useCallback((_e: FormEvent<HTMLInputElement>, v: string): void => {
    setTypeaheadQuery(v);
    setActiveOption(undefined);
    setOpen(true);
  }, []);

  const onClearTypeahead = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(undefined);
      setTypeaheadQuery('');
      setActiveOption(undefined);
      textInputRef.current?.focus();
    },
    [onChange]
  );

  const toggleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    const next = !open;
    setOpen(next);
    setActiveOption(undefined);
    syncTypeaheadQueryForOpenState(next);
  }, [disabled, open, syncTypeaheadQueryForOpenState]);

  // Close on Tab without preventing the browser's forward focus movement.
  const onTypeaheadKeydown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        const allOptions = hasGroups
          ? (normalizedGroups ?? []).flatMap((group) => group.options)
          : (normalizedFlat ?? []);
        const enabledOptions = isLoading
          ? []
          : allOptions.filter((option) => !option.disabled && !option.ariaDisabled);
        setOpen(true);
        syncTypeaheadQueryForOpenState(true);
        setActiveOption(
          event.key === 'ArrowDown' ? enabledOptions[0] : enabledOptions[enabledOptions.length - 1]
        );
        return;
      }

      const activeIndex = navigableRows.findIndex(({ option }) => option === activeOption);
      const nextIndex =
        activeIndex < 0
          ? event.key === 'ArrowDown'
            ? 0
            : navigableRows.length - 1
          : (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + navigableRows.length) %
            navigableRows.length;
      setActiveOption(navigableRows[nextIndex]?.option);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveOption(undefined);
        syncTypeaheadQueryForOpenState(true);
      } else if (activeRow) {
        handleSelectById(activeRow.menuId);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.stopPropagation();
      }
      setOpen(false);
      setActiveOption(undefined);
      syncTypeaheadQueryForOpenState(false);
      textInputRef.current?.focus();
    } else if (event.key === 'Tab' && open) {
      setOpen(false);
      setActiveOption(undefined);
      syncTypeaheadQueryForOpenState(false);
    }
  };

  const describedBy = helperTextId({
    id,
    errorMessage,
    helperText,
    isError,
    isSuccess,
    successMessage,
  });

  /** Text shown inside the plain (non-typeahead) toggle button. */
  const plainToggleText = isLoading && !toggleLabel ? 'Loading...' : toggleLabel || placeholderText;

  /** Full text for the PF tooltip — matches the visible toggle text. */
  const tooltipContent = isLoading && !toggleLabel ? 'Loading...' : toggleLabel || placeholderText;

  const plainToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <Tooltip
      content={tooltipContent}
      aria="none"
      trigger="manual"
      isVisible={tooltipVisible && !open}
    >
      <MenuToggle
        id={id}
        ref={toggleRef}
        onClick={toggleOpen}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          hideTooltip();
          onBlur?.(e);
        }}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        isExpanded={open}
        isDisabled={!!disabled}
        isFullWidth
        status={getStatus(!!isError, !!isSuccess)}
        aria-labelledby={label ? `${id}-label ${id}-toggle-text` : undefined}
        aria-haspopup="listbox"
        aria-describedby={describedBy || undefined}
        aria-invalid={isError || undefined}
        data-testid={dataTestId}
      >
        <span id={`${id}-toggle-text`}>{plainToggleText}</span>
      </MenuToggle>
    </Tooltip>
  );

  const typeaheadToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <Tooltip
      content={tooltipContent}
      aria="none"
      trigger="manual"
      isVisible={tooltipVisible && !open}
    >
      <MenuToggle
        variant="typeahead"
        aria-haspopup="listbox"
        ref={toggleRef}
        onClick={toggleOpen}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          hideTooltip();
          onBlur?.(e);
        }}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        isExpanded={open}
        isDisabled={!!disabled}
        isFullWidth
        status={getStatus(!!isError, !!isSuccess)}
        data-testid={dataTestId}
      >
        <TextInputGroup isPlain isDisabled={!!disabled}>
          <TextInputGroupMain
            value={typeaheadToggleDisplay}
            onClick={toggleOpen}
            onChange={onTypeaheadInputChange}
            innerRef={textInputRef}
            placeholder={isLoading ? undefined : placeholderText}
            isExpanded={open}
            inputId={id}
            inputProps={{
              'aria-label': label ? undefined : placeholderText,
              'aria-labelledby': label ? `${id}-label` : undefined,
              'aria-describedby': describedBy || undefined,
              'aria-invalid': isError || undefined,
              autoComplete: 'off',
              onKeyDown: onTypeaheadKeydown,
            }}
            role="combobox"
            aria-controls={open ? typeaheadListboxIds : undefined}
            aria-activedescendant={activeRow?.menuId}
            id={`${id}-typeahead-input`}
          />
          <TextInputGroupUtilities
            {...((!typeaheadQuery && !toggleLabel) || typeaheadToggleDisplay === 'Loading...'
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
    </Tooltip>
  );

  /** Handles PF-initiated open-change (click-outside, Escape). */
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        setActiveOption(undefined);
      }
      syncTypeaheadQueryForOpenState(isOpen);
    },
    [syncTypeaheadQueryForOpenState]
  );

  const [prevToggleLabel, setPrevToggleLabel] = useState<string | null>(null);
  if (isTypeAhead && prevToggleLabel !== toggleLabel) {
    setPrevToggleLabel(toggleLabel);
    /** Keeps query text in sync when the controlled selection (`value`) changes. Typing filters without changing selection leaves `toggleLabel` stable, so the input is not reset. */
    setTypeaheadQuery(toggleLabel || '');
  }

  const selectBlock = (
    <InputGroup>
      <InputGroupItem isFill={isFill}>
        <PfSelect
          id={`${id}-menu`}
          isOpen={open}
          selected={selectedForMenu}
          onSelect={onPfSelect}
          onOpenChange={handleOpenChange}
          onOpenChangeKeys={isTypeAhead ? ['Escape'] : undefined}
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
      label={<span id={`${id}-label`}>{label}</span>}
      isRequired={isRequired}
      labelHelp={labelHelpEl}
    >
      {inner}
    </FormGroup>
  );
}

/**
 * PatternFly typeahead Select pattern (aligned with react-core SelectTypeahead example):
 * separate input/filter vs committed selection, arrow keys + aria-activedescendant, Enter to commit.
 */
import {
  Button,
  Divider,
  MenuToggle,
  MenuToggleElement,
  Select as PfSelect,
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import {
  createContext,
  FormEvent,
  Fragment,
  KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import type { NormalizedOptionGroup, OptionType } from './RosaSelectTypes';

const NO_RESULTS_VALUE = '__rosa_typeahead_no_results__';

/** Never return [object Object]; always a string safe for display. */
export function toDisplayString(v: unknown): string {
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

type NavItem = {
  id: string;
  isDisabled?: boolean;
  isAriaDisabled?: boolean;
};

type TypeaheadFieldContextValue<T = unknown> = {
  disabled?: boolean;
  validated?: 'error';
  placeholder: string;
  isPending?: boolean;
  listboxId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  focusedItemIndex: number | null;
  setFocusedItemIndex: (i: number | null) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  committedDisplay: string;
  selectedOptionId: string;
  onCommit: (optionId: string | undefined) => void;
  hasGroups: boolean;
  menuFlatRows: (string | OptionType<T>)[];
  menuGroups: NormalizedOptionGroup<T>[] | null;
  flatNavItems: NavItem[];
  noResultsLabel: string;
  textInputRef: React.RefObject<HTMLInputElement | null>;
  resetKeyboard: () => void;
  closeMenu: () => void;
  onTextInputChange: (e: FormEvent<HTMLInputElement>, v: string) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: () => void;
  onToggleClick: () => void;
  onClearButtonClick: () => void;
  selectById: (id: string | undefined) => void;
  createItemId: (rawId: string, index: number) => string;
};

const TypeaheadFieldContext = createContext<TypeaheadFieldContextValue | null>(null);

function useTypeaheadFieldContext<T = unknown>() {
  const ctx = useContext(TypeaheadFieldContext) as TypeaheadFieldContextValue<T> | null;
  if (!ctx) {
    throw new Error('Rosa typeahead components must be used inside RosaTypeaheadFieldProvider');
  }
  return ctx;
}

type RosaTypeaheadFieldProviderProps<T = unknown> = {
  children: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  allFlatOptions: OptionType<T>[];
  allGroups?: NormalizedOptionGroup<T>[];
  hasGroups: boolean;
  /** Label text shown when the field has a committed value (not necessarily option id). */
  committedDisplay: string;
  /** Option `id` for the current form value (used for isSelected / commits). */
  selectedOptionId: string;
  onCommit: (optionId: string | undefined) => void;
  disabled?: boolean;
  validated?: 'error';
  placeholder: string;
  isPending?: boolean;
  /** Stable id for `aria-controls` / listbox (unique per field). */
  listboxId: string;
};

export function RosaTypeaheadFieldProvider<T = unknown>({
  children,
  open,
  setOpen,
  allFlatOptions,
  allGroups,
  hasGroups,
  committedDisplay,
  selectedOptionId,
  onCommit,
  disabled,
  validated,
  placeholder,
  isPending,
  listboxId,
}: RosaTypeaheadFieldProviderProps<T>) {
  const { noResults } = useWizardFooterStrings();
  const [inputValue, setInputValue] = useState(committedDisplay);
  const [filterValue, setFilterValue] = useState('');
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const prevCommittedRef = useRef(committedDisplay);

  const resetKeyboard = useCallback(() => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    resetKeyboard();
  }, [resetKeyboard, setOpen]);

  useEffect(() => {
    if (committedDisplay !== prevCommittedRef.current) {
      prevCommittedRef.current = committedDisplay;
      setInputValue(committedDisplay);
      setFilterValue('');
      resetKeyboard();
    }
  }, [committedDisplay, resetKeyboard]);

  const menuFlatRows = useMemo(() => {
    if (hasGroups) return [];
    const lower = filterValue.toLowerCase();
    let rows = allFlatOptions.filter((option) =>
      option.label.toString().toLowerCase().includes(lower)
    );
    if (filterValue && rows.length === 0) {
      rows = [
        {
          id: NO_RESULTS_VALUE,
          label: `${noResults} for "${filterValue}"`,
          value: NO_RESULTS_VALUE,
          keyedValue: NO_RESULTS_VALUE,
          ariaDisabled: true,
        } as OptionType<T>,
      ];
    }
    return rows as (string | OptionType<T>)[];
  }, [allFlatOptions, filterValue, hasGroups, noResults]);

  const menuGroups = useMemo(() => {
    if (!hasGroups || !allGroups) return null;
    const lower = filterValue.toLowerCase();
    const mapped = allGroups.map((group) => ({
      label: group.label,
      options: group.options.filter((opt) => opt.label.toString().toLowerCase().includes(lower)),
    }));
    return mapped.filter((g) => g.options.length > 0);
  }, [allGroups, filterValue, hasGroups]);

  const flatNavItems = useMemo((): NavItem[] => {
    if (isPending) return [];
    if (hasGroups && menuGroups) {
      return menuGroups.flatMap((g) =>
        g.options.map((o) => ({
          id: o.id ?? String(o.value),
          isDisabled: Boolean(o.disabled) && !o.ariaDisabled,
          isAriaDisabled: Boolean(o.ariaDisabled),
        }))
      );
    }
    return menuFlatRows.map((row) => {
      if (typeof row === 'string' || typeof row === 'number') {
        return { id: String(row), isDisabled: false, isAriaDisabled: false };
      }
      const opt = row as OptionType<T>;
      return {
        id: opt.id ?? String(opt.value),
        isDisabled: Boolean(opt.disabled) && !opt.ariaDisabled,
        isAriaDisabled: Boolean(opt.ariaDisabled),
      };
    });
  }, [hasGroups, isPending, menuFlatRows, menuGroups]);

  useEffect(() => {
    if (filterValue && !open) {
      setOpen(true);
    }
  }, [filterValue, open, setOpen]);

  const createItemId = useCallback(
    (rawId: string, index: number) =>
      `${listboxId}-opt-${index}-${String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    [listboxId]
  );

  const setActiveAndFocusedItem = useCallback(
    (itemIndex: number) => {
      const item = flatNavItems[itemIndex];
      if (!item) return;
      setFocusedItemIndex(itemIndex);
      setActiveItemId(createItemId(item.id, itemIndex));
    },
    [createItemId, flatNavItems]
  );

  const handleMenuArrowKeys = useCallback(
    (key: string) => {
      if (flatNavItems.length === 0) return;
      if (flatNavItems.every((o) => o.isDisabled || o.isAriaDisabled)) return;

      let indexToFocus = 0;
      if (!open) {
        setOpen(true);
      }

      if (key === 'ArrowUp') {
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = flatNavItems.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
        while (flatNavItems[indexToFocus]?.isDisabled || flatNavItems[indexToFocus]?.isAriaDisabled) {
          indexToFocus--;
          if (indexToFocus < 0) indexToFocus = flatNavItems.length - 1;
        }
      } else if (key === 'ArrowDown') {
        if (focusedItemIndex === null || focusedItemIndex === flatNavItems.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
        while (flatNavItems[indexToFocus]?.isDisabled || flatNavItems[indexToFocus]?.isAriaDisabled) {
          indexToFocus++;
          if (indexToFocus >= flatNavItems.length) indexToFocus = 0;
        }
      } else {
        return;
      }

      setActiveAndFocusedItem(indexToFocus);
    },
    [flatNavItems, focusedItemIndex, open, setActiveAndFocusedItem, setOpen]
  );

  const resolveLabelForId = useCallback(
    (optionId: string) => {
      const fromFlat = allFlatOptions.find((o) => (o.id ?? String(o.value)) === optionId);
      if (fromFlat) {
        return toDisplayString(fromFlat.label) || toDisplayString(fromFlat.value) || optionId;
      }
      if (allGroups) {
        for (const g of allGroups) {
          const o = g.options.find((x) => (x.id ?? String(x.value)) === optionId);
          if (o) return toDisplayString(o.label) || toDisplayString(o.value) || optionId;
        }
      }
      return optionId;
    },
    [allFlatOptions, allGroups]
  );

  const selectById = useCallback(
    (optionId: string | undefined) => {
      if (!optionId || optionId === NO_RESULTS_VALUE) return;
      const label = resolveLabelForId(optionId);
      onCommit(optionId);
      setInputValue(label);
      setFilterValue('');
      resetKeyboard();
      closeMenu();
    },
    [closeMenu, onCommit, resetKeyboard, resolveLabelForId]
  );

  const onTextInputChange = useCallback((_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
    resetKeyboard();
  }, [resetKeyboard]);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || isPending) return;
      const focusedItem =
        focusedItemIndex !== null && flatNavItems[focusedItemIndex]
          ? flatNavItems[focusedItemIndex]
          : null;

      switch (event.key) {
        case 'Enter':
          if (open && focusedItem && !focusedItem.isAriaDisabled && !focusedItem.isDisabled) {
            selectById(focusedItem.id);
          } else if (!open) {
            setOpen(true);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          handleMenuArrowKeys(event.key);
          break;
        default:
          break;
      }
    },
    [
      disabled,
      flatNavItems,
      focusedItemIndex,
      handleMenuArrowKeys,
      isPending,
      open,
      selectById,
      setOpen,
    ]
  );

  const onInputClick = useCallback(() => {
    if (!open) {
      setOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  }, [closeMenu, inputValue, open, setOpen]);

  const onToggleClick = useCallback(() => {
    const nextOpen = !open;
    setOpen(nextOpen);
    resetKeyboard();
    textInputRef.current?.focus();
  }, [open, resetKeyboard, setOpen]);

  const onClearButtonClick = useCallback(() => {
    onCommit(undefined);
    setInputValue('');
    setFilterValue('');
    resetKeyboard();
    textInputRef.current?.focus();
  }, [onCommit, resetKeyboard]);

  const ctxValue: TypeaheadFieldContextValue<T> = {
    disabled,
    validated,
    placeholder,
    isPending,
    listboxId,
    open,
    setOpen,
    inputValue,
    setInputValue,
    filterValue,
    setFilterValue,
    focusedItemIndex,
    setFocusedItemIndex,
    activeItemId,
    setActiveItemId,
    committedDisplay,
    selectedOptionId,
    onCommit,
    hasGroups,
    menuFlatRows,
    menuGroups,
    flatNavItems,
    noResultsLabel: noResults,
    textInputRef,
    resetKeyboard,
    closeMenu,
    onTextInputChange,
    onInputKeyDown,
    onInputClick,
    onToggleClick,
    onClearButtonClick,
    selectById,
    createItemId,
  };

  return <TypeaheadFieldContext.Provider value={ctxValue}>{children}</TypeaheadFieldContext.Provider>;
}

function useInternalTypeahead<T = unknown>() {
  return useTypeaheadFieldContext<T>();
}

type RosaTypeaheadToggleProps = {
  toggleRef: React.Ref<MenuToggleElement>;
};

export function RosaTypeaheadToggle({ toggleRef }: RosaTypeaheadToggleProps) {
  const ctx = useInternalTypeahead();
  const {
    disabled,
    validated,
    placeholder,
    isPending,
    listboxId,
    open,
    inputValue,
    activeItemId,
    textInputRef,
    onTextInputChange,
    onInputKeyDown,
    onInputClick,
    onToggleClick,
    onClearButtonClick,
  } = ctx;

  return (
    <MenuToggle
      variant="typeahead"
      ref={toggleRef}
      aria-label={placeholder}
      onClick={onToggleClick}
      isExpanded={open}
      isDisabled={disabled}
      isFullWidth
      status={validated === 'error' ? 'danger' : undefined}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={isPending && !inputValue ? 'Loading...' : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          innerRef={textInputRef}
          placeholder={isPending ? undefined : placeholder}
          isExpanded={open}
          autoComplete="off"
          aria-label={placeholder}
          role="combobox"
          aria-controls={listboxId}
          {...(activeItemId ? { 'aria-activedescendant': activeItemId } : {})}
        />
        <TextInputGroupUtilities {...(!inputValue ? { style: { display: 'none' } } : {})}>
          <Button
            variant="plain"
            onClick={onClearButtonClick}
            aria-label="Clear input value"
            icon={<TimesIcon aria-hidden />}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
}

type RosaTypeaheadMenuProps<T = unknown> = {
  /** Current option id used for isSelected (from form). */
  listValue: string;
};

export function RosaTypeaheadMenu<T = unknown>({ listValue }: RosaTypeaheadMenuProps<T>) {
  const ctx = useInternalTypeahead<T>();
  const {
    listboxId,
    isPending,
    hasGroups,
    menuFlatRows,
    menuGroups,
    focusedItemIndex,
    createItemId,
    noResultsLabel,
  } = ctx;

  if (isPending) {
    return (
      <SelectList id={listboxId}>
        <SelectOption id={`${listboxId}-loading`} isDisabled key="loading">
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

  if (hasGroups && menuGroups) {
    if (menuGroups.length === 0) {
      return (
        <SelectList id={listboxId}>
          <SelectOption id={`${listboxId}-no-results`} isDisabled value={NO_RESULTS_VALUE}>
            {noResultsLabel}
          </SelectOption>
        </SelectList>
      );
    }

    let globalIndex = 0;
    return (
      <SelectList id={listboxId}>
        {menuGroups.map((group, gIdx) => (
          <Fragment key={group.label}>
            {gIdx > 0 && <Divider />}
            <SelectGroup label={group.label}>
              {group.options.map((option, optIndex) => {
                const optionValue = option.id ?? String(option.value);
                const isAriaDisabled = Boolean(option.ariaDisabled);
                const idx = globalIndex;
                globalIndex += 1;
                const domId = createItemId(optionValue, idx);
                return (
                  <SelectOption
                    id={domId}
                    key={`${group.label}-${option.id ?? optIndex}`}
                    value={optionValue}
                    description={
                      !isAriaDisabled && typeof option.description === 'string'
                        ? option.description
                        : undefined
                    }
                    isDisabled={Boolean(option.disabled) && !isAriaDisabled}
                    isAriaDisabled={isAriaDisabled}
                    tooltipProps={isAriaDisabled ? option.tooltipProps : undefined}
                    isSelected={optionValue === listValue && !isAriaDisabled}
                    isFocused={focusedItemIndex === idx}
                  >
                    {toDisplayString(option.label) || toDisplayString(option.value)}
                  </SelectOption>
                );
              })}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectList>
    );
  }

  if (menuFlatRows.length === 0) {
    return (
      <SelectList id={listboxId}>
        <SelectOption id={`${listboxId}-no-results`} isDisabled value={NO_RESULTS_VALUE}>
          {noResultsLabel}
        </SelectOption>
      </SelectList>
    );
  }

  return (
    <SelectList id={listboxId}>
      {menuFlatRows.map((option, index) => {
        const isSimple = typeof option === 'string' || typeof option === 'number';
        const opt = option as OptionType<T>;
        const optionValue = isSimple ? String(option) : opt.id ?? String(opt.value);
        const isAriaDisabled = !isSimple && Boolean(opt.ariaDisabled);
        const isDisabled = !isSimple && Boolean(opt.disabled) && !isAriaDisabled;
        const domId = createItemId(optionValue, index);
        const displayText = isSimple
          ? String(option)
          : toDisplayString(opt.label) || toDisplayString(opt.value);
        const isNoResultsRow = !isSimple && opt.value === NO_RESULTS_VALUE;

        return (
          <SelectOption
            id={domId}
            key={`${optionValue}-${index}`}
            value={optionValue}
            description={!isSimple && !isAriaDisabled ? opt.description : undefined}
            isDisabled={isDisabled || isNoResultsRow}
            isAriaDisabled={isAriaDisabled || isNoResultsRow}
            tooltipProps={isAriaDisabled ? opt.tooltipProps : undefined}
            isSelected={!isDisabled && !isAriaDisabled && !isNoResultsRow && optionValue === listValue}
            isFocused={focusedItemIndex === index}
          >
            {displayText}
          </SelectOption>
        );
      })}
    </SelectList>
  );
}

type RosaTypeaheadPfSelectProps = {
  isOpen: boolean;
  /** Pass the selected option id (matches `SelectOption` `value`), not the display label. */
  selected: string;
  onSelect: (event: MouseEvent<Element> | undefined, value: string | number | undefined) => void;
  toggle: (toggleRef: React.Ref<MenuToggleElement>) => ReactNode;
  children: React.ReactNode;
};

/** PatternFly `Select` wired to provider `closeMenu` on dismiss (Tab / outside click / Escape). */
export function RosaTypeaheadPfSelect({
  isOpen,
  selected,
  onSelect,
  toggle,
  children,
}: RosaTypeaheadPfSelectProps) {
  const { closeMenu } = useInternalTypeahead();
  return (
    <PfSelect
      variant="typeahead"
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeMenu();
        }
      }}
      toggle={toggle}
    >
      {children}
    </PfSelect>
  );
}

import {
  Divider,
  Label,
  LabelProps,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuProps,
  MenuToggle,
  Popper,
  PopperProps,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';

export type DropdownItem<T extends string | number> = {
  id: T;
  text: React.ReactNode;
  isDisabled?: boolean;
  separator?: boolean;
  tooltip?: React.ReactNode;
  flyoutMenu?: DropdownItem<T>[];
  onSelect?: () => void;
  description?: string;
  isAriaDisabled?: boolean;
  isSelected?: boolean;
  icon?: React.ReactNode;
  label?: string;
  labelColor?: LabelProps['color'];
  tooltipPosition?: TooltipPosition;
};

export type DropdownProps<T extends string | number> = Omit<MenuProps, 'children' | 'onSelect'> & {
  id: string;
  dropdownItems: DropdownItem<T>[];
  text?: React.ReactNode;
  isDisabled?: boolean;
  isKebab?: boolean;
  onSelect?: (id: T) => void;
  isPlain?: boolean;
  isPrimary?: boolean;
  tooltip?: React.ReactNode;
  tooltipPosition?: TooltipPosition;
  dropdownPosition?: PopperProps['placement'];
  onToggle?: (isOpen?: boolean) => void;
  onHover?: () => void;
  kebabAriaLabel?: string;
};

const MenuItems = forwardRef<HTMLDivElement, any>(({ menuItems, onSelect, ...menuProps }, ref) => (
  <Menu
    ref={ref}
    onSelect={onSelect}
    containsFlyout={menuItems.some((mi: any) => mi.flyoutMenu)}
    {...menuProps}
  >
    <MenuContent>
      <MenuList>
        {menuItems.map((item: any) => {
          const menuItem = (
            <MenuItem
              key={item.id}
              itemId={item.id}
              isAriaDisabled={item.isDisabled || item.isAriaDisabled}
              isSelected={item.isSelected}
              description={item.description}
              flyoutMenu={
                item.flyoutMenu?.length ? (
                  <MenuItems
                    id={`${item.id}-submenu`}
                    menuItems={item.flyoutMenu}
                    onSelect={onSelect}
                  />
                ) : undefined
              }
            >
              {item.text}
              {item.label && item.labelColor && <Label color={item.labelColor}>{item.label}</Label>}
            </MenuItem>
          );
          const wrapped = item.tooltip ? (
            <Tooltip key={item.id} position={item.tooltipPosition} content={item.tooltip}>
              <div>{menuItem}</div>
            </Tooltip>
          ) : (
            menuItem
          );
          return (
            <React.Fragment key={item.id}>
              {item.separator && <Divider />}
              {wrapped}
            </React.Fragment>
          );
        })}
      </MenuList>
    </MenuContent>
  </Menu>
));

MenuItems.displayName = 'MenuItems';

export function ActionsDropdown<T extends string | number>(props: DropdownProps<T>) {
  const {
    dropdownItems,
    id,
    onSelect,
    text,
    isDisabled,
    isKebab,
    isPlain,
    isPrimary,
    tooltip,
    tooltipPosition,
    onToggle,
    onHover,
    kebabAriaLabel,
  } = props;
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState<boolean>(false);
  const popperContainer = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => {
    onToggle?.(!isOpen);
    setOpen(!isOpen);
  }, [isOpen, onToggle]);

  const findItemById = useCallback(
    (items: DropdownItem<T>[], targetId: T): DropdownItem<T> | undefined => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.flyoutMenu) {
          const found = findItemById(item.flyoutMenu, targetId);
          if (found) return found;
        }
      }
      return undefined;
    },
    []
  );
  const handleSelect = useCallback(
    (_event?: React.MouseEvent, itemId?: string | number) => {
      if (itemId === undefined) return;
      const selectedItem = findItemById(dropdownItems, itemId as T);
      if (!selectedItem || selectedItem.flyoutMenu?.length) return; // Ignore flyout parents

      // For OCM
      if (selectedItem.onSelect) {
        selectedItem.onSelect();
      }

      // For ACM
      if (onSelect) {
        onSelect(itemId as T);
      }

      setOpen(false);
    },
    [dropdownItems, findItemById, onSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !popperContainer.current?.contains(event.target as Node)) {
        toggleMenu();
      }
    };
    const handleMenuKeys = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        toggleMenu();
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleMenuKeys);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleMenuKeys);
    };
  }, [isOpen, toggleMenu]);

  const toggleVariant = useMemo(() => {
    if (isKebab) return 'plain';
    if (isPlain) return 'plainText';
    if (isPrimary) return 'primary';
    return 'default';
  }, [isKebab, isPlain, isPrimary]);

  const popper = (
    <Popper
      trigger={
        <MenuToggle
          ref={toggleRef}
          variant={toggleVariant}
          id={id}
          isDisabled={isDisabled}
          onClick={toggleMenu}
          onMouseOver={onHover}
          isExpanded={isOpen}
          aria-label={isKebab ? kebabAriaLabel || t('Actions') : String(text)}
        >
          {isKebab ? <EllipsisVIcon /> : text}
        </MenuToggle>
      }
      isVisible={isOpen}
      appendTo={popperContainer.current || 'inline'}
      placement={props.dropdownPosition ?? (isKebab ? 'bottom-end' : 'bottom-start')}
      popper={<MenuItems ref={menuRef} menuItems={dropdownItems} onSelect={handleSelect} />}
    />
  );

  return (
    <div ref={popperContainer}>
      {tooltip ? (
        <Tooltip content={tooltip} position={tooltipPosition}>
          {popper}
        </Tooltip>
      ) : (
        popper
      )}
    </div>
  );
}

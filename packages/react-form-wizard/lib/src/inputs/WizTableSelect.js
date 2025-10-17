import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Dropdown, DropdownItem, List, ListItem, Pagination, PaginationVariant, MenuToggleCheckbox, MenuToggle, DropdownList, } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { Indented } from '../components/Indented';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
import { ErrorState } from '@patternfly/react-component-groups';
export function WizTableSelect(props) {
    const { displayMode: mode, value, setValue, hidden, id } = useInput(props);
    const [page, setPage] = useState(1);
    const onSetPage = useCallback((_, page) => setPage(page), []);
    const pagedItems = useMemo(() => {
        return props.items.slice((page - 1) * 10, page * 10);
    }, [page, props.items]);
    let values = value;
    if (!Array.isArray(values))
        values = [];
    let selectedItems = values;
    if (props.valueMatchesItem)
        selectedItems = values
            .map((value) => props.items.find((item) => (props.valueMatchesItem ? props.valueMatchesItem(value, item) : false)))
            .filter((item) => item !== undefined);
    const onSelect = useCallback((item, select) => {
        if (select) {
            if (!selectedItems.includes(item)) {
                setValue([
                    ...(props.itemToValue ? selectedItems.map(props.itemToValue) : selectedItems),
                    props.itemToValue ? props.itemToValue(item) : pagedItems,
                ]);
            }
        }
        else {
            if (props.itemToValue) {
                setValue(selectedItems.filter((i) => i !== item).map(props.itemToValue));
            }
            else {
                setValue(selectedItems.filter((i) => i !== item));
            }
        }
    }, [pagedItems, props, selectedItems, setValue]);
    const isSelected = useCallback((item) => selectedItems.includes(item), [selectedItems]);
    const selectAll = useCallback(() => setValue(props.itemToValue ? props.items.map(props.itemToValue) : props.items), [props.items, props.itemToValue, setValue]);
    const selectPage = useCallback(() => {
        let newValue = [
            ...(props.itemToValue ? selectedItems.map(props.itemToValue) : selectedItems),
            ...(props.itemToValue ? pagedItems.map(props.itemToValue) : pagedItems),
        ];
        newValue = newValue.filter(onlyUnique);
        setValue(newValue);
    }, [pagedItems, props.itemToValue, selectedItems, setValue]);
    const selectNone = useCallback(() => setValue([]), [setValue]);
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!selectedItems.length)
            return _jsx(Fragment, {});
        if (!props.label) {
            if (values.length > 5) {
                return _jsxs("div", { id: id, children: [values.length, " selected"] });
            }
            return (_jsx(List, { isPlain: props.summaryList !== true, children: values.map((value, index) => (_jsx(ListItem, { style: { paddingBottom: 4 }, children: value }, index))) }));
        }
        if (values.length > 5) {
            return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsxs(DescriptionListDescription, { id: id, children: [values.length, " selected"] })] }));
        }
        return (_jsxs(Fragment, { children: [_jsx("div", { className: "pf-v6-c-description-list__term", children: props.label }), _jsx(Indented, { paddingBottom: 4, children: _jsx(List, { style: { marginTop: -4 }, isPlain: props.summaryList !== true, children: values.map((value, index) => (_jsx(ListItem, { style: { paddingBottom: 4 }, children: value }, index))) }) })] }));
    }
    if (props.items.length === 0) {
        return (_jsx(ErrorState, { titleText: props.emptyTitle, bodyText: props.emptyMessage, headingLevel: 'h4' }));
    }
    return (_jsxs(WizFormGroup, { ...props, children: [_jsx("div", { style: { display: 'flex', gap: 8 }, children: _jsx(BulkSelect, { selectedCount: selectedItems.length, selectAll: selectAll, selectPage: selectPage, selectNone: selectNone, perPage: 10, total: props.items.length }) }), _jsxs(Table, { "aria-label": props.label, variant: "compact", id: id, children: [_jsx(Thead, { children: _jsxs(Tr, { children: [_jsx(Th, {}), props.columns.map((column) => (_jsx(Th, { children: column.name }, column.name)))] }) }), _jsx(Tbody, { children: pagedItems.map((item, index) => (_jsxs(Tr, { children: [_jsx(Td, { select: {
                                        rowIndex: index,
                                        onSelect: (_event, isSelecting) => onSelect(item, isSelecting),
                                        isSelected: isSelected(item),
                                    } }), props.columns.map((column) => (_jsx(Td, { children: column.cellFn(item) }, column.name)))] }, index))) })] }), props.items.length > 10 && (_jsx(Pagination, { itemCount: props.items.length, perPage: 10, variant: PaginationVariant.bottom, page: page, onSetPage: onSetPage, perPageOptions: [] }))] }));
}
function BulkSelect(props) {
    const [open, setOpen] = useState(false);
    const onDropDownToggle = useCallback(() => setOpen((open) => !open), []);
    const { selected, selectNoItems, selectPageItems, selectAllItems } = useStringContext();
    const allSelected = props.selectedCount === props.total;
    const anySelected = props.selectedCount > 0;
    const someChecked = props.selectedCount ? null : false;
    const isChecked = allSelected ? true : someChecked;
    const items = useMemo(() => {
        const dropdownItems = [
            _jsx(DropdownItem, { onClick: props.selectNone, children: selectNoItems }, "item-1"),
        ];
        if (props.total > props.perPage) {
            dropdownItems.push(_jsx(DropdownItem, { onClick: props.selectPage, children: selectPageItems(props.perPage) }, "item-2"));
        }
        dropdownItems.push(_jsx(DropdownItem, { onClick: props.selectAll, children: selectAllItems(props.total) }, "item-3"));
        return dropdownItems;
    }, [
        props.perPage,
        props.selectAll,
        props.selectNone,
        props.selectPage,
        props.total,
        selectPageItems,
        selectAllItems,
        selectNoItems,
    ]);
    const { selectNone, selectAll } = props;
    const onCheckbox = useCallback(() => {
        anySelected ? selectNone() : selectAll();
    }, [anySelected, selectNone, selectAll]);
    const { deselectAllAriaLabel, selectAllAriaLabel } = useStringContext();
    const toggle = useCallback((toggleRef) => {
        return (_jsx(MenuToggle, { ref: toggleRef, onClick: onDropDownToggle, splitButtonItems: [
                _jsx(MenuToggleCheckbox, { id: "example-checkbox-2", "aria-label": anySelected ? deselectAllAriaLabel : selectAllAriaLabel, isChecked: isChecked, onChange: onCheckbox, children: props.selectedCount !== 0 && _jsx(Fragment, { children: selected(props.selectedCount) }) }, "split-checkbox"),
            ] }));
    }, [
        anySelected,
        deselectAllAriaLabel,
        isChecked,
        onCheckbox,
        onDropDownToggle,
        props.selectedCount,
        selectAllAriaLabel,
        selected,
    ]);
    return (_jsx(Dropdown, { onSelect: onDropDownToggle, toggle: toggle, isOpen: open, onOpenChange: setOpen, popperProps: { position: 'left' }, children: _jsx(DropdownList, { children: items }) }));
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
//# sourceMappingURL=WizTableSelect.js.map
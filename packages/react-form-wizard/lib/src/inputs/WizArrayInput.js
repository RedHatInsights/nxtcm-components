import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Divider, Dropdown, DropdownList, DropdownItem, FormFieldGroupHeader, Icon, List, ListItem, MenuToggle, Split, SplitItem, Title, } from '@patternfly/react-core';
import { ArrowDownIcon, ArrowUpIcon, ExclamationCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { WizTextDetail } from '..';
import { FieldGroup } from '../components/FieldGroup';
import { WizHelperText } from '../components/WizHelperText';
import { Indented } from '../components/Indented';
import { LabelHelp } from '../components/LabelHelp';
import { useData } from '../contexts/DataContext';
import { useStringContext } from '../contexts/StringContext';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { ItemContext } from '../contexts/ItemContext';
import { ShowValidationContext } from '../contexts/ShowValidationProvider';
import { HasValidationErrorContext, ValidationProvider } from '../contexts/ValidationProvider';
import { getCollapsedPlaceholder, useInput } from './Input';
export function wizardArrayItems(props, item) {
    const id = props.id;
    const path = props.path !== undefined ? props.path : id;
    let sourceArray = get(item, path);
    if (!Array.isArray(sourceArray))
        sourceArray = [];
    let values = sourceArray;
    if (props.filter)
        values = values.filter(props.filter);
    return values;
}
export function WizArrayInput(props) {
    const { displayMode: mode, value, setValue, hidden, id, required } = useInput(props);
    const [open, setOpen] = useState(false);
    const onToggle = useCallback(() => setOpen((open) => !open), []);
    const path = props.path;
    const { update } = useData();
    const item = useContext(ItemContext);
    const values = wizardArrayItems(props, item);
    const addItem = useCallback((newItem) => {
        if (path === null) {
            ;
            item.push(newItem);
        }
        else {
            let newArray = values;
            if (Array.isArray(newItem)) {
                newArray = [...newArray, ...newItem];
            }
            else {
                newArray.push(newItem);
            }
            setValue(newArray);
        }
        update();
    }, [item, path, setValue, update, values]);
    if (!values.length && props.disallowEmpty) {
        addItem(props.newValue ?? {});
    }
    const removeItem = useCallback((item) => {
        const index = value.indexOf(item);
        if (index !== -1) {
            ;
            value.splice(index, 1);
            setValue(value);
        }
    }, [setValue, value]);
    const moveUp = useCallback((index) => {
        const temp = value[index];
        value[index] = value[index - 1];
        value[index - 1] = temp;
        setValue(value);
    }, [setValue, value]);
    const moveDown = useCallback((index) => {
        const temp = value[index];
        value[index] = value[index + 1];
        value[index + 1] = temp;
        setValue(value);
    }, [setValue, value]);
    const { actionAriaLabel } = useStringContext();
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (values.length === 0) {
            return _jsx(Fragment, {});
        }
        if (props.isSection) {
            return (_jsxs(Fragment, { children: [_jsx(Title, { headingLevel: "h2", children: props.label }), _jsx(Indented, { id: id, children: _jsx(List, { style: { marginTop: -4 }, isPlain: props.summaryList !== true, children: values.map((value, index) => (_jsx(ListItem, { style: { paddingBottom: 4 }, children: _jsx(ItemContext.Provider, { value: value, children: typeof props.collapsedContent === 'string' ? (_jsx(WizTextDetail, { id: props.collapsedContent, path: props.collapsedContent, placeholder: props.collapsedPlaceholder })) : (props.collapsedContent) }) }, index))) }) })] }));
        }
        return (_jsxs(Fragment, { children: [_jsx("div", { className: "pf-v6-c-description-list__term", children: props.label }), _jsx(Indented, { id: id, children: _jsx(List, { style: { marginTop: -4 }, isPlain: props.summaryList !== true, children: values.map((value, index) => (_jsx(ListItem, { style: { paddingBottom: 4 }, children: _jsx(ItemContext.Provider, { value: value, children: typeof props.collapsedContent === 'string' ? (_jsx(WizTextDetail, { id: props.collapsedContent, path: props.collapsedContent, placeholder: props.collapsedPlaceholder })) : (props.collapsedContent) }) }, index))) }) })] }));
    }
    return (_jsxs("div", { id: id, className: "form-wizard-array-input", children: [props.label && (_jsxs("div", { style: { paddingBottom: 8, paddingTop: 0 }, children: [props.isSection ? (_jsxs(Split, { hasGutter: true, style: { paddingBottom: 8 }, children: [_jsx("span", { className: "pf-v6-c-form__section-title", children: props.label }), props.labelHelp && (_jsx(LabelHelp, { id: id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle }))] })) : (_jsxs("div", { children: [_jsx("span", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: props.label }), props.labelHelp && (_jsx(LabelHelp, { id: id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle }))] })), _jsx(WizHelperText, { ...props })] })), values.length === 0 ? (_jsx(Divider, {})) : (values.map((value, index) => {
                return (_jsx(ArrayInputItem, { id: id, value: value, index: index, count: values.length, collapsedContent: props.collapsedContent, expandedContent: props.expandedContent, collapsedPlaceholder: props.collapsedPlaceholder, sortable: props.sortable, required: required, moveUp: moveUp, moveDown: moveDown, removeItem: removeItem, defaultExpanded: !props.defaultCollapsed, children: props.children }, index));
            })), props.placeholder && (_jsx("div", { style: { display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: values.length ? 8 : 4 }, children: !props.dropdownItems ? (_jsx(Button, { id: "add-button", variant: "link", size: "sm", "aria-label": actionAriaLabel, onClick: () => addItem(props.newValue ?? {}), icon: _jsx(PlusCircleIcon, {}), children: props.placeholder })) : (_jsx(Dropdown, { isOpen: open, onOpenChange: setOpen, toggle: (toggleRef) => (_jsx(MenuToggle, { ref: toggleRef, onClick: onToggle, variant: "plainText", children: _jsx(Button, { icon: _jsx(PlusCircleIcon, {}), iconPosition: "left", variant: "link", size: "sm", children: props.placeholder }) })), popperProps: { position: 'left' }, children: _jsx(DropdownList, { children: props.dropdownItems.map((item, index) => (_jsx(DropdownItem, { onClick: () => {
                                addItem(item.action());
                                setOpen(false);
                            }, children: item.label }, index))) }) })) }))] }));
}
export function ArrayInputItem(props) {
    const { id, value, index, defaultExpanded, moveUp, moveDown, removeItem, count, required } = props;
    const [expanded, setExpanded] = useState(defaultExpanded !== undefined ? defaultExpanded : true);
    const collapsedContent = useMemo(() => {
        return typeof props.collapsedContent === 'string' ? (_jsx(WizTextDetail, { id: props.collapsedContent, path: props.collapsedContent, placeholder: getCollapsedPlaceholder(props) })) : (props.collapsedContent);
    }, [props]);
    const expandedContent = useMemo(() => {
        if (props.expandedContent) {
            return typeof props.expandedContent === 'string' ? (_jsx(WizTextDetail, { id: props.expandedContent, path: props.expandedContent })) : (props.expandedContent);
        }
        return collapsedContent;
    }, [collapsedContent, props.expandedContent]);
    const { detailsAriaLabel, expandToFixValidationErrors, sortableMoveItemDownAriaLabel, sortableMoveItemUpAriaLabel, removeItemAriaLabel, } = useStringContext();
    return (_jsx(ValidationProvider, { children: _jsx(ShowValidationContext.Consumer, { children: (showValidation) => (_jsx(HasValidationErrorContext.Consumer, { children: (hasErrors) => (_jsx(ItemContext.Provider, { value: value, children: _jsxs(FieldGroup, { id: id + '-' + (index + 1).toString(), isExpanded: expanded, setIsExpanded: setExpanded, toggleAriaLabel: detailsAriaLabel, header: _jsx(FormFieldGroupHeader, { titleText: {
                                text: showValidation && hasErrors ? (_jsxs(Split, { children: [_jsx(SplitItem, { children: _jsx(Icon, { status: "danger", children: _jsx(ExclamationCircleIcon, {}) }) }), _jsx(SplitItem, { children: _jsxs("span", { className: "pf-v6-c-form__helper-text pf-m-error", children: ["\u00A0 ", expandToFixValidationErrors] }) })] })) : expanded ? (_jsx(Fragment, { children: expandedContent })) : (_jsx(Fragment, { children: collapsedContent })),
                                id: `nested-field-group1-titleText-id-${index}`,
                            }, actions: _jsxs(Fragment, { children: [props.sortable && (_jsxs(Fragment, { children: [_jsx(Button, { variant: "plain", "aria-label": sortableMoveItemUpAriaLabel, isDisabled: index === 0, onClick: () => moveUp(index), children: _jsx(ArrowUpIcon, {}) }), _jsx(Button, { variant: "plain", "aria-label": sortableMoveItemDownAriaLabel, isDisabled: index === count - 1, onClick: () => moveDown(index), children: _jsx(ArrowDownIcon, {}) })] })), (!required || count > 1) && (_jsx(Button, { variant: "plain", "aria-label": removeItemAriaLabel, onClick: () => removeItem(props.value), children: _jsx(TrashIcon, {}) }))] }) }), children: [_jsxs(Split, { children: [_jsx(SplitItem, { isFilled: true, children: expanded ? _jsx(Fragment, { children: expandedContent }) : _jsx(Fragment, { children: collapsedContent }) }), _jsxs(SplitItem, { children: [props.sortable && (_jsxs(Fragment, { children: [_jsx(Button, { variant: "plain", "aria-label": sortableMoveItemUpAriaLabel, isDisabled: index === 0, onClick: () => moveUp(index), children: _jsx(ArrowUpIcon, {}) }), _jsx(Button, { variant: "plain", "aria-label": sortableMoveItemDownAriaLabel, isDisabled: index === count - 1, onClick: () => moveDown(index), children: _jsx(ArrowDownIcon, {}) })] })), (!required || count > 1) && (_jsx(Button, { variant: "plain", "aria-label": removeItemAriaLabel, onClick: () => removeItem(props.value), style: { marginTop: -6 }, children: _jsx(TrashIcon, {}) }))] })] }), props.children] }) })) })) }) }));
}
//# sourceMappingURL=WizArrayInput.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Label, LabelGroup, MenuFooter, MenuToggle, SelectList, SelectOption, TextInputGroup, TextInputGroupMain, TextInputGroupUtilities, } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStringContext } from '../contexts/StringContext';
export const InputSelect = ({ required, disabled, validated, options, setOptions, placeholder, value, onSelect, toggleRef, open, setOpen, }) => {
    const [inputValue, setInputValue] = useState('');
    const textInputRef = useRef(null);
    const onInputClick = useCallback(() => setOpen(!open), [open, setOpen]);
    useEffect(() => setOptions([...options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase())), inputValue]), [inputValue, options, setOptions]);
    const onClear = useCallback(() => {
        onSelect(undefined);
        setInputValue('');
        textInputRef?.current?.focus();
    }, [onSelect]);
    const onInputKeyDown = useCallback((event) => {
        if (!Array.isArray(value)) {
            onSelect('');
        }
        setOpen(true);
        switch (event.key) {
            case 'Backspace':
                !Array.isArray(value) && onSelect('');
                break;
        }
    }, [onSelect, open, setOpen, value]);
    const onTextInputChange = useCallback((_event, value) => {
        setInputValue(value);
    }, []);
    return (_jsx(MenuToggle, { variant: "typeahead", ref: toggleRef, onClick: () => setOpen(!open), isExpanded: open, isDisabled: disabled, isFullWidth: true, status: validated === 'error' ? 'danger' : undefined, children: _jsxs(TextInputGroup, { isPlain: true, children: [_jsx(TextInputGroupMain, { value: !Array.isArray(value) ? value || inputValue : inputValue, onClick: onInputClick, onChange: onTextInputChange, onKeyDown: onInputKeyDown, innerRef: textInputRef, placeholder: placeholder, isExpanded: open, autoComplete: "off", "aria-label": placeholder, role: "combobox", "aria-controls": "select-typeahead-listbox", children: Array.isArray(value) && (_jsx(LabelGroup, { style: { marginTop: -8, marginBottom: -8 }, children: value.map((selection) => (_jsx(Label, { readOnly: true, children: selection }, selection))) })) }), _jsx(TextInputGroupUtilities, { ...((!inputValue && !value) || required ? { style: { display: 'none' } } : {}), children: _jsx(Button, { variant: "plain", onClick: onClear, children: _jsx(TimesIcon, { "aria-hidden": true }) }) })] }) }));
};
export const SelectListOptions = ({ value, options, isCreatable, onCreate, footer, isMultiSelect, }) => {
    const { noResults, createOption } = useStringContext();
    return (_jsxs(SelectList, { isAriaMultiselectable: isMultiSelect, children: [options.map((option, index) => {
                const isLastItem = index === options.length - 1;
                const isSingleItem = options.length === 1;
                const isSimpleOption = typeof option === 'string';
                const valueString = String(isSimpleOption ? option : option.value);
                const isCreateOption = isSingleItem && isCreatable && value !== valueString;
                const shouldSkipLastItem = isLastItem && (!isSingleItem || (isCreatable && value === valueString));
                if (shouldSkipLastItem) {
                    return null;
                }
                let displayText;
                if (isCreateOption) {
                    displayText = `${createOption} "${valueString}"`;
                }
                else if (isSingleItem) {
                    displayText = noResults;
                }
                else if (isSimpleOption) {
                    displayText = option;
                }
                else {
                    displayText = option.label;
                }
                const isDisabled = displayText === noResults || (!isSimpleOption && option.disabled);
                const optionValue = !isSimpleOption ? option.id : option;
                return (_jsx(SelectOption, { id: isSimpleOption ? option : option.id || `option-${index}`, value: optionValue, description: !isSimpleOption ? option.description : undefined, isDisabled: isDisabled, onClick: isCreateOption ? () => onCreate?.(!isSimpleOption ? option.value : option) : undefined, isSelected: !isDisabled && !isCreateOption && Array.isArray(value)
                        ? value.includes(optionValue)
                        : optionValue === value, children: displayText }, isSimpleOption ? option : option.id || `option-${index}`));
            }), footer && _jsx(MenuFooter, { children: footer })] }));
};
//# sourceMappingURL=InputSelect.js.map
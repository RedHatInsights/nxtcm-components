import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Select as PfSelect, } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getSelectPlaceholder, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { WizFormGroup } from './WizFormGroup';
import './Select.css';
export function WizMultiSelect(props) {
    const { displayMode: mode, value, setValue, validated, hidden, id, disabled } = useInput(props);
    const { noResults } = useStringContext();
    const { isCreatable, options, footer } = props;
    const placeholder = getSelectPlaceholder(props);
    const [open, setOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const handleSetOptions = useCallback((o) => {
        if (o.length > 0) {
            setFilteredOptions(o);
        }
        else {
            setFilteredOptions([noResults]);
        }
    }, []);
    const onSelect = useCallback((selectedString) => {
        if (!selectedString) {
            setValue([]);
            return;
        }
        let newValues;
        if (Array.isArray(value))
            newValues = [...value];
        else
            newValues = [];
        if (newValues.includes(selectedString)) {
            newValues = newValues.filter((value) => value !== selectedString);
        }
        else {
            newValues.push(selectedString);
        }
        setValue(newValues);
    }, [setValue, value]);
    if (hidden)
        return null;
    if (mode === DisplayMode.Details) {
        if (!value)
            return null;
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: value.length > 5 ? (`${value.length} selected`) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 8 }, children: value.map((selection, index) => (_jsx("div", { children: selection }, index))) })) })] }));
    }
    return (_jsx("div", { id: id, children: _jsx(WizFormGroup, { ...props, children: _jsx(PfSelect, { onOpenChange: (isOpen) => {
                    !isOpen && setOpen(false);
                }, isOpen: open, toggle: (toggleRef) => (_jsx(InputSelect, { disabled: disabled, validated: validated, placeholder: placeholder, options: options, setOptions: handleSetOptions, toggleRef: toggleRef, value: value, onSelect: onSelect, open: open, setOpen: setOpen })), selected: value, onSelect: (_event, value) => onSelect(value?.toString() ?? ''), children: _jsx(SelectListOptions, { value: value, options: filteredOptions, isCreatable: isCreatable, footer: footer, isMultiSelect: true }) }) }) }));
}
//# sourceMappingURL=WizMultiSelect.js.map
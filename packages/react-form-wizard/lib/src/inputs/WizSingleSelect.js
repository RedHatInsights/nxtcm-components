import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, InputGroup, InputGroupItem, Select as PfSelect, } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getSelectPlaceholder, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { WizFormGroup } from './WizFormGroup';
import './Select.css';
export function WizSingleSelect(props) {
    const { displayMode: mode, value, setValue, validated, hidden, id, disabled, required } = useInput(props);
    const { noResults } = useStringContext();
    const { label, readonly, isCreatable, options, footer } = props;
    const placeholder = getSelectPlaceholder(props);
    const [open, setOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const onSelect = useCallback((selectedString) => {
        setValue(selectedString);
        setOpen(false);
    }, [setValue]);
    const handleSetOptions = useCallback((o) => {
        if (o.length > 0) {
            setFilteredOptions(o);
        }
        else {
            setFilteredOptions([noResults]);
        }
    }, []);
    if (hidden)
        return null;
    if (mode === DisplayMode.Details) {
        if (!value)
            return null;
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: label }), _jsx(DescriptionListDescription, { id: id, children: value })] }));
    }
    return (_jsx("div", { id: id, children: _jsx(WizFormGroup, { ...props, id: id, children: _jsx(InputGroup, { children: _jsx(InputGroupItem, { isFill: true, children: _jsx(PfSelect, { isOpen: open, onOpenChange: (isOpen) => {
                            !isOpen && setOpen(false);
                        }, toggle: (toggleRef) => (_jsx(InputSelect, { disabled: disabled || readonly, validated: validated, placeholder: placeholder, required: required, options: options, setOptions: handleSetOptions, toggleRef: toggleRef, value: value, onSelect: onSelect, open: open, setOpen: setOpen })), selected: value, onSelect: (_event, value) => onSelect(value?.toString() ?? ''), children: _jsx(SelectListOptions, { value: value, options: filteredOptions, isCreatable: isCreatable, footer: footer }) }) }) }) }) }));
}
//# sourceMappingURL=WizSingleSelect.js.map
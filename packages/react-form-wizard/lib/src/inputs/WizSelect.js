import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, InputGroup, InputGroupItem, Select as PfSelect, } from '@patternfly/react-core';
import get from 'get-value';
import { useCallback, useMemo, useState } from 'react';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getSelectPlaceholder, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { WizFormGroup } from './WizFormGroup';
import './Select.css';
export function WizSelect(props) {
    return _jsx(WizSelectBase, { ...props, variant: "single" });
}
function WizSelectBase(props) {
    const { displayMode: mode, value, setValue, validated, hidden, id, disabled, required } = useInput(props);
    const { noResults } = useStringContext();
    const placeholder = getSelectPlaceholder(props);
    const keyPath = props.keyPath ?? props.path;
    const isCreatable = props.isCreatable;
    const [open, setOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const selectOptions = useMemo(() => {
        return props.options?.map((option) => {
            let id;
            let label;
            let value;
            let keyedValue;
            let description;
            if (typeof option === 'string' || typeof option === 'number') {
                id = option.toString();
                label = option.toString();
                value = option;
                keyedValue = option;
            }
            else {
                id = option.id ?? option.label;
                label = option.label;
                if (!keyPath)
                    throw new Error('keyPath is required');
                value = option.value;
                description = option.description;
                keyedValue = get(value, keyPath);
                switch (typeof keyedValue) {
                    case 'string':
                    case 'number':
                        break;
                    default:
                        throw new Error('keyedValue is not a string or number');
                }
            }
            return { id, label, value, keyedValue, description };
        });
    }, [props.options, keyPath]);
    const inputSelectOptions = useMemo(() => {
        return selectOptions?.map((option) => option.value?.toString() ?? '') ?? [];
    }, [selectOptions]);
    const handleSetOptions = useCallback((o) => {
        const filtered = selectOptions?.filter((option) => {
            const valueStr = typeof option.value === 'string'
                ? option.value
                : typeof option.value === 'number'
                    ? option.value.toString()
                    : String(option.value);
            return o.includes(valueStr);
        }) ?? [];
        if (filtered.length > 0) {
            setFilteredOptions([...filtered, { id: 'input', label: '', value: o[0], keyedValue: '' }]);
        }
        else {
            setFilteredOptions([{ id: o[0], label: noResults, value: o[0], keyedValue: '' }]);
        }
    }, [selectOptions]);
    const onSelect = useCallback((selectOptionObject) => {
        const idOption = selectOptions?.find((o) => o.id === selectOptionObject);
        if (idOption) {
            setValue(idOption.value);
        }
        else {
            setValue(selectOptionObject);
        }
        setOpen(false);
    }, [setValue, selectOptions]);
    if (hidden)
        return null;
    if (mode === DisplayMode.Details) {
        if (!value)
            return null;
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: value })] }));
    }
    return (_jsx("div", { id: id, children: _jsx(WizFormGroup, { ...props, children: _jsx(InputGroup, { children: _jsx(InputGroupItem, { isFill: true, children: _jsx(PfSelect, { onOpenChange: (isOpen) => {
                            !isOpen && setOpen(false);
                        }, isOpen: open, toggle: (toggleRef) => (_jsx(InputSelect, { required: required, disabled: disabled, validated: validated, placeholder: placeholder, options: inputSelectOptions, setOptions: handleSetOptions, toggleRef: toggleRef, value: value, onSelect: onSelect, open: open, setOpen: setOpen })), selected: value, onSelect: (_event, value) => onSelect(value?.toString() ?? ''), children: _jsx(SelectListOptions, { value: value, options: filteredOptions, isCreatable: isCreatable, onCreate: props.onCreate, footer: props.footer }) }) }) }) }) }));
}
//# sourceMappingURL=WizSelect.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, InputGroup, InputGroupItem, Select as PfSelect, } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { SpinnerButton } from '../components/SpinnerButton';
import { SyncButton } from '../components/SyncButton';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getSelectPlaceholder, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { WizFormGroup } from './WizFormGroup';
import './Select.css';
export function WizAsyncSelect(props) {
    const { asyncCallback, isCreatable, footer } = props;
    const { displayMode, value, setValue, validated, hidden, id, disabled } = useInput(props);
    const { noResults } = useStringContext();
    const placeholder = getSelectPlaceholder(props);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [loading, setLoading] = useState(false);
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
    const sync = useCallback(() => {
        if (displayMode !== DisplayMode.Step)
            return;
        if (asyncCallback) {
            setLoading((loading) => {
                if (loading)
                    return loading;
                if (asyncCallback) {
                    asyncCallback()
                        .then((options) => {
                        if (Array.isArray(options) && options.every((option) => typeof option === 'string')) {
                            setOptions(options);
                            setFilteredOptions(options);
                        }
                        else {
                            console.warn('AsyncSelect: options is not an array of strings');
                            setOptions([]);
                        }
                    })
                        .catch(() => null)
                        .finally(() => setLoading(false));
                    return true;
                }
                return false;
            });
        }
    }, [asyncCallback, displayMode]);
    useEffect(() => sync(), [sync]);
    if (hidden)
        return null;
    if (displayMode === DisplayMode.Details) {
        if (!value)
            return null;
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: value })] }));
    }
    return (_jsx(WizFormGroup, { ...props, id: id, children: _jsxs(InputGroup, { children: [_jsx(InputGroupItem, { isFill: true, children: _jsx(PfSelect, { onOpenChange: (isOpen) => {
                            !isOpen && setOpen(false);
                        }, isOpen: open, toggle: (toggleRef) => (_jsx(InputSelect, { disabled: disabled || (loading && !isCreatable), validated: validated, placeholder: placeholder, options: options, setOptions: handleSetOptions, toggleRef: toggleRef, value: value, onSelect: onSelect, open: open, setOpen: setOpen })), selected: value, onSelect: (_event, value) => onSelect(value?.toString() ?? ''), shouldFocusFirstItemOnOpen: false, children: _jsx(SelectListOptions, { options: filteredOptions, value: value, isCreatable: isCreatable, footer: footer }) }) }), props.asyncCallback && loading && _jsx(SpinnerButton, {}), props.asyncCallback && !loading && _jsx(SyncButton, { onClick: sync })] }) }));
}
//# sourceMappingURL=WizAsyncSelect.js.map
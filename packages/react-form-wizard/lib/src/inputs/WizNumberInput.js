import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, NumberInput as PFNumberInput, } from '@patternfly/react-core';
import { Fragment, useCallback } from 'react';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { getEnterPlaceholder, useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
export function WizNumberInput(props) {
    const { displayMode: mode, value, setValue, disabled, hidden, id } = useInput(props);
    const onMinus = useCallback(() => {
        const newValue = typeof value === 'number' ? value - 1 : 0;
        if (props.zeroIsUndefined && newValue === 0) {
            setValue(undefined);
        }
        else {
            setValue(newValue);
        }
    }, [props.zeroIsUndefined, setValue, value]);
    const onChange = useCallback((event) => {
        const newValue = Number(event.target.value);
        if (props.zeroIsUndefined && newValue === 0) {
            setValue(undefined);
        }
        else {
            if (Number.isInteger(newValue))
                setValue(newValue);
        }
    }, [props.zeroIsUndefined, setValue]);
    const onPlus = useCallback(() => {
        if (typeof value === 'number')
            setValue(value + 1);
        else
            setValue(1);
    }, [setValue, value]);
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!value)
            return _jsx(Fragment, {});
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: value })] }));
    }
    const placeholder = getEnterPlaceholder(props);
    return (_jsx(WizFormGroup, { ...props, id: id, children: _jsx(PFNumberInput, { id: id, placeholder: placeholder, value: value, onMinus: onMinus, onChange: onChange, onPlus: onPlus, min: props.min === undefined ? 0 : props.min, max: props.max, isDisabled: disabled }) }));
}
//# sourceMappingURL=WizNumberInput.js.map
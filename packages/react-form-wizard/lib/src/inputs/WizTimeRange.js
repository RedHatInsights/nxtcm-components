import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, FormGroup, FormHelperText, HelperText, HelperTextItem, Split, TimePicker, } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { Fragment, useContext } from 'react';
import set from 'set-value';
import { useData } from '../contexts/DataContext';
import { ItemContext } from '../contexts/ItemContext';
import { DisplayMode, useDisplayMode } from '../contexts/DisplayModeContext';
import { convertId } from './Input';
export function WizTimeRange(props) {
    const id = convertId(props);
    const path = props.path ?? id;
    const { update } = useData();
    const mode = useDisplayMode();
    const item = useContext(ItemContext);
    const value = get(item, path);
    const showValidation = false;
    let error = undefined;
    let validated = undefined;
    if (showValidation) {
        if (props.validation) {
            error = props.validation(value);
        }
        validated = error ? 'error' : undefined;
    }
    if (props.hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!value)
            return _jsx(Fragment, {});
        return (_jsxs(Split, { hasGutter: true, children: [_jsx(CheckIcon, {}), _jsx(DescriptionListDescription, { children: props.label })] }));
    }
    const showHelperText = (validated === 'error' && error) || (validated !== 'error' && props.helperText);
    const helperText = validated === 'error' ? error : props.helperText;
    return (_jsx(Fragment, { children: _jsxs(FormGroup, { id: `${id}-form-group`, fieldId: id, isInline: true, label: props.label, isRequired: props.required, children: [_jsx(TimePicker, { id: `${id}-time-picker`, onChange: (value) => {
                        set(item, path, value);
                        update();
                    }, label: props.label, value: value }, id), showHelperText && (_jsx(FormHelperText, { children: _jsx(HelperText, { children: _jsx(HelperTextItem, { variant: validated, children: helperText }) }) }))] }) }));
}
//# sourceMappingURL=WizTimeRange.js.map
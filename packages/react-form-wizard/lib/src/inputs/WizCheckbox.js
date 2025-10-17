import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Checkbox as PFCheckbox, Split, Stack } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import { Fragment, useCallback } from 'react';
import { WizHelperText } from '../components/WizHelperText';
import { Indented } from '../components/Indented';
import { LabelHelp } from '../components/LabelHelp';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
function getIsChecked(value) {
    if (value === 'true') {
        return true;
    }
    else if (value === 'false') {
        return false;
    }
    return value;
}
export function WizCheckbox(props) {
    const { displayMode: mode, value, setValue, hidden, id } = useInput(props);
    const onChange = useCallback((_event, checked) => setValue(checked), [setValue]);
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!value)
            return _jsx(Fragment, {});
        return (_jsxs(Fragment, { children: [_jsxs(Split, { id: id, children: [_jsx(CheckIcon, { style: { paddingRight: 5 } }), _jsx("div", { className: "pf-v6-c-description-list__term", style: { paddingLeft: 2 }, children: props.label })] }), value && props.children] }));
    }
    return (_jsxs(Stack, { hasGutter: true, children: [_jsx(Stack, { children: _jsx(WizFormGroup, { ...props, id: id, label: props.title, noHelperText: true, children: _jsx(PFCheckbox, { id: id, isChecked: getIsChecked(value), onChange: onChange, label: _jsxs(_Fragment, { children: [props.label, " ", _jsx(LabelHelp, { id: id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle })] }), value: value, body: _jsx(WizHelperText, { ...props }) }) }) }), value && _jsx(Indented, { paddingBottom: 8, children: props.children })] }));
}
//# sourceMappingURL=WizCheckbox.js.map
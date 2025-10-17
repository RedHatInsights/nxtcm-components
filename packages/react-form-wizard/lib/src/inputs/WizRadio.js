import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Radio as PfRadio, } from '@patternfly/react-core';
import { Children, createContext, Fragment, isValidElement, useContext } from 'react';
import { WizHelperText } from '../components/WizHelperText';
import { Indented } from '../components/Indented';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useRandomID } from '../contexts/useRandomID';
import { useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
export const RadioGroupContext = createContext({});
RadioGroupContext.displayName = 'RadioGroupContext';
export function WizRadioGroup(props) {
    const { displayMode: mode, value, setValue, hidden, id } = useInput(props);
    const radioGroup = useRandomID();
    const state = {
        value,
        setValue,
        readonly: props.readonly,
        disabled: props.disabled,
        radioGroup,
    };
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!state.value)
            return _jsx(Fragment, {});
        let selectedChild;
        Children.forEach(props.children, (child) => {
            if (isValidElement(child)) {
                const value = child.props.value;
                if (value === state.value) {
                    selectedChild = child;
                }
            }
        });
        if (!selectedChild)
            return _jsx(Fragment, {});
        return (_jsxs(Fragment, { children: [_jsxs(DescriptionListGroup, { id: id, children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: selectedChild.props.id, children: selectedChild.props.label })] }), selectedChild.props?.children && selectedChild.props.children] }));
    }
    return (_jsx(RadioGroupContext.Provider, { value: state, children: _jsx("div", { id: id, children: _jsxs(WizFormGroup, { ...props, id: id, noHelperText: true, children: [_jsx(WizHelperText, { ...props }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 12, paddingTop: 8, paddingBottom: 4 }, children: props.children })] }) }) }));
}
export function Radio(props) {
    const radioGroupContext = useContext(RadioGroupContext);
    return (_jsxs(Fragment, { children: [_jsx(PfRadio, { id: radioGroupContext.radioGroup ? props.id + '-' + radioGroupContext.radioGroup : props.id, label: props.label, description: props.description, isChecked: radioGroupContext.value === props.value || (props.value === undefined && !radioGroupContext.value), onChange: () => radioGroupContext.setValue?.(props.value), isDisabled: radioGroupContext.disabled, readOnly: radioGroupContext.readonly, name: radioGroupContext.radioGroup ?? '' }), radioGroupContext.value === props.value && _jsx(Indented, { paddingBottom: 16, children: props.children })] }));
}
//# sourceMappingURL=WizRadio.js.map
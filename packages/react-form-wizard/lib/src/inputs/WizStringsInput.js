import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Divider, InputGroup, TextInput as PFTextInput, InputGroupItem, } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { Fragment } from 'react';
import { WizTextInput } from '..';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getAddPlaceholder, useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
export function WizStringsInput(props) {
    const { displayMode: mode, value, setValue, id, hidden, required } = useInput(props);
    const values = Array.isArray(value) ? value : [];
    const onNewKey = () => {
        values.push('');
        setValue(values);
    };
    const onDeleteKey = (index) => {
        values.splice(index, 1);
        setValue(values);
    };
    const { removeItemAriaLabel, actionAriaLabel } = useStringContext();
    if (hidden) {
        return _jsx(Fragment, {});
    }
    if (mode === DisplayMode.Details) {
        if (!values.length)
            return _jsx(Fragment, {});
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 8 }, children: values.map((value, index) => {
                            if (!value)
                                return _jsx(Fragment, {}, index);
                            return _jsx("div", { children: value }, index);
                        }) }) })] }));
    }
    return (_jsx(WizFormGroup, { ...props, id: id, children: _jsxs("div", { id: id, style: { display: 'flex', flexDirection: 'column', rowGap: values.length ? 8 : 4 }, children: [_jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 8 }, children: values.map((_, index) => {
                        return (_jsxs(InputGroup, { children: [_jsx(InputGroupItem, { children: _jsx(WizTextInput, { id: `${id}-${index + 1}`, path: props.path + '.' + index.toString(), required: required }) }), _jsx(InputGroupItem, { children: _jsx(Button, { variant: "plain", isDisabled: props.required === true && values.length === 1, "aria-label": removeItemAriaLabel, onClick: () => onDeleteKey(index), style: { alignSelf: 'start' }, children: _jsx(TrashIcon, {}) }) })] }, index));
                    }) }), !values.length && _jsx(Divider, {}), _jsx("div", { children: _jsx(Button, { id: "add-button", variant: "link", size: "sm", "aria-label": actionAriaLabel, onClick: onNewKey, icon: _jsx(PlusCircleIcon, {}), children: getAddPlaceholder(props) }) })] }) }));
}
export function StringsMapInput(props) {
    const { displayMode: mode, value, setValue, id, hidden } = useInput(props);
    let values = value;
    if (props.map)
        values = props.map(values);
    else if (!values)
        values = [];
    const onKeyChange = (index, newKey) => {
        values[index] = newKey;
        let newValue = values;
        if (props.unmap)
            newValue = props.unmap(values);
        setValue(newValue);
    };
    const onNewKey = () => {
        values.push('');
        let newValue = values;
        if (props.unmap)
            newValue = props.unmap(values);
        setValue(newValue);
    };
    const onDeleteKey = (index) => {
        values.splice(index, 1);
        let newValue = values;
        if (props.unmap)
            newValue = props.unmap(values);
        setValue(newValue);
    };
    const { removeItemAriaLabel, actionAriaLabel } = useStringContext();
    if (hidden) {
        return _jsx(Fragment, {});
    }
    if (mode === DisplayMode.Details) {
        if (!values.length)
            return _jsx(Fragment, {});
        return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 8 }, children: values.map((value, index) => {
                            if (!value)
                                return _jsx(Fragment, {}, index);
                            return _jsx("div", { children: value }, index);
                        }) }) })] }));
    }
    return (_jsx(WizFormGroup, { ...props, id: id, children: _jsxs("div", { id: id, style: { display: 'flex', flexDirection: 'column', rowGap: values.length ? 8 : 4 }, children: [_jsx("div", { style: { display: 'flex', flexDirection: 'column', rowGap: 8 }, children: values.map((pair, index) => {
                        return (_jsxs(InputGroup, { children: [_jsx(InputGroupItem, { isFill: true, children: _jsx(PFTextInput, { id: `${id}-${index + 1}`, value: pair, spellCheck: "false", onChange: (_event, value) => onKeyChange(index, value), required: true }) }), _jsx(InputGroupItem, { children: _jsx(Button, { variant: "plain", isDisabled: props.required === true && values.length === 1, "aria-label": removeItemAriaLabel, onClick: () => onDeleteKey(index), style: { alignSelf: 'start' }, children: _jsx(TrashIcon, {}) }) })] }, index));
                    }) }), !values.length && _jsx(Divider, {}), _jsx("div", { children: _jsx(Button, { id: "add-button", variant: "link", size: "sm", "aria-label": actionAriaLabel, onClick: onNewKey, icon: _jsx(PlusCircleIcon, {}), children: getAddPlaceholder(props) }) })] }) }));
}
//# sourceMappingURL=WizStringsInput.js.map
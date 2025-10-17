import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Divider, List, ListItem, TextInput } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { Fragment } from 'react';
import { WizHelperText } from '../components/WizHelperText';
import { Indented } from '../components/Indented';
import { LabelHelp } from '../components/LabelHelp';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useStringContext } from '../contexts/StringContext';
import { getAddPlaceholder, useInput } from './Input';
export function WizKeyValue(props) {
    const { displayMode: mode, value, setValue, hidden, id } = useInput(props);
    const pairs = value instanceof Object ? Object.keys(value).map((key) => ({ key, value: value[key] })) : [];
    const onKeyChange = (index, newKey) => {
        pairs[index].key = newKey;
        setValue(pairs.reduce((result, pair) => {
            result[pair.key] = pair.value;
            return result;
        }, {}));
    };
    const onValueChange = (index, newValue) => {
        pairs[index].value = newValue;
        setValue(pairs.reduce((result, pair) => {
            result[pair.key] = pair.value;
            return result;
        }, {}));
    };
    const onNewKey = () => {
        pairs.push({ key: '', value: '' });
        setValue(pairs.reduce((result, pair) => {
            result[pair.key] = pair.value;
            return result;
        }, {}));
    };
    const onDeleteKey = (index) => {
        pairs.splice(index, 1);
        setValue(pairs.reduce((result, pair) => {
            result[pair.key] = pair.value;
            return result;
        }, {}));
    };
    const { removeItemAriaLabel, actionAriaLabel } = useStringContext();
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!pairs.length)
            return _jsx(Fragment, {});
        return (_jsxs(Fragment, { children: [_jsx("div", { className: "pf-v6-c-description-list__term", children: props.label }), _jsx(Indented, { id: id, children: _jsx(List, { style: { marginTop: -4 }, isPlain: props.summaryList !== true, children: pairs.map((pair, index) => (_jsxs(ListItem, { style: { paddingBottom: 4 }, children: [pair.key, " ", pair.value !== undefined && _jsxs("span", { children: [" = ", pair.value] })] }, index))) }) })] }));
    }
    return (_jsxs("div", { id: id, style: { display: 'flex', flexDirection: 'column', rowGap: pairs.length ? 8 : 4 }, children: [_jsxs("div", { children: [_jsx("span", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: props.label }), props.labelHelp && _jsx(LabelHelp, { id: id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle })] }), _jsx(WizHelperText, { ...props }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'fit-content(200px) fit-content(0) auto fit-content(0)',
                    alignItems: 'center',
                    columnGap: 8,
                    rowGap: 8,
                }, children: pairs.map((pair, index) => {
                    return (_jsxs(Fragment, { children: [_jsx(TextInput, { id: `key-${index + 1}`, value: pair.key, spellCheck: "false", onChange: (_event, value) => onKeyChange(index, value) }), _jsx("span", { children: "=" }), _jsx(TextInput, { id: `value-${index + 1}`, value: pair.value, spellCheck: "false", onChange: (_event, value) => onValueChange(index, value) }), _jsx(Button, { variant: "plain", "aria-label": removeItemAriaLabel, onClick: () => onDeleteKey(index), children: _jsx(TrashIcon, {}) })] }, index));
                }) }), !Object.keys(pairs).length && _jsx(Divider, {}), _jsx("div", { children: _jsx(Button, { id: "add-button", variant: "link", size: "sm", "aria-label": actionAriaLabel, onClick: onNewKey, icon: _jsx(PlusCircleIcon, {}), children: getAddPlaceholder(props) }) })] }));
}
//# sourceMappingURL=WizKeyValue.js.map
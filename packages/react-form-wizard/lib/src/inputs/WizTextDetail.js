import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Split, SplitItem, Stack, } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { Fragment, useState } from 'react';
import { Indented } from '../components/Indented';
import { useInputHidden, useValue } from './Input';
export function WizTextDetail(props) {
    const [value] = useValue(props, '');
    const hidden = useInputHidden(props);
    const [showSecrets, setShowSecrets] = useState(!value);
    const stringValue = typeof value === 'string' ? value : '';
    if (hidden)
        return _jsx(Fragment, {});
    if (!props.label) {
        if (!value && props.placeholder) {
            return _jsx("span", { style: { opacity: 0.7 }, children: props.placeholder });
        }
        if (value === undefined) {
            return _jsx(Fragment, {});
        }
        return _jsx(Fragment, { children: value });
    }
    if (value === undefined) {
        return _jsx(Fragment, {});
    }
    return (_jsxs(Stack, { children: [_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: props.id, style: { whiteSpace: 'pre-wrap' }, children: _jsxs(Split, { children: [_jsx(SplitItem, { isFilled: true, children: props.secret && !showSecrets ? '****************' : stringValue }), props.secret && (_jsx(SplitItem, { children: _jsx(Button, { variant: "plain", style: { marginTop: '-8px' }, onClick: () => setShowSecrets(!showSecrets), children: showSecrets ? _jsx(EyeIcon, {}) : _jsx(EyeSlashIcon, {}) }) }))] }) })] }), props.children && _jsx(Indented, { children: props.children })] }));
}
//# sourceMappingURL=WizTextDetail.js.map
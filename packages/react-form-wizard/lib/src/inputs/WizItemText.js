import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { useValue } from './Input';
export function WizItemText(props) {
    const [value] = useValue(props, '');
    if (!value && props.placeholder) {
        return _jsx("span", { style: { opacity: 0.7 }, children: props.placeholder });
    }
    if (value === undefined) {
        return _jsx(Fragment, {});
    }
    if (Array.isArray(value)) {
        return (_jsx(Fragment, { children: value.map((v, index) => (_jsxs("span", { children: [index !== 0 ? ', ' : '', v] }, v))) }));
    }
    return _jsx(Fragment, { children: value });
}
//# sourceMappingURL=WizItemText.js.map
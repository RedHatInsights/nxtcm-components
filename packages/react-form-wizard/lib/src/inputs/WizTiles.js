import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Gallery, } from '@patternfly/react-core';
import { Children, Fragment, isValidElement, useContext } from 'react';
import { RadioGroupContext } from '..';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
import { ServiceCard } from '@patternfly/react-component-groups';
export function WizTiles(props) {
    const { displayMode: mode, value, setValue, hidden, id } = useInput(props);
    const state = {
        value: value,
        setValue: setValue,
        readonly: props.readonly,
        disabled: props.disabled,
    };
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        let label;
        Children.forEach(props.children, (child) => {
            if (!isValidElement(child))
                return;
            if (child.type !== Tile)
                return;
            if (child.props.value === value) {
                label = child.props.label;
            }
        });
        if (label)
            return (_jsxs(DescriptionListGroup, { children: [_jsx(DescriptionListTerm, { children: props.label }), _jsx(DescriptionListDescription, { id: id, children: label })] }));
        return _jsx(Fragment, {});
    }
    return (_jsx(RadioGroupContext.Provider, { value: state, children: _jsx(WizFormGroup, { ...props, id: id, children: _jsx(Gallery, { hasGutter: true, children: props.children }) }) }));
}
export function Tile(props) {
    const context = useContext(RadioGroupContext);
    return (_jsx("div", { onClick: () => context.setValue?.(props.value), children: _jsx(ServiceCard, { isStacked: true, title: props.label, description: props.description, name: props.label, isDisabled: context.disabled, readOnly: context.readonly, icon: props.icon }) }));
}
//# sourceMappingURL=WizTiles.js.map
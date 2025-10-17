import { jsx as _jsx } from "react/jsx-runtime";
import get from 'get-value';
import { Fragment, useContext } from 'react';
import { ItemContext } from '../contexts/ItemContext';
export function wizardSelectorItem(props, item) {
    return item.find((i) => {
        return get(i, props.selectKey) === props.selectValue;
    });
}
export function WizItemSelector(props) {
    const item = useContext(ItemContext);
    if (!Array.isArray(item))
        return _jsx(Fragment, { children: "Input must be an array!" });
    const newItem = wizardSelectorItem(props, item);
    if (newItem === undefined) {
        if (props.empty)
            return _jsx(Fragment, { children: props.empty });
        return _jsx(Fragment, {});
    }
    return _jsx(ItemContext.Provider, { value: newItem, children: props.children });
}
//# sourceMappingURL=WizItemSelector.js.map
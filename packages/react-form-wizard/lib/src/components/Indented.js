import { jsx as _jsx } from "react/jsx-runtime";
import { Stack } from '@patternfly/react-core';
import { Fragment, useContext } from 'react';
import { ItemContext } from '../contexts/ItemContext';
export function Indented(props) {
    const { paddingBottom, paddingTop } = props;
    const item = useContext(ItemContext);
    if (!props.children)
        return _jsx(Fragment, {});
    const hidden = props.hidden ? props.hidden(item) : false;
    if (hidden)
        return _jsx(Fragment, {});
    return (_jsx(Stack, { id: props.id, hasGutter: true, style: { paddingLeft: 22, paddingBottom, paddingTop }, children: props.children }));
}
//# sourceMappingURL=Indented.js.map
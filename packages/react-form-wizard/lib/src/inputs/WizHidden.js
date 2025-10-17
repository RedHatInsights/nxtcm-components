import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment } from 'react';
import { DisplayMode, useDisplayMode } from '../contexts/DisplayModeContext';
import { useInputHidden } from './Input';
export function WizHidden(props) {
    const hidden = useInputHidden(props);
    if (hidden)
        return _jsx(Fragment, {});
    return _jsx(Fragment, { children: props.children });
}
export function WizDetailsHidden(props) {
    const displayMode = useDisplayMode();
    if (displayMode === DisplayMode.Details)
        return _jsx(Fragment, {});
    return _jsx(Fragment, { children: props.children });
}
//# sourceMappingURL=WizHidden.js.map
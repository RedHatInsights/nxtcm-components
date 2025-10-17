import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Spinner, Tooltip } from '@patternfly/react-core';
import { useStringContext } from '../contexts/StringContext';
export function SpinnerButton() {
    const { spinnerButtonTooltip } = useStringContext();
    return (_jsx(Tooltip, { content: spinnerButtonTooltip, children: _jsx(Button, { variant: "control", isDisabled: true, children: _jsx(Spinner, { size: "md", style: { margin: -1, marginBottom: -3 } }) }) }));
}
//# sourceMappingURL=SpinnerButton.js.map
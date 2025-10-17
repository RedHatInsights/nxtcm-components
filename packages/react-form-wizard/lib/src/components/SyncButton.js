import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Tooltip } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useStringContext } from '../contexts/StringContext';
export function SyncButton(props) {
    const { syncButtonTooltip } = useStringContext();
    return (_jsx(Tooltip, { content: syncButtonTooltip, children: _jsx(Button, { variant: "control", onClick: props.onClick, children: _jsx(SyncAltIcon, {}) }) }));
}
//# sourceMappingURL=SyncButton.js.map
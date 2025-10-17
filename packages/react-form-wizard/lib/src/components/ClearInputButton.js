import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Tooltip } from '@patternfly/react-core';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { useStringContext } from '../contexts/StringContext';
export function ClearInputButton(props) {
    const { onClick } = props;
    const { clearButtonTooltip } = useStringContext();
    return (_jsx(Tooltip, { content: clearButtonTooltip, children: _jsx(Button, { variant: "control", onClick: onClick, tabIndex: -1, children: _jsx(TimesCircleIcon, {}) }) }));
}
//# sourceMappingURL=ClearInputButton.js.map
import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Tooltip } from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';
import { useStringContext } from '../contexts/StringContext';
export function PasteInputButton(props) {
    const { setValue, setShowSecrets } = props;
    const { pasteButtonTooltip } = useStringContext();
    return (_jsx(Tooltip, { content: pasteButtonTooltip, children: _jsx(Button, { variant: "control", onClick: () => {
                void navigator.clipboard.readText().then((value) => {
                    setValue(value);
                    if (value && setShowSecrets)
                        setShowSecrets(false);
                });
            }, tabIndex: -1, children: _jsx(PasteIcon, {}) }) }));
}
//# sourceMappingURL=PasteInputButton.js.map
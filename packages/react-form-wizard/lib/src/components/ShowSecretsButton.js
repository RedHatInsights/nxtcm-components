import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Tooltip } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useStringContext } from '../contexts/StringContext';
export function ShowSecretsButton(props) {
    const { showSecrets, setShowSecrets } = props;
    const { showSecretTooltip, hideSecretTooltip } = useStringContext();
    return (_jsx(Tooltip, { content: showSecrets ? hideSecretTooltip : showSecretTooltip, children: _jsx(Button, { variant: "control", onClick: () => setShowSecrets(!showSecrets), children: showSecrets ? _jsx(EyeIcon, {}) : _jsx(EyeSlashIcon, {}) }) }));
}
//# sourceMappingURL=ShowSecretsButton.js.map
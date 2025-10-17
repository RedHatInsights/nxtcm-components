import { jsx as _jsx } from "react/jsx-runtime";
import { useHistory } from 'react-router-dom';
import { onCancel, onSubmit } from '../common/utils';
import { CredentialsWizard } from './CredentialsWizard';
export function CredentialsExample() {
    const history = useHistory();
    return _jsx(CredentialsWizard, { onSubmit: onSubmit, onCancel: () => onCancel(history) });
}
//# sourceMappingURL=CredentialsExample.js.map
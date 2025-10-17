import { jsx as _jsx } from "react/jsx-runtime";
import { useHistory } from 'react-router-dom';
import { onCancel, onSubmit } from '../common/utils';
import { AppWizard } from './AppWizard';
export function AppExample() {
    const history = useHistory();
    return _jsx(AppWizard, { onSubmit: onSubmit, onCancel: () => onCancel(history) });
}
//# sourceMappingURL=AppExample.js.map
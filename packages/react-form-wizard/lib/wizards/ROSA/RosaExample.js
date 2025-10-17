import { jsx as _jsx } from "react/jsx-runtime";
import { useHistory } from 'react-router-dom';
import { onCancel, onSubmit } from '../common/utils';
import { RosaWizard } from './RosaWizard';
export function RosaExample() {
    const history = useHistory();
    return _jsx(RosaWizard, { onSubmit: onSubmit, onCancel: () => onCancel(history) });
}
//# sourceMappingURL=RosaExample.js.map
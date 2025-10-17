import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useHistory } from 'react-router';
import { onCancel, onSubmit } from '../common/utils';
import { AnsibleWizard } from './AnsibleWizard';
export function AnsibleExample() {
    const history = useHistory();
    const credentials = useMemo(() => ['my-inst-creds', 'my-up-creds'], []);
    const namespaces = useMemo(() => ['default'], []);
    return (_jsx(AnsibleWizard, { credentials: credentials, namespaces: namespaces, onSubmit: onSubmit, onCancel: () => onCancel(history) }));
}
//# sourceMappingURL=AnsibleExample.js.map
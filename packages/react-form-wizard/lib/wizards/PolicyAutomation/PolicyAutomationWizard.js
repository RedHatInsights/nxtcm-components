import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { WizDetailsHidden, EditMode, WizKeyValue, Section, WizSelect, Step, WizardPage, WizCheckbox, WizNumberInput, } from '../../src';
import { PolicyAutomationType } from '../common/resources/IPolicyAutomation';
export function PolicyAutomationWizard(props) {
    const ansibleCredentials = useMemo(() => props.credentials.filter((credential) => credential.metadata?.labels?.['cluster.open-cluster-management.io/type'] === 'ans'), [props.credentials]);
    const ansibleCredentialNames = useMemo(() => ansibleCredentials.map((credential) => credential.metadata?.name ?? ''), [ansibleCredentials]);
    const [jobNames, setJobNames] = useState();
    const [alert, setAlert] = useState();
    function getOperatorError() {
        const openShiftConsoleConfig = props.configMaps?.find((configmap) => configmap.metadata?.name === 'console-public');
        const openShiftConsoleUrl = openShiftConsoleConfig?.data?.consoleURL;
        return (_jsxs("div", { children: ['The Ansible Automation Platform Resource Operator is required to create an Ansible job. ', openShiftConsoleUrl && openShiftConsoleUrl !== '' ? (_jsxs("div", { children: ['Install the Operator through the following link: ', _jsxs(Button, { isInline: true, variant: ButtonVariant.link, onClick: () => window.open(openShiftConsoleUrl + '/operatorhub/all-namespaces?keyword=ansible+automation+platform'), children: ["OperatorHub", _jsx(ExternalLinkAltIcon, { style: { marginLeft: '4px', verticalAlign: 'middle' } })] })] })) : ('Install the Operator through operator hub.')] }));
    }
    useEffect(() => {
        if (props.editMode === EditMode.Edit) {
            const credential = ansibleCredentials.find((credential) => credential.metadata?.name === props.resource.spec?.automationDef?.secret);
            props
                .getAnsibleJobsCallback(credential ?? {})
                .then((jobNames) => setJobNames(jobNames))
                .catch((err) => {
                if (err instanceof Error) {
                    setAlert({ title: 'Failed to get job names from ansible', message: err.message });
                }
                else {
                    setAlert({ title: 'Failed to get job names from ansible', message: 'Unknown error' });
                }
            });
        }
    }, [ansibleCredentials, props]);
    return (_jsx(WizardPage, { title: props.title, breadcrumb: props.breadcrumb, onSubmit: props.onSubmit, onCancel: props.onCancel, editMode: props.editMode, yamlEditor: props.yamlEditor, defaultData: props.resource ?? {
            ...PolicyAutomationType,
            metadata: {
                name: `${props.policy.metadata?.name ?? ''}-policy-automation`,
                namespace: props.policy.metadata?.namespace,
            },
            spec: {
                policyRef: props.policy.metadata?.name,
                mode: 'once',
                automationDef: { name: '', secret: '', type: 'AnsibleJob' },
            },
        }, children: _jsxs(Step, { label: "Automation", id: "automation-step", children: [!props.isAnsibleOperatorInstalled && (_jsx(Alert, { isInline: true, title: getOperatorError(), variant: AlertVariant.danger })), _jsxs(Section, { label: "Policy automation", children: [alert && (_jsx(WizDetailsHidden, { children: _jsx(Alert, { title: alert.title, isInline: true, variant: "danger", children: alert.message }) })), _jsx(WizSelect, { id: "secret", label: "Ansible credential", path: "spec.automationDef.secret", options: ansibleCredentialNames, onValueChange: (value, item) => {
                                if (item.spec?.automationDef?.name) {
                                    ;
                                    item.spec.automationDef.name = '';
                                }
                                const credential = ansibleCredentials.find((credential) => credential.metadata?.name === value);
                                if (credential) {
                                    setAlert(undefined);
                                    setJobNames(undefined);
                                    props
                                        .getAnsibleJobsCallback(credential)
                                        .then((jobNames) => setJobNames(jobNames))
                                        .catch((err) => {
                                        if (err instanceof Error) {
                                            setAlert({ title: 'Failed to get job names from ansible', message: err.message });
                                        }
                                        else {
                                            setAlert({ title: 'Failed to get job names from ansible', message: 'Unknown error' });
                                        }
                                    });
                                }
                            }, footer: _jsx(_Fragment, { children: _jsx(Button, { id: 'create-credential', isInline: true, variant: ButtonVariant.link, onClick: props.createCredentialsCallback, children: 'Create credential' }) }), required: true }), _jsx(WizSelect, { id: "job", label: "Ansible job", path: "spec.automationDef.name", options: jobNames, hidden: (item) => !item.spec?.automationDef?.secret, required: true }), _jsx(WizKeyValue, { id: "extra_vars", path: "spec.automationDef.extra_vars", label: "Extra variables", placeholder: "Add variable", hidden: (item) => !item.spec?.automationDef?.name }), _jsx(WizSelect, { id: "mode", label: "Schedule", labelHelp: _jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Run everyEvent:" }), " When a policy is violated, the automation runs every time for each unique policy violation per managed cluster."] }), _jsxs("p", { children: [_jsx("strong", { children: "Run once:" }), " When a policy is violated, the automation runs one time, after which it is disabled."] }), _jsxs("p", { children: [_jsx("strong", { children: "Disabled:" }), " The automation does not run automatically."] }), _jsx("p", { children: `(To run automation manually, select "Disabled" and check the "Manual run" checkbox.)` })] }), path: "spec.mode", options: [
                                { label: 'Once', value: 'once' },
                                { label: 'EveryEvent', value: 'everyEvent' },
                                { label: 'Disabled', value: 'disabled' },
                            ], hidden: (item) => !item.spec?.automationDef?.name, required: true, onValueChange: (value, item) => {
                                if (value !== 'disabled' &&
                                    item.metadata?.annotations?.['policy.open-cluster-management.io/rerun'] === 'true') {
                                    item.metadata.annotations['policy.open-cluster-management.io/rerun'] = 'false';
                                }
                            } }), _jsx(WizCheckbox, { hidden: (item) => item.spec?.mode !== 'disabled', path: "metadata.annotations.policy\\.open-cluster-management\\.io/rerun", label: "Manual run: Set this automation to run once. After the automation runs, it is set to disabled.", inputValueToPathValue: (inputValue) => {
                                if (inputValue) {
                                    return 'true';
                                }
                                else {
                                    return 'false';
                                }
                            } }), _jsx(WizNumberInput, { hidden: (item) => item.spec?.mode !== 'everyEvent', path: "spec.delayAfterRunSeconds", label: "Delay After Run Seconds", labelHelp: "DelayAfterRunSeconds is the minimum seconds before an automation can be restarted on the same cluster. \n                        When a policy is violated, the automation runs one time before the delay period.\n                        If the policy is violated multiple times during the delay period and kept in the violated state, \n                        the automation runs one time after the delay period. \n                        The default is 0 seconds and is only applicable for the everyEvent mode.", helperText: "The period in seconds." })] })] }) }));
}
//# sourceMappingURL=PolicyAutomationWizard.js.map
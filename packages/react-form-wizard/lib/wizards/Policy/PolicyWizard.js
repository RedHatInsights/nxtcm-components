import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Button, Content, Stack, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { klona } from 'klona/json';
import { Fragment, useContext, useMemo } from 'react';
import set from 'set-value';
import { EditMode, Radio, Section, WizSelect, Step, StringsMapInput, WizardPage, WizArrayInput, WizCheckbox, WizDetailsHidden, WizHidden, WizItemSelector, WizKeyValue, WizNumberInput, WizRadioGroup, WizSingleSelect, WizStringsInput, WizTextInput, } from '../../src';
import { useEditMode } from '../../src/contexts/EditModeContext';
import { ItemContext, useItem } from '../../src/contexts/ItemContext';
import { PlacementBindingKind } from '../common/resources/IPlacementBinding';
import { PlacementRuleKind } from '../common/resources/IPlacementRule';
import { PolicyApiGroup, PolicyKind, PolicyType } from '../common/resources/IPolicy';
import { Sync } from '../../src/Sync';
import { isValidKubernetesResourceName, validatePolicyName } from '../common/validation';
import { MatchExpression, MatchExpressionCollapsed } from '../Placement/MatchExpression';
import { PlacementSection } from '../Placement/PlacementSection';
import { Specifications } from './specifications';
export function PolicyWizard(props) {
    return (_jsxs(WizardPage, { title: props.title, description: "A policy generates reports and validates cluster compliance based on specified security standards, categories, and controls.", yamlEditor: props.yamlEditor, onSubmit: props.onSubmit, onCancel: props.onCancel, editMode: props.editMode, defaultData: props.resources ?? [
            {
                ...PolicyType,
                metadata: { name: '', namespace: '' },
                spec: { disabled: false },
            },
        ], children: [_jsxs(Step, { label: "Details", id: "details", children: [props.editMode !== EditMode.Edit && (_jsxs(Fragment, { children: [_jsx(Sync, { kind: PolicyKind, path: "metadata.namespace" }), _jsx(Sync, { kind: PolicyKind, path: "metadata.name", suffix: "-placement" }), _jsx(Sync, { kind: PolicyKind, path: "metadata.name", targetKind: PlacementBindingKind, targetPath: "subjects.0.name" })] })), _jsx(Sync, { kind: PolicyKind, path: "metadata.namespace" }), _jsx(WizItemSelector, { selectKey: "kind", selectValue: PolicyKind, children: _jsxs(Section, { label: "Details", prompt: "Enter the details for the policy", children: [props.gitSource && (_jsx(WizDetailsHidden, { children: _jsx(Alert, { title: "This policy is managed externally", variant: "warning", isInline: true, children: _jsxs(Fragment, { children: [_jsx("p", { children: "Any changes made here may be overridden by the content of an upstream repository." }), _jsx(Button, { icon: _jsx(ExternalLinkAltIcon, {}), isInline: true, variant: "link", component: "a", href: props.gitSource, target: "_blank", children: props.gitSource })] }) }) })), _jsx(ItemContext.Consumer, { children: (item) => (_jsxs(Fragment, { children: [_jsx(WizTextInput, { id: "name", path: "metadata.name", label: "Name", required: true, validation: validatePolicyName, readonly: item.metadata?.uid !== undefined }), _jsx(WizSingleSelect, { id: "namespace", path: "metadata.namespace", label: "Namespace", placeholder: "Select namespace", helperText: "The namespace on the hub cluster where the policy resources will be created.", options: props.namespaces, required: true, readonly: item.metadata?.uid !== undefined })] })) }), _jsx(WizCheckbox, { path: "spec.disabled", label: "Disable policy", helperText: "Select to disable the policy from being propagated to managed clusters." })] }) })] }), _jsx(Step, { label: "Policy templates", id: "templates", children: _jsx(WizItemSelector, { selectKey: "kind", selectValue: PolicyKind, children: _jsx(PolicyWizardTemplates, { policies: props.policies }) }) }), _jsxs(Step, { label: "Placement", id: "placement", children: [_jsx(PolicyPolicySets, {}), _jsx(PlacementSection, { existingPlacements: props.placements, existingPlacementRules: props.placementRules, existingClusterSets: props.clusterSets, existingClusterSetBindings: props.clusterSetBindings, bindingSubjectKind: PolicyKind, bindingSubjectApiGroup: PolicyApiGroup, defaultPlacementKind: PlacementRuleKind, clusters: props.clusters, allowNoPlacement: true, withoutOnlineClusterCondition: true })] }), _jsx(Step, { label: "Policy annotations", id: "security-groups", children: _jsx(WizItemSelector, { selectKey: "kind", selectValue: PolicyKind, children: _jsxs(Section, { label: "Policy annotations", children: [_jsx(StringsMapInput, { id: "standards", path: `metadata.annotations.policy\\.open-cluster-management\\.io/standards`, label: "Standards", map: (value) => {
                                    return value !== undefined ? value.split(',').map((v) => v.trimStart()) : [];
                                }, unmap: (values) => values.join(', '), labelHelp: "The name or names of security standards the policy is related to. For example, National Institute of Standards and Technology (NIST) and Payment Card Industry (PCI)." }), _jsx(StringsMapInput, { id: "categories", path: `metadata.annotations.policy\\.open-cluster-management\\.io/categories`, label: "Categories", map: (value) => {
                                    return value !== undefined ? value.split(',').map((v) => v.trimStart()) : [];
                                }, unmap: (values) => values.join(', '), labelHelp: "A security control category represent specific requirements for one or more standards. For example, a System and Information Integrity category might indicate that your policy contains a data transfer protocol to protect personal information, as required by the HIPAA and PCI standards." }), _jsx(StringsMapInput, { id: "controls", path: `metadata.annotations.policy\\.open-cluster-management\\.io/controls`, label: "Controls", map: (value) => {
                                    return value !== undefined ? value.split(',').map((v) => v.trimStart()) : [];
                                }, unmap: (values) => values.join(', '), labelHelp: "The name of the security control that is being checked. For example, the certificate policy controller." })] }) }) })] }));
}
export function PolicyWizardTemplates(props) {
    const policy = useContext(ItemContext);
    const editMode = useEditMode();
    const selectorPath = 'objectDefinition.spec.namespaceSelector';
    const selectorMatchLabels = `${selectorPath}.matchLabels`;
    return (_jsxs(Section, { label: "Templates", description: "A policy contains  policy templates that create policies on managed clusters.", children: [_jsxs(WizRadioGroup, { path: "spec.remediationAction", label: "Remediation", labelHelp: "Optional. Specifies the remediation of your policy. The parameter values are enforce and inform. If specified, the spec.remediationAction value that is defined overrides the remediationAction parameter defined in the child policy, from the policy-templates section. For example, if spec.remediationAction value section is set to enforce, then the remediationAction in the policy-templates section is set to enforce during runtime. Important: Some policies might not support the enforce feature.", children: [_jsx(Radio, { id: "inform", label: "Inform", value: "inform", description: "Reports the violation, which requires manual remediation." }), _jsx(Radio, { id: "enforce", label: "Enforce", value: "enforce", description: "Automatically runs remediation action that is defined in the source, if this feature is supported." }), _jsx(Radio, { id: "policyTemplateRemediation", label: "Use policy template remediation", value: undefined, description: "Remediation action will be determined by what is set in the policy template definitions." })] }), _jsxs(WizArrayInput, { id: "templates", path: "spec.policy-templates", label: "Policy templates", placeholder: "Add policy template", dropdownItems: Specifications.map((specification) => {
                    return {
                        label: specification.description,
                        action: () => {
                            for (const group of ['categories', 'standards', 'controls']) {
                                const existingValue = get(policy, `metadata.annotations.policy\\.open-cluster-management\\.io/${group}`, '');
                                const addValue = get(specification, `${group}`, '');
                                const newValue = existingValue
                                    .split(',')
                                    .concat(addValue.split(','))
                                    .map((v) => v.trim())
                                    .filter((value, index, array) => array.indexOf(value) === index)
                                    .filter((value) => value)
                                    .join(', ');
                                set(policy, `metadata.annotations.policy\\.open-cluster-management\\.io/${group}`, newValue, {
                                    preservePaths: false,
                                });
                            }
                            const newPolicyTemplates = klona(specification.policyTemplates);
                            const policyName = get(policy, 'metadata.name');
                            if (policyName) {
                                newPolicyTemplates.forEach((t) => {
                                    const name = get(t, 'objectDefinition.metadata.name');
                                    if (name) {
                                        set(t, 'objectDefinition.metadata.name', name.replace('{{name}}', policyName));
                                    }
                                });
                            }
                            if (policy) {
                                const existingTemplates = get(policy, 'spec.policy-templates');
                                for (const newPolicyTemplate of newPolicyTemplates) {
                                    const name = get(newPolicyTemplate, 'objectDefinition.metadata.name');
                                    if (!name)
                                        continue;
                                    let counter = 1;
                                    let newName = name;
                                    while ((Array.isArray(existingTemplates) &&
                                        existingTemplates.find((existingTemplate) => {
                                            return get(existingTemplate, 'objectDefinition.metadata.name') === newName;
                                        })) ||
                                        isExistingTemplateName(newName, props.policies)) {
                                        newName = name + '-' + (counter++).toString();
                                    }
                                    set(newPolicyTemplate, 'objectDefinition.metadata.name', newName);
                                }
                            }
                            return newPolicyTemplates;
                        },
                    };
                }), collapsedContent: "objectDefinition.metadata.name", defaultCollapsed: editMode !== EditMode.Create, children: [_jsxs(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'CertificatePolicy', children: [_jsx("div", { children: _jsx(Title, { headingLevel: "h6", children: "Certificate Policy" }) }), _jsx(WizTextInput, { path: "objectDefinition.metadata.name", label: "Name", required: true, validation: isValidKubernetesResourceName, helperText: "Name needs to be unique to the namespace on each of the managed clusters." }), _jsx(WizTextInput, { path: "objectDefinition.spec.minimumDuration", label: "Minimum duration", required: true })] }), _jsxs(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'IamPolicy', children: [_jsx("div", { children: _jsx(Title, { headingLevel: "h6", children: "IAM Policy" }) }), _jsx(WizTextInput, { path: "objectDefinition.metadata.name", label: "Name", required: true, helperText: "Name needs to be unique to the namespace on each of the managed clusters.", validation: isValidKubernetesResourceName }), _jsx(WizNumberInput, { path: "objectDefinition.spec.maxClusterRoleBindingUsers", label: "Limit cluster role bindings", required: true })] }), _jsxs(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'ConfigurationPolicy', children: [_jsxs("div", { children: [_jsx(Title, { headingLevel: "h6", children: "Configuration Policy" }), _jsx(Content, { component: "small", children: "A configuration policy creates configuration objects on managed clusters." })] }), _jsx(WizTextInput, { path: "objectDefinition.metadata.name", label: "Name", required: true, helperText: "Name needs to be unique to the namespace on each of the managed clusters.", validation: isValidKubernetesResourceName }), _jsxs(WizRadioGroup, { path: "objectDefinition.spec.pruneObjectBehavior", label: "Prune Object Behavior", labelHelp: "Optional. Specifies how related objects on the managed cluster are pruned when the policy is deleted. The parameter values are None, DeleteIfCreated, and DeleteAll.", children: [_jsx(Radio, { id: "deleteIfCreated", label: "Delete If Created", value: "DeleteIfCreated", description: "Attempts to delete objects known to be created by the policy when the policy is deleted." }), _jsx(Radio, { id: "deleteAll", label: "Delete All", value: "DeleteAll", description: "Attempts to delete all of the objects related to the deleted policy." }), _jsx(Radio, { id: "none", label: "None", value: "None", description: "Does not delete any resources when the policy is deleted. This value is used by default." })] }), _jsx(WizArrayInput, { path: "objectDefinition.spec.object-templates", label: "Configuration objects", collapsedContent: "objectDefinition.metadata.name", children: _jsx(ObjectTemplate, {}) })] }), _jsxs(WizHidden, { hidden: (template) => template?.objectDefinition?.spec?.namespaceSelector === undefined, children: [_jsx(WizStringsInput, { id: "include-namespaces", path: `${selectorPath}.include`, label: "Include namespaces", placeholder: "Add namespace" }), _jsx(WizStringsInput, { id: "exclude-namespaces", path: `${selectorPath}.exclude`, label: "Exclude namespaces", placeholder: "Add namespace" }), _jsx(WizKeyValue, { label: "Namespaces match labels", path: selectorMatchLabels, placeholder: "Add label", hidden: (item) => get(item, selectorMatchLabels) === undefined }), _jsx(WizArrayInput, { label: "Namespaces match label expressions", path: `${selectorPath}.matchExpressions`, placeholder: "Add expression", collapsedContent: _jsx(MatchExpressionCollapsed, {}), newValue: { key: '', operator: 'In', values: [] }, defaultCollapsed: editMode !== EditMode.Create, children: _jsx(MatchExpression, {}) })] }), _jsxs(WizRadioGroup, { path: "objectDefinition.spec.remediationAction", label: "Remediation", children: [_jsx(Radio, { id: "inform", label: "Inform", value: "inform", description: "Reports the violation, which requires manual remediation." }), _jsx(Radio, { id: "enforce", label: "Enforce", value: "enforce", description: "Automatically runs remediation action that is defined in the source, if this feature is supported." })] }), _jsx(WizSelect, { path: "objectDefinition.spec.severity", label: "Severity", placeholder: "Select severity", options: ['low', 'medium', 'high'], required: true })] })] }));
}
function isExistingTemplateName(name, policies) {
    for (const policy of policies) {
        const existingTemplates = get(policy, 'spec.policy-templates');
        if (Array.isArray(existingTemplates)) {
            if (existingTemplates.find((existingTemplate) => {
                return get(existingTemplate, 'objectDefinition.metadata.name') === name;
            })) {
                return true;
            }
        }
    }
    return false;
}
function ObjectTemplate() {
    const template = useItem();
    return (_jsxs(Fragment, { children: [_jsx(WizHidden, { hidden: (template) => template?.complianceType === undefined, children: _jsxs(Stack, { children: [_jsx(Content, { component: 'small', children: template?.complianceType === 'musthave'
                                ? 'Must have'
                                : template?.complianceType === 'mustonlyhave'
                                    ? 'Must only have'
                                    : template?.complianceType === 'mustnothave'
                                        ? 'Must not have'
                                        : template?.complianceType }), _jsx(WizHidden, { hidden: (template) => template?.objectDefinition?.kind === undefined, children: _jsx(Title, { headingLevel: "h6", children: pascalCaseToSentenceCase(template?.objectDefinition?.kind) }) })] }) }), _jsx(WizHidden, { hidden: (template) => template?.complianceType !== undefined || template?.objectDefinition?.kind === undefined, children: _jsx(Title, { headingLevel: "h6", children: template?.objectDefinition?.kind }) }), _jsx(WizTextInput, { path: "objectDefinition.metadata.name", label: "Name", required: true, hidden: (template) => template?.objectDefinition?.metadata?.name === undefined }), _jsx(WizTextInput, { path: "objectDefinition.metadata.namespace", label: "Namespace", required: true, hidden: (template) => template?.objectDefinition?.metadata?.namespace === undefined }), _jsx(WizKeyValue, { path: "objectDefinition.metadata.labels", label: "Labels", hidden: (template) => template?.objectDefinition?.metadata?.labels === undefined }), _jsx(WizKeyValue, { path: "objectDefinition.metadata.annotations", label: "Annotations", hidden: (template) => template?.objectDefinition?.metadata?.annotations === undefined }), _jsx(WizTextInput, { path: "objectDefinition.status.phase", label: "Phase", hidden: (template) => template?.objectDefinition?.status?.phase === undefined }), _jsx(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'LimitRange', children: _jsxs(WizArrayInput, { path: "objectDefinition.spec.limits", label: "Limits", placeholder: "Add limit", collapsedContent: 'default.memory', children: [_jsx(WizTextInput, { path: "default.memory", label: "Memory limit", placeholder: "Enter memory limit", required: true, helperText: "Examples: 512Mi, 2Gi" }), _jsx(WizTextInput, { path: "defaultRequest.memory", label: "Memory request", placeholder: "Enter memory request", required: true, helperText: "Examples: 512Mi, 2Gi" })] }) }), _jsxs(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'SecurityContextConstraints', children: [_jsx(WizCheckbox, { path: "objectDefinition.allowHostDirVolumePlugin", label: "Allow host dir volume plugin" }), _jsx(WizCheckbox, { path: "objectDefinition.allowHostIPC", label: "Allow host IPC" }), _jsx(WizCheckbox, { path: "objectDefinition.allowHostNetwork", label: "Allow host network" }), _jsx(WizCheckbox, { path: "objectDefinition.allowHostPID", label: "Allow host PID" }), _jsx(WizCheckbox, { path: "objectDefinition.allowHostPorts", label: "Allow host ports" }), _jsx(WizCheckbox, { path: "objectDefinition.allowPrivilegeEscalation", label: "Allow privilege escalation" }), _jsx(WizCheckbox, { path: "objectDefinition.allowPrivilegedContainer", label: "Allow privileged container" })] }), _jsx(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'ScanSettingBinding', children: _jsxs(WizArrayInput, { id: "profiles", label: "Profiles", path: "objectDefinition.profiles", collapsedContent: "name", children: [_jsx(WizTextInput, { path: "kind", label: "Kind", required: true }), _jsx(WizTextInput, { path: "name", label: "Name", required: true })] }) }), _jsx(WizHidden, { hidden: (template) => template?.objectDefinition?.kind !== 'Role', children: _jsxs(WizArrayInput, { id: "rules", label: "Rules", path: "objectDefinition.rules", collapsedContent: "name", placeholder: "Add rule", children: [_jsx(WizStringsInput, { label: "API Groups", path: "apiGroups" }), _jsx(WizStringsInput, { label: "Resources", path: "resources" }), _jsx(WizStringsInput, { label: "Verbs", path: "verbs" })] }) })] }));
}
function pascalCaseToSentenceCase(text) {
    const result = text?.replace(/([A-Z])/g, ' $1') ?? '';
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
}
function PolicyPolicySets() {
    const resources = useItem();
    const policy = useMemo(() => resources?.find((resource) => resource.kind === PolicyKind), [resources]);
    const placements = useMemo(() => {
        if (!policy)
            return undefined;
        const placements = get(policy, 'status.placement');
        if (!Array.isArray(placements))
            return undefined;
        return placements;
    }, [policy]);
    const policySets = useMemo(() => {
        if (!Array.isArray(placements))
            return undefined;
        const policySets = placements
            .map((placement) => placement.policySet)
            .filter((policySet) => policySet !== undefined && policySet !== '');
        if (policySets.length === 0)
            return undefined;
        return policySets;
    }, [placements]);
    return (_jsx(WizDetailsHidden, { children: policySets && (_jsxs(Alert, { title: policySets.length === 1
                ? 'Policy placement is managed by a policy set.'
                : 'Policy placement is managed by policy sets.', isInline: true, variant: "warning", children: [_jsxs("p", { children: [policySets.length === 1
                            ? 'This policy is placed by the policy set: '
                            : 'This policy is placed by the policy sets: ', _jsx("b", { children: policySets.join(', ') })] }), _jsx("p", { className: "pf-v6-c-form__helper-text", children: "Only add placement to this policy if you want it to be placed in addition to the policy set placement." })] })) }));
}
//# sourceMappingURL=PolicyWizard.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert } from '@patternfly/react-core';
import get from 'get-value';
import { Fragment, useMemo } from 'react';
import { EditMode, ItemContext, WizItemSelector, Section, WizSingleSelect, Step, WizTableSelect, WizTextArea, WizardPage, WizTextInput, } from '../../src';
import { useItem } from '../../src/contexts/ItemContext';
import { PlacementBindingKind, PlacementBindingType } from '../common/resources/IPlacementBinding';
import { PlacementRuleApiGroup, PlacementRuleKind, PlacementRuleType } from '../common/resources/IPlacementRule';
import { PolicyApiVersion, PolicyKind } from '../common/resources/IPolicy';
import { PolicySetApiGroup, PolicySetKind, PolicySetType } from '../common/resources/IPolicySet';
import { Sync } from '../../src/Sync';
import { isValidKubernetesResourceName } from '../common/validation';
import { PlacementSection } from '../Placement/PlacementSection';
export function PolicySetWizard(props) {
    const policySet = props.resources?.find((resource) => resource.kind === PolicySetKind);
    const virtualPolicies = useMemo(() => {
        const virtualPolicies = [...props.policies];
        if (policySet) {
            const policies = get(policySet, 'spec.policies') ?? [];
            for (const policyName of policies) {
                if (!virtualPolicies.find((policy) => policy.metadata?.name === policyName && policy.metadata?.namespace === policySet.metadata?.namespace)) {
                    virtualPolicies.push({
                        apiVersion: PolicyApiVersion,
                        kind: PolicyKind,
                        metadata: {
                            name: policyName,
                            namespace: policySet.metadata?.namespace,
                        },
                    });
                }
            }
        }
        return virtualPolicies;
    }, [policySet, props.policies]);
    return (_jsxs(WizardPage, { title: props.title, breadcrumb: props.breadcrumb, onSubmit: props.onSubmit, onCancel: props.onCancel, editMode: props.editMode, defaultData: props.resources ?? [
            {
                ...PolicySetType,
                metadata: { name: '', namespace: '' },
                spec: { description: '', policies: [] },
            },
            {
                ...PlacementRuleType,
                metadata: { name: '', namespace: '' },
                spec: {
                    clusterSelector: { matchExpressions: [] },
                    clusterConditions: [],
                },
            },
            {
                ...PlacementBindingType,
                metadata: { name: '', namespace: '' },
                placementRef: { apiGroup: PlacementRuleApiGroup, kind: PlacementRuleKind, name: '' },
                subjects: [{ apiGroup: PolicySetApiGroup, kind: PolicySetKind, name: '' }],
            },
        ], yamlEditor: props.yamlEditor, children: [_jsxs(Step, { label: "Details", id: "details-step", children: [props.editMode !== EditMode.Edit && (_jsxs(Fragment, { children: [_jsx(Sync, { kind: PolicySetKind, path: "metadata.name", suffix: "-placement" }), _jsx(Sync, { kind: PolicySetKind, path: "metadata.name", suffix: "-placement" }), _jsx(Sync, { kind: PolicySetKind, path: "metadata.name", targetKind: PlacementBindingKind, targetPath: "subjects.0.name" })] })), _jsx(Sync, { kind: PolicySetKind, path: "metadata.namespace" }), _jsx(Section, { label: "Details", children: _jsx(WizItemSelector, { selectKey: "kind", selectValue: PolicySetKind, children: _jsx(ItemContext.Consumer, { children: (item) => (_jsxs(Fragment, { children: [_jsx(WizTextInput, { label: "Name", path: "metadata.name", id: "name", required: true, validation: isValidKubernetesResourceName, readonly: item.metadata?.uid !== undefined }), _jsx(WizTextArea, { label: "Description", path: "spec.description" }), _jsx(WizSingleSelect, { label: "Namespace", path: "metadata.namespace", id: "namespace", required: true, options: props.namespaces, readonly: item.metadata?.uid !== undefined })] })) }) }) })] }), _jsx(Step, { label: "Policies", id: "policies-step", children: _jsx(PoliciesSection, { policies: virtualPolicies }) }), _jsx(Step, { label: "Placement", id: "placement-step", children: _jsx(PlacementSection, { existingClusterSets: props.clusterSets, existingClusterSetBindings: props.clusterSetBindings, bindingSubjectKind: PolicySetKind, bindingSubjectApiGroup: PolicySetApiGroup, existingPlacements: props.placements, existingPlacementRules: props.placementRules, defaultPlacementKind: PlacementRuleKind, clusters: props.clusters, withoutOnlineClusterCondition: true }) })] }));
}
function PoliciesSection(props) {
    const resources = useItem();
    const namespacedPolicies = useMemo(() => {
        if (!resources.find)
            return [];
        const policySet = resources?.find((resource) => resource.kind === PolicySetKind);
        if (!policySet)
            return [];
        const namespace = policySet.metadata?.namespace;
        if (!namespace)
            return [];
        return props.policies.filter((policy) => policy.metadata?.namespace === namespace);
    }, [props.policies, resources]);
    const arePoliciesMissing = useMemo(() => {
        const policySet = resources?.find((resource) => resource.kind === PolicySetKind);
        if (policySet) {
            const selectedPolicies = get(policySet, 'spec.policies') ?? [];
            return selectedPolicies.find((policy) => namespacedPolicies.find((p) => p.metadata?.name === policy && !p.metadata?.uid));
        }
        return false;
    }, [resources, namespacedPolicies]);
    return (_jsxs(Section, { label: "Policies", children: [arePoliciesMissing && (_jsx(Alert, { title: "One or more selected policies can not be found.", variant: "warning", isInline: true })), _jsx(WizItemSelector, { selectKey: "kind", selectValue: PolicySetKind, children: _jsx(WizTableSelect, { id: "policies", path: "spec.policies", label: "", columns: [
                        { name: 'Name', cellFn: (policy) => policy.metadata?.name },
                        { name: 'Namespace', cellFn: (policy) => policy.metadata?.namespace },
                        { name: '', cellFn: (policy) => (policy.metadata?.uid ? '' : 'Not found') },
                    ], items: namespacedPolicies, itemToValue: (policy) => policy.metadata?.name, valueMatchesItem: (value, policy) => value === policy.metadata?.name, emptyTitle: "No policies available for selection.", emptyMessage: "Select a namespace to be able to select policies in that namespace." }) })] }));
}
//# sourceMappingURL=PolicySetWizard.js.map
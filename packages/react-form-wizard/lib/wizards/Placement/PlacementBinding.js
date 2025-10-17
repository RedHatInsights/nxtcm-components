import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { WizSelect, WizArrayInput, WizTextInput } from '../../src';
import { useItem } from '../../src/contexts/ItemContext';
import { PlacementApiGroup, PlacementKind } from '../common/resources/IPlacement';
import { PlacementBindingKind, PlacementBindingType, } from '../common/resources/IPlacementBinding';
import { PlacementRuleKind } from '../common/resources/IPlacementRule';
import { PolicyApiGroup } from '../common/resources/IPolicy';
import { PolicySetApiGroup } from '../common/resources/IPolicySet';
import { isValidKubernetesResourceName } from '../common/validation';
export function PlacementBindings(props) {
    return (_jsx(WizArrayInput, { id: "placement-bindings", label: "Placement bindings", helperText: "To apply a resource to a cluster, the placement must be bound to the resource using a placement binding.", path: null, filter: (resource) => resource.kind === PlacementBindingKind, placeholder: "Add placement binding", collapsedContent: "metadata.name", collapsedPlaceholder: "Expand to enter binding", defaultCollapsed: true, isSection: true, newValue: {
            ...PlacementBindingType,
            metadata: {},
            placementRef: { apiGroup: PlacementApiGroup, kind: PlacementKind, name: '' },
            subjects: [{ apiGroup: props.bindingSubjectApiGroup, kind: props.bindingSubjectKind, name: '' }],
        }, children: _jsx(PlacementBinding, { bindingSubjectKind: props.bindingSubjectKind, bindingSubjectApiGroup: props.bindingSubjectApiGroup }) }));
}
function PlacementBinding(props) {
    const placementBinding = useItem();
    return (_jsxs(Fragment, { children: [_jsx(WizTextInput, { path: "metadata.name", label: "Binding name", readonly: placementBinding.metadata?.uid !== undefined, required: true, helperText: "The placement binding name must be unique to the namespace.", validation: isValidKubernetesResourceName }), _jsx(WizSelect, { path: "placementRef.kind", label: "Placement kind", helperText: "The placement rule used to select clusters for placement.", required: true, options: ['Placement', PlacementRuleKind] }), _jsx(WizTextInput, { path: "placementRef.name", label: "Placement name", required: true, hidden: (binding) => binding.placementRef?.kind !== PlacementKind, helperText: "The placement name should match the name of a placement in this namespace..", validation: isValidKubernetesResourceName }), _jsx(WizTextInput, { path: "placementRef.name", label: "Placement rule name", required: true, hidden: (binding) => binding.placementRef?.kind !== PlacementRuleKind, helperText: "The placement rule name should match the name of a placement rule in this namespace.", validation: isValidKubernetesResourceName }), _jsx(WizArrayInput, { path: "subjects", label: "Subjects", helperText: "Placement bindings can have multiple subjects which the placement is applied to.", placeholder: "Add placement subject", collapsedContent: "name", collapsedPlaceholder: "Expand to enter subject", newValue: { apiGroup: props.bindingSubjectApiGroup, kind: props.bindingSubjectKind }, children: _jsx(Subject, {}) })] }));
}
function Subject() {
    const subject = useItem();
    return (_jsxs(Fragment, { children: [_jsx(WizSelect, { path: "kind", label: "Subject kind", required: true, options: ['PolicySet', 'Policy'], onValueChange: (value) => {
                    switch (value) {
                        case 'PolicySet':
                            subject.apiGroup = PolicySetApiGroup;
                            break;
                        case 'Policy':
                            subject.apiGroup = PolicyApiGroup;
                            break;
                    }
                } }), _jsx(WizTextInput, { path: "name", label: "Subject name", required: true, helperText: "The subject name should match the name of a policy or policy set in this namespace.", validation: isValidKubernetesResourceName })] }));
}
//# sourceMappingURL=PlacementBinding.js.map
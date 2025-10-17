import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { Fragment, useMemo } from 'react';
import { EditMode, WizHidden, WizKeyValue, WizNumberInput, WizArrayInput, WizTextInput } from '../../src';
import { useEditMode } from '../../src/contexts/EditModeContext';
import { useItem } from '../../src/contexts/ItemContext';
import { WizMultiSelect } from '../../src/inputs/WizMultiSelect';
import { PlacementKind, PlacementType } from '../common/resources/IPlacement';
import { useLabelValuesMap } from '../common/useLabelValuesMap';
import { isValidKubernetesResourceName } from '../common/validation';
import { MatchExpression, MatchExpressionCollapsed, MatchExpressionSummary } from './MatchExpression';
export function Placements(props) {
    const editMode = useEditMode();
    const resources = useItem();
    const namespaceClusterSetNames = useMemo(() => {
        if (!resources.find)
            return [];
        const source = resources?.find((resource) => resource.kind === props.bindingKind);
        if (!source)
            return [];
        const namespace = source.metadata?.namespace;
        if (!namespace)
            return [];
        return (props.clusterSetBindings
            ?.filter((clusterSetBinding) => clusterSetBinding.metadata?.namespace === namespace)
            .filter((clusterSetBinding) => props.clusterSets?.find((clusterSet) => clusterSet.metadata?.name === clusterSetBinding.spec?.clusterSet))
            .map((clusterSetBinding) => clusterSetBinding.spec?.clusterSet ?? '') ?? []);
    }, [props.bindingKind, props.clusterSetBindings, props.clusterSets, resources]);
    return (_jsx(WizArrayInput, { id: "placements", label: "Placements", helperText: "A placement selects clusters from the cluster sets which have bindings to the resource namespace.", path: null, isSection: true, filter: (resource) => resource.kind === PlacementKind, placeholder: "Add placement", collapsedContent: "metadata.name", collapsedPlaceholder: "Expand to enter placement", newValue: { ...PlacementType, metadata: { name: '', namespace: '' }, spec: {} }, defaultCollapsed: editMode === EditMode.Edit, children: _jsx(Placement, { namespaceClusterSetNames: namespaceClusterSetNames, clusters: props.clusters, createClusterSetCallback: props.createClusterSetCallback }) }));
}
export function Placement(props) {
    const editMode = useEditMode();
    const placement = useItem();
    return (_jsxs(Fragment, { children: [!props.hideName && (_jsx(WizTextInput, { id: "name", path: "metadata.name", label: "Name", required: true, readonly: placement.metadata?.uid !== undefined, helperText: "The name of the placement should match the placement name in a placement binding so that it is bound to a policy or policy set. The placement name must be unique to the namespace.", validation: isValidKubernetesResourceName })), _jsx(WizMultiSelect, { label: "Cluster sets", path: "spec.clusterSets", placeholder: "Select the cluster sets", labelHelp: "Select clusters from the cluster sets bound to the namespace. Cluster can then be further selected using cluster labels.", helperText: "If no cluster sets are selected, all clusters will be selected from the cluster sets bound to the namespace.", footer: props.createClusterSetCallback ? (_jsx(Button, { icon: _jsx(ExternalLinkAltIcon, {}), isInline: true, variant: "link", onClick: props.createClusterSetCallback, children: "Create cluster set" })) : undefined, options: props.namespaceClusterSetNames }), _jsx(WizHidden, { hidden: (placement) => {
                    if (editMode === EditMode.Edit)
                        return true;
                    if (!placement.spec?.predicates)
                        return false;
                    if (placement.spec.predicates.length <= 1)
                        return false;
                    return true;
                }, children: _jsx(PlacementPredicate, { rootPath: "spec.predicates.0.", clusters: props.clusters }) }), _jsx(WizArrayInput, { label: "Cluster selectors", path: "spec.predicates", placeholder: "Add cluster selector", collapsedContent: _jsx(PredicateSummary, {}), helperText: "A cluster selector further selects clusters from the clusters in the cluster sets which have bindings to the namespace. Clusters matching any cluster selector will be selected.", defaultCollapsed: true, hidden: (placement) => {
                    if (editMode === EditMode.Edit)
                        return false;
                    if (!placement.spec?.predicates)
                        return true;
                    if (placement.spec.predicates.length <= 1)
                        return true;
                    return false;
                }, children: _jsx(PlacementPredicate, { clusters: props.clusters }) }), _jsx(WizNumberInput, { label: "Limit the number of clusters selected", path: "spec.numberOfClusters", zeroIsUndefined: true, hidden: (placement) => placement.spec?.numberOfClusters === undefined })] }));
}
export function PlacementPredicate(props) {
    const rootPath = props.rootPath ?? '';
    const editMode = useEditMode();
    const labelValuesMap = useLabelValuesMap(props.clusters);
    return (_jsxs(Fragment, { children: [_jsx(WizKeyValue, { label: "Label selectors", path: `${rootPath}requiredClusterSelector.labelSelector.matchLabels`, labelHelp: "Select clusters from the clusters in selected cluster sets using cluster labels. For a cluster to be be selected, the cluster must match all label selectors, label expressions, and claim expressions.", placeholder: "Add cluster label selector", hidden: (item) => get(item, `${rootPath}requiredClusterSelector.labelSelector.matchLabels`) === undefined }), _jsx(WizArrayInput, { label: "Label expressions", path: `${rootPath}requiredClusterSelector.labelSelector.matchExpressions`, placeholder: "Add label expression", labelHelp: "Select clusters from the clusters in selected cluster sets using cluster labels. For a cluster to be be selected, the cluster must match all label selectors, label expressions, and claim expressions.", collapsedContent: _jsx(MatchExpressionCollapsed, {}), newValue: { key: '', operator: 'In', values: [] }, defaultCollapsed: editMode !== EditMode.Create, disallowEmpty: editMode === EditMode.Create, children: _jsx(MatchExpression, { labelValuesMap: labelValuesMap }) }), _jsx(WizArrayInput, { label: "Cluster claim expressions", path: `${rootPath}requiredClusterSelector.claimSelector.matchExpressions`, placeholder: "Add claim expression", labelHelp: "Select clusters from the clusters in selected cluster sets using cluster claims status. For a cluster to be be selected, the cluster must match all label selectors, label expressions, and claim expressions.", collapsedContent: _jsx(MatchExpressionCollapsed, {}), newValue: { key: '', operator: 'In', values: [] }, defaultCollapsed: editMode !== EditMode.Create, hidden: (item) => get(item, `${rootPath}requiredClusterSelector.claimSelector.matchExpressions`) === undefined, children: _jsx(MatchExpression, { labelValuesMap: labelValuesMap }) })] }));
}
export function PredicateSummary() {
    const predicate = useItem();
    const labelSelectorLabels = predicate.requiredClusterSelector?.labelSelector?.matchLabels ?? {};
    const labelSelectorExpressions = predicate.requiredClusterSelector?.labelSelector?.matchExpressions ?? [];
    const claimSelectorExpressions = predicate.requiredClusterSelector?.claimSelector?.matchExpressions ?? [];
    const labelSelectors = [];
    for (const matchLabel in labelSelectorLabels) {
        labelSelectors.push(`${matchLabel}=${labelSelectorLabels[matchLabel]}`);
    }
    if (labelSelectors.length === 0 && labelSelectorExpressions.length === 0 && claimSelectorExpressions.length === 0) {
        return _jsx("div", { children: "Expand to enter details" });
    }
    return (_jsxs("div", { style: { display: 'flex', gap: 16, flexDirection: 'column' }, children: [labelSelectors.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 4, flexDirection: 'column' }, children: [_jsx("div", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: "Label selectors" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: labelSelectors.map((labelSelector) => (_jsx("span", { children: labelSelector }, labelSelector))) })] })), labelSelectorExpressions.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 4, flexDirection: 'column' }, children: [_jsx("div", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: "Label expressions" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: labelSelectorExpressions.map((expression, index) => (_jsx(MatchExpressionSummary, { expression: expression }, index))) })] })), claimSelectorExpressions.length > 0 && (_jsxs("div", { style: { display: 'flex', gap: 4, flexDirection: 'column' }, children: [_jsx("div", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: "Cluster claim expressions" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: claimSelectorExpressions.map((expression, index) => (_jsx(MatchExpressionSummary, { expression: expression }, index))) })] }))] }));
}
//# sourceMappingURL=Placement.js.map
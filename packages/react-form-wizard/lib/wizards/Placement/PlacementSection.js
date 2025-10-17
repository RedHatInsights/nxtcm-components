import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { WizDetailsHidden, EditMode, WizItemSelector, Section, WizSelect, WizSingleSelect } from '../../src';
import { useData } from '../../src/contexts/DataContext';
import { DisplayMode, useDisplayMode } from '../../src/contexts/DisplayModeContext';
import { useEditMode } from '../../src/contexts/EditModeContext';
import { useSetHasInputs } from '../../src/contexts/HasInputsProvider';
import { useItem } from '../../src/contexts/ItemContext';
import { useValidate } from '../../src/contexts/ValidationProvider';
import { PlacementApiGroup, PlacementApiVersion, PlacementKind } from '../common/resources/IPlacement';
import { PlacementBindingKind, PlacementBindingType } from '../common/resources/IPlacementBinding';
import { PlacementRuleApiGroup, PlacementRuleKind, PlacementRuleType, } from '../common/resources/IPlacementRule';
import { Sync } from '../../src/Sync';
import { Placement, Placements } from './Placement';
import { PlacementBindings } from './PlacementBinding';
import { PlacementRule, PlacementRules } from './PlacementRule';
export function PlacementSection(props) {
    const { update } = useData();
    const resources = useItem();
    const editMode = useEditMode();
    const displayMode = useDisplayMode();
    const [placementCount, setPlacementCount] = useState(0);
    const [placementRuleCount, setPlacementRuleCount] = useState(0);
    const [placementBindingCount, setPlacementBindingCount] = useState(0);
    useEffect(() => {
        setPlacementCount(resources?.filter((resource) => resource.kind === PlacementKind).length);
        setPlacementRuleCount(resources?.filter((resource) => resource.kind === PlacementRuleKind).length);
        setPlacementBindingCount(resources?.filter((resource) => resource.kind === PlacementBindingKind).length);
    }, [resources, setPlacementCount, setPlacementRuleCount, setPlacementBindingCount]);
    const [showPlacementSelector, setShowPlacementSelector] = useState(false);
    const [isAdvanced, setIsAdvanced] = useState(false);
    useEffect(() => {
        let isAdvanced = false;
        const placements = resources?.filter((resource) => resource.kind === PlacementKind);
        const placementCount = placements.length;
        const placementRules = resources?.filter((resource) => resource.kind === PlacementRuleKind);
        const placementRuleCount = placementRules.length;
        const placementBindingCount = resources?.filter((resource) => resource.kind === PlacementBindingKind).length;
        if (placementCount + placementRuleCount > 1)
            isAdvanced = true;
        if (placementBindingCount > 1)
            isAdvanced = true;
        for (const placement of placements) {
            if (placement?.spec?.predicates && placement.spec.predicates.length > 1)
                isAdvanced = true;
        }
        if (isAdvanced) {
            setIsAdvanced(isAdvanced);
        }
        else {
            if (editMode === EditMode.Create) {
                setIsAdvanced(false);
            }
            else {
                if (placementCount + placementRuleCount + placementBindingCount === 0) {
                    setIsAdvanced(false);
                }
            }
        }
        if (editMode === EditMode.Create) {
            setShowPlacementSelector(true);
        }
        else {
            if (placements.filter((placement) => placement.metadata?.uid).length === 0 &&
                placementRules.filter((placementRule) => placementRule.metadata?.uid).length === 0) {
                setShowPlacementSelector(true);
            }
            else {
                setShowPlacementSelector(false);
            }
        }
    }, [setIsAdvanced, setShowPlacementSelector, editMode, resources]);
    useEffect(() => {
        const placementCount = resources?.filter((resource) => resource.kind === PlacementKind).length;
        const placementRuleCount = resources?.filter((resource) => resource.kind === PlacementRuleKind).length;
        const placementBindingCount = resources?.filter((resource) => resource.kind === PlacementBindingKind).length;
        if (placementCount === 1 && placementRuleCount === 0 && placementBindingCount === 0) {
            resources.push({
                ...PlacementBindingType,
                metadata: { name: '', namespace: '' },
                placementRef: { apiGroup: PlacementApiGroup, kind: PlacementKind, name: '' },
                subjects: [{ apiGroup: props.bindingSubjectApiGroup, kind: props.bindingSubjectKind, name: '' }],
            });
            update();
        }
        else if (placementCount === 0 && placementRuleCount === 1 && placementBindingCount === 0) {
            resources.push({
                ...PlacementBindingType,
                metadata: { name: '', namespace: '' },
                placementRef: { apiGroup: PlacementApiGroup, kind: PlacementKind, name: '' },
                subjects: [{ apiGroup: props.bindingSubjectApiGroup, kind: props.bindingSubjectKind, name: '' }],
            });
            update();
        }
    }, [props.bindingSubjectApiGroup, props.bindingSubjectKind, resources, update]);
    const { namespacedPlacements = props.existingPlacements, namespacedPlacementRules = props.existingPlacementRules } = useMemo(() => {
        if (!resources.find)
            return {};
        const source = resources?.find((resource) => resource.kind === props.bindingSubjectKind);
        if (!source)
            return {};
        const namespace = source.metadata?.namespace;
        if (!namespace)
            return {};
        const namespacedPlacements = props.existingPlacements.filter((placement) => placement.metadata?.namespace === namespace);
        const namespacedPlacementRules = props.existingPlacementRules.filter((placementRule) => placementRule.metadata?.namespace === namespace);
        return { namespacedPlacements, namespacedPlacementRules };
    }, [props.existingPlacements, props.existingPlacementRules, props.bindingSubjectKind, resources]);
    const namespaceClusterSetNames = useMemo(() => {
        if (!resources.find)
            return [];
        const source = resources?.find((resource) => resource.kind === props.bindingSubjectKind);
        if (!source)
            return [];
        const namespace = source.metadata?.namespace;
        if (!namespace)
            return [];
        return (props.existingClusterSetBindings
            ?.filter((clusterSetBinding) => clusterSetBinding.metadata?.namespace === namespace)
            .filter((clusterSetBinding) => props.existingClusterSets?.find((clusterSet) => clusterSet.metadata?.name === clusterSetBinding.spec?.clusterSet &&
            clusterSet.metadata?.namespace === namespace))
            .map((clusterSetBinding) => clusterSetBinding.spec?.clusterSet ?? '') ?? []);
    }, [props.bindingSubjectKind, props.existingClusterSetBindings, props.existingClusterSets, resources]);
    const setHasInputs = useSetHasInputs();
    useEffect(() => {
        if (displayMode !== DisplayMode.Details) {
            setHasInputs();
        }
    }, [displayMode, setHasInputs]);
    if (isAdvanced) {
        return (_jsxs(Fragment, { children: [(placementCount || (props.defaultPlacementKind === 'Placement' && placementRuleCount === 0)) && (_jsx(Placements, { clusterSets: props.existingClusterSets, clusterSetBindings: props.existingClusterSetBindings, bindingKind: props.bindingSubjectKind, clusters: props.clusters })), (placementRuleCount || (props.defaultPlacementKind === 'PlacementRule' && placementCount === 0)) && (_jsx(PlacementRules, { clusters: props.clusters })), _jsx(PlacementBindings, { placementCount: placementCount, placementRuleCount: placementRuleCount, placementBindingCount: placementBindingCount, bindingSubjectKind: props.bindingSubjectKind, bindingSubjectApiGroup: props.bindingSubjectApiGroup, existingPlacements: namespacedPlacements, existingPlacementRules: namespacedPlacementRules })] }));
    }
    return (_jsxs(Section, { label: "Placement", autohide: false, children: [showPlacementSelector && (_jsx(PlacementSelector, { placementCount: placementCount, placementRuleCount: placementRuleCount, placementBindingCount: placementBindingCount, bindingSubjectKind: props.bindingSubjectKind, bindingSubjectApiGroup: props.bindingSubjectApiGroup, defaultPlacementKind: props.defaultPlacementKind, allowNoPlacement: props.allowNoPlacement, withoutOnlineClusterCondition: props.withoutOnlineClusterCondition })), placementCount === 1 && (_jsxs(Fragment, { children: [editMode === EditMode.Create && (_jsxs(Fragment, { children: [_jsx(Sync, { kind: PlacementKind, path: "metadata.name", targetKind: PlacementBindingKind }), _jsx(Sync, { kind: PlacementKind, path: "metadata.name", targetKind: PlacementBindingKind, targetPath: "placementRef.name" })] })), _jsx(Sync, { kind: PlacementKind, path: "metadata.namespace", targetKind: PlacementBindingKind }), _jsx(WizItemSelector, { selectKey: "kind", selectValue: PlacementKind, children: _jsx(Placement, { namespaceClusterSetNames: namespaceClusterSetNames, clusters: props.clusters }) })] })), placementRuleCount === 1 && (_jsxs(Fragment, { children: [editMode === EditMode.Create && (_jsxs(Fragment, { children: [_jsx(Sync, { kind: PlacementRuleKind, path: "metadata.name", targetKind: PlacementBindingKind }), _jsx(Sync, { kind: PlacementRuleKind, path: "metadata.name", targetKind: PlacementBindingKind, targetPath: "placementRef.name" })] })), _jsx(Sync, { kind: PlacementRuleKind, path: "metadata.namespace", targetKind: PlacementBindingKind }), _jsx(WizItemSelector, { selectKey: "kind", selectValue: PlacementRuleKind, children: _jsx(PlacementRule, { clusters: props.clusters, hideName: true }) })] })), placementCount === 0 && placementRuleCount === 0 && placementBindingCount === 1 && (_jsxs(WizItemSelector, { selectKey: "kind", selectValue: PlacementBindingKind, children: [_jsx(WizSelect, { path: "placementRef.name", label: "Placement", required: true, hidden: (binding) => binding.placementRef?.kind !== PlacementKind, options: namespacedPlacements.map((placement) => placement.metadata?.name ?? '') }), _jsx(WizSingleSelect, { path: "placementRef.name", label: "Placement rule", required: true, hidden: (binding) => binding.placementRef?.kind !== PlacementRuleKind, options: namespacedPlacementRules.map((placement) => placement.metadata?.name ?? '') })] }))] }));
}
export function PlacementSelector(props) {
    const resources = useItem();
    const { placementCount, placementRuleCount, placementBindingCount, bindingSubjectKind } = props;
    const { update } = useData();
    const validate = useValidate();
    return (_jsxs(WizDetailsHidden, { children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx("span", { className: "pf-v6-c-form__label pf-v6-c-form__label-text", children: "How do you want to select clusters?" }), _jsxs(ToggleGroup, { "aria-label": "Default with single selectable", children: [_jsx(ToggleGroupItem, { text: "New placement", isSelected: placementCount + placementRuleCount === 1, onClick: () => {
                                    const bindingSubject = resources.find((resource) => resource.kind === bindingSubjectKind);
                                    let newResources = [...resources];
                                    newResources = resources
                                        .filter((resource) => resource.kind !== PlacementKind)
                                        .filter((resource) => resource.kind !== PlacementRuleKind)
                                        .filter((resource) => resource.kind !== PlacementBindingKind);
                                    const placementName = bindingSubject
                                        ? uniqueResourceName(`${bindingSubject.metadata?.name ?? ''}-placement`, newResources)
                                        : '';
                                    const placementBindingName = bindingSubject
                                        ? uniqueResourceName(`${bindingSubject.metadata?.name ?? ''}-placement-binding`, newResources)
                                        : '';
                                    const namespace = bindingSubject?.metadata?.namespace ?? '';
                                    const placementRefApiGroup = props.defaultPlacementKind === PlacementKind ? PlacementApiGroup : PlacementRuleApiGroup;
                                    if (props.defaultPlacementKind === PlacementKind) {
                                        newResources.push({
                                            apiVersion: PlacementApiVersion,
                                            kind: PlacementKind,
                                            metadata: { name: placementName, namespace },
                                            spec: {},
                                        });
                                    }
                                    else {
                                        newResources.push({
                                            ...PlacementRuleType,
                                            metadata: { name: placementName, namespace },
                                            spec: {
                                                clusterSelector: { matchExpressions: [] },
                                                clusterConditions: props.withoutOnlineClusterCondition
                                                    ? []
                                                    : [
                                                        {
                                                            status: 'True',
                                                            type: 'ManagedClusterConditionAvailable',
                                                        },
                                                    ],
                                            },
                                        });
                                    }
                                    newResources.push({
                                        ...PlacementBindingType,
                                        metadata: { name: placementBindingName, namespace },
                                        placementRef: { apiGroup: placementRefApiGroup, kind: props.defaultPlacementKind, name: placementName },
                                        subjects: [
                                            {
                                                apiGroup: props.bindingSubjectApiGroup,
                                                kind: bindingSubjectKind,
                                                name: bindingSubject?.metadata?.name ?? '',
                                            },
                                        ],
                                    });
                                    update(newResources);
                                } }), _jsx(ToggleGroupItem, { text: "Existing placement", isSelected: placementCount === 0 && placementRuleCount === 0 && placementBindingCount === 1, onClick: () => {
                                    const bindingSubject = resources.find((resource) => resource.kind === bindingSubjectKind);
                                    let newResources = [...resources];
                                    newResources = resources
                                        .filter((resource) => resource.kind !== PlacementKind)
                                        .filter((resource) => resource.kind !== PlacementRuleKind)
                                        .filter((resource) => resource.kind !== PlacementBindingKind);
                                    const placementBindingName = bindingSubject
                                        ? uniqueResourceName(`${bindingSubject.metadata?.name ?? ''}-placement-binding`, newResources)
                                        : '';
                                    const namespace = bindingSubject?.metadata?.namespace ?? '';
                                    const placementRefApiGroup = props.defaultPlacementKind === PlacementKind ? PlacementApiGroup : PlacementRuleApiGroup;
                                    newResources.push({
                                        ...PlacementBindingType,
                                        metadata: {
                                            name: placementBindingName,
                                            namespace: namespace,
                                        },
                                        placementRef: { apiGroup: placementRefApiGroup, kind: props.defaultPlacementKind, name: '' },
                                        subjects: [
                                            {
                                                apiGroup: props.bindingSubjectApiGroup,
                                                kind: props.bindingSubjectKind,
                                                name: bindingSubject?.metadata?.name ?? '',
                                            },
                                        ],
                                    });
                                    update(newResources);
                                } }), props.allowNoPlacement === true ? (_jsx(ToggleGroupItem, { text: "No placement", isSelected: placementCount === 0 && placementRuleCount === 0 && placementBindingCount === 0, onClick: () => {
                                    let newResources = [...resources];
                                    newResources = resources
                                        .filter((resource) => resource.kind !== PlacementKind)
                                        .filter((resource) => resource.kind !== PlacementRuleKind)
                                        .filter((resource) => resource.kind !== PlacementBindingKind);
                                    update(newResources);
                                    validate();
                                } })) : (_jsx(Fragment, {}))] })] }), props.allowNoPlacement === true &&
                placementCount === 0 &&
                placementRuleCount === 0 &&
                placementBindingCount === 0 && (_jsx("p", { className: "pf-v6-c-form__helper-text", children: "Do not add a placement if you want to place this policy using policy set placement." }))] }));
}
function uniqueResourceName(name, resources) {
    if (!name)
        return '';
    let counter = 1;
    let newName = name;
    while (resources.find((resource) => resource.metadata?.name === newName)) {
        newName = name + '-' + (counter++).toString();
    }
    return newName;
}
//# sourceMappingURL=PlacementSection.js.map
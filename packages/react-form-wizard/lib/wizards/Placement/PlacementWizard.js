import { jsx as _jsx } from "react/jsx-runtime";
import { Step, WizardPage } from '../../src';
import { PlacementSection } from './PlacementSection';
export function PlacementWizard(props) {
    return (_jsx(WizardPage, { title: props.title, onSubmit: props.onSubmit, onCancel: props.onCancel, editMode: props.editMode, defaultData: props.resources ?? [], children: _jsx(Step, { label: "Placement", id: "placement", children: _jsx(PlacementSection, { existingPlacements: props.placements, existingPlacementRules: props.placementRules, existingClusterSets: props.clusterSets, existingClusterSetBindings: props.clusterSetBindings, bindingSubjectKind: props.bindingSubjectKind, bindingSubjectApiGroup: props.bindingSubjectApiGroup, defaultPlacementKind: props.defaultPlacementType, clusters: props.clusters }) }) }));
}
//# sourceMappingURL=PlacementWizard.js.map
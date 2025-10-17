import { IResource } from '../../src/common/resource';
import { IClusterSetBinding } from '../common/resources/IClusterSetBinding';
export declare function PlacementSection(props: {
    bindingSubjectKind: string;
    bindingSubjectApiGroup: string;
    existingPlacements: IResource[];
    existingPlacementRules: IResource[];
    existingClusterSets: IResource[];
    existingClusterSetBindings: IClusterSetBinding[];
    defaultPlacementKind: 'Placement' | 'PlacementRule';
    clusters: IResource[];
    createClusterSetCallback?: () => void;
    allowNoPlacement?: boolean;
    withoutOnlineClusterCondition?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function PlacementSelector(props: {
    placementCount: number;
    placementRuleCount: number;
    placementBindingCount: number;
    bindingSubjectKind: string;
    bindingSubjectApiGroup: string;
    defaultPlacementKind: 'Placement' | 'PlacementRule';
    allowNoPlacement?: boolean;
    withoutOnlineClusterCondition?: boolean;
}): import("react/jsx-runtime").JSX.Element;

import { IResource } from '../../src/common/resource';
import { IClusterSetBinding } from '../common/resources/IClusterSetBinding';
export declare function Placements(props: {
    clusterSets: IResource[];
    clusterSetBindings: IClusterSetBinding[];
    bindingKind: string;
    clusters: IResource[];
    createClusterSetCallback?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Placement(props: {
    namespaceClusterSetNames: string[];
    clusters: IResource[];
    hideName?: boolean;
    createClusterSetCallback?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function PlacementPredicate(props: {
    rootPath?: string;
    clusters: IResource[];
}): import("react/jsx-runtime").JSX.Element;
export declare function PredicateSummary(): import("react/jsx-runtime").JSX.Element;

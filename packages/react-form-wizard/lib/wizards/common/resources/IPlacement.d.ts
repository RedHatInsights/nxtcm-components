import { IResource } from '../../../src/common/resource';
import { IExpression } from './IMatchExpression';
export declare const PlacementApiGroup = "cluster.open-cluster-management.io";
export declare const PlacementApiVersion: string;
export declare const PlacementKind = "Placement";
export declare const PlacementType: {
    apiVersion: string;
    kind: string;
};
export type IPlacement = IResource & {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    spec?: {
        clusterSets?: string[];
        numberOfClusters?: number;
        predicates?: Predicate[];
    };
};
export interface Predicate {
    requiredClusterSelector?: {
        labelSelector?: {
            matchLabels?: {
                [key: string]: string;
            };
            matchExpressions?: IExpression[];
        };
        claimSelector?: {
            matchExpressions?: IExpression[];
        };
    };
}

import { IResource } from '../../../src/common/resource';
import { IExpression } from './IMatchExpression';
export declare const PlacementRuleApiGroup = "apps.open-cluster-management.io";
export declare const PlacementRuleApiVersion: string;
export declare const PlacementRuleKind = "PlacementRule";
export declare const PlacementRuleType: {
    apiVersion: string;
    kind: string;
};
export type IPlacementRule = IResource & {
    spec?: {
        clusterConditions?: {
            status?: string;
            type?: string;
        }[];
        clusterReplicas?: number;
        clusterSelector?: {
            matchExpressions?: IExpression[];
            matchLabels?: Record<string, string>;
        };
        clusters?: {
            name?: string;
        }[];
        policies?: {
            apiVersion?: string;
            fieldPath?: string;
            kind?: string;
            name?: string;
            namespace?: string;
            resourceVersion?: string;
            uid?: string;
        }[];
        resourceHint?: {
            order?: string;
            type?: string;
        };
        schedulerName?: string;
    };
};

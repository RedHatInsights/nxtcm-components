import { IResource } from '../../../src/common/resource';
export declare const PlacementBindingApiGroup = "policy.open-cluster-management.io";
export declare const PlacementBindingApiVersion: string;
export declare const PlacementBindingKind = "PlacementBinding";
export declare const PlacementBindingType: {
    apiVersion: string;
    kind: string;
};
export type IPlacementBinding = IResource & {};
export interface IPlacementSubject {
    name?: string;
    kind?: string;
    apiGroup?: string;
}

import { IResource } from '../../../src/common/resource';
export declare const ConfigMapApiVersion = "v1";
export type ConfigMapApiVersionType = 'v1';
export declare const ConfigMapKind = "ConfigMap";
export type ConfigMapKindType = 'ConfigMap';
export interface ConfigMap extends IResource {
    apiVersion: ConfigMapApiVersionType;
    kind: ConfigMapKindType;
    metadata: {
        name?: string;
        namespace?: string;
    };
    data?: Record<string, any>;
}

import { IResource } from '../../../src/common/resource';
export declare const PolicyAutomationGroup = "policy.open-cluster-management.io";
export declare const PolicyAutomationApiVersion = "policy.open-cluster-management.io/v1beta1";
export declare const PolicyAutomationKind = "PolicyAutomation";
export declare const PolicyAutomationType: {
    apiVersion: string;
    kind: string;
};
export interface IPolicyAutomation extends IResource {
    apiVersion: 'policy.open-cluster-management.io/v1beta1';
    kind: 'PolicyAutomation';
    spec: {
        policyRef: string;
        mode: 'once' | 'disabled' | 'everyEvent';
        automationDef: {
            name: string;
            secret: string;
            type?: string;
            extra_vars?: Record<string, string>;
        };
        eventHook?: 'noncompliant';
        rescanAfter?: string;
        delayAfterRunSeconds?: number;
    };
}

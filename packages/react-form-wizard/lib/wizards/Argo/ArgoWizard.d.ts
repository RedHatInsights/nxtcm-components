import { ReactNode } from 'react';
import { WizardCancel, WizardSubmit } from '../../src';
import { IResource } from '../../src/common/resource';
import { IClusterSetBinding } from '../common/resources/IClusterSetBinding';
import { IPlacement } from '../common/resources/IPlacement';
interface Channel {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    spec: {
        pathname: string;
        type: string;
        secretRef?: {
            name: string;
        };
    };
}
interface ApplicationSet {
    metadata: {
        name?: string;
        namespace?: string;
    };
    spec: {
        generators?: {
            clusterDecisionResource?: {
                configMapRef?: string;
                requeueAfterSeconds?: number;
            };
        }[];
        template?: {
            metadata?: {
                name?: string;
                namespace?: string;
            };
            spec?: {
                destination?: {
                    namespace: string;
                    server: string;
                };
                project: string;
                source: {
                    path?: string;
                    repoURL: string;
                    targetRevision?: string;
                    chart?: string;
                };
                syncPolicy?: any;
            };
        };
    };
    transformed?: {
        clusterCount?: string;
    };
}
interface ArgoWizardProps {
    breadcrumb?: {
        label: string;
        to?: string;
    }[];
    applicationSets?: ApplicationSet[];
    createClusterSetCallback?: () => void;
    clusters: IResource[];
    clusterSets: IResource[];
    clusterSetBindings: IClusterSetBinding[];
    ansibleCredentials: string[];
    argoServers: {
        label: string;
        value: string;
        description?: string;
    }[];
    namespaces: string[];
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    placements: IPlacement[];
    channels?: Channel[];
    timeZones: string[];
    getGitRevisions: (channelPath: string, secretArgs?: {
        secretRef?: string | undefined;
        namespace?: string | undefined;
    } | undefined) => Promise<unknown>;
    getGitPaths: (channelPath: string, branch: string, secretArgs?: {
        secretRef?: string | undefined;
        namespace?: string | undefined;
    } | undefined) => Promise<unknown>;
    resources?: IResource[];
    yamlEditor?: () => ReactNode;
}
export declare function ArgoWizard(props: ArgoWizardProps): import("react/jsx-runtime").JSX.Element;
export declare function DeploymentWindow(props: {
    timeZone: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function TimeWindow(props: {
    timeZone: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function ExternalLinkButton(props: {
    id: string;
    href?: string;
    icon?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};

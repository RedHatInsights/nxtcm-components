import { ReactNode } from 'react';
import { WizardCancel, WizardSubmit } from '../../src';
interface ApplicationWizardProps {
    addClusterSets?: string;
    ansibleCredentials: string[];
    argoServers: string[];
    namespaces: string[];
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    placements: string[];
    channels: Channel[];
    timeZones: string[];
}
interface Channel {
    metadata: {
        name: string;
        namespace: string;
    };
    spec: {
        pathname: string;
        type: string;
        secretRef?: {
            name: string;
        };
    };
}
export declare function ApplicationWizard(props: ApplicationWizardProps): import("react/jsx-runtime").JSX.Element;
export declare function Placement(props: {
    placements: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function AnsibleCredentials(props: {
    ansibleCredentials: string[];
}): import("react/jsx-runtime").JSX.Element;
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

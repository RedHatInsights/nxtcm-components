import { ReactNode } from 'react';
import { EditMode, WizardCancel, WizardSubmit } from '../../src';
import { IResource } from '../../src/common/resource';
import { ConfigMap } from '../common/resources/IConfigMap';
import { ICredential } from '../common/resources/ICredential';
import { IPolicyAutomation } from '../common/resources/IPolicyAutomation';
export declare function PolicyAutomationWizard(props: {
    title: string;
    breadcrumb?: {
        label: string;
        to?: string;
    }[];
    policy: IResource;
    credentials: IResource[];
    configMaps?: ConfigMap[];
    createCredentialsCallback: () => void;
    editMode?: EditMode;
    yamlEditor?: () => ReactNode;
    resource: IPolicyAutomation;
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    getAnsibleJobsCallback: (credential: ICredential) => Promise<string[]>;
    isAnsibleOperatorInstalled: boolean;
}): import("react/jsx-runtime").JSX.Element;

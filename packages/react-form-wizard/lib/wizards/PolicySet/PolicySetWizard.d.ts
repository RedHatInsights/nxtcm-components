import { ReactNode } from 'react';
import { EditMode, WizardCancel, WizardSubmit } from '../../src';
import { IResource } from '../../src/common/resource';
import { IClusterSetBinding } from '../common/resources/IClusterSetBinding';
export interface PolicySetWizardProps {
    breadcrumb?: {
        label: string;
        to?: string;
    }[];
    title: string;
    namespaces: string[];
    policies: IResource[];
    placements: IResource[];
    placementRules: IResource[];
    clusters: IResource[];
    clusterSets: IResource[];
    clusterSetBindings: IClusterSetBinding[];
    editMode?: EditMode;
    resources?: IResource[];
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    yamlEditor?: () => ReactNode;
}
export declare function PolicySetWizard(props: PolicySetWizardProps): import("react/jsx-runtime").JSX.Element;

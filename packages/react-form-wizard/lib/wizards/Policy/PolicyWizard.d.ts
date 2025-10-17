import { ReactNode } from 'react';
import { EditMode, WizardCancel, WizardSubmit } from '../../src';
import { IResource } from '../../src/common/resource';
import { IClusterSetBinding } from '../common/resources/IClusterSetBinding';
export declare function PolicyWizard(props: {
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
    yamlEditor?: () => ReactNode;
    gitSource?: string;
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
}): import("react/jsx-runtime").JSX.Element;
export declare function PolicyWizardTemplates(props: {
    policies: IResource[];
}): import("react/jsx-runtime").JSX.Element;

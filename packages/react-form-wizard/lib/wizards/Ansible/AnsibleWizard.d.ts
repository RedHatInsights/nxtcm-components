import { WizardCancel, WizardSubmit } from '../../src';
export declare function AnsibleWizard(props: {
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    credentials: string[];
    namespaces: string[];
    data?: any;
    breadcrumb?: {
        label: string;
        to?: string;
    }[];
}): import("react/jsx-runtime").JSX.Element;

import { ReactNode } from 'react';
import { WizardProps } from './Wizard';
export type WizardPageProps = {
    breadcrumb?: {
        label: string;
        to?: string;
    }[];
    yaml?: boolean;
    yamlEditor?: () => ReactNode;
} & WizardProps;
export declare function WizardPage(props: WizardPageProps): import("react/jsx-runtime").JSX.Element;

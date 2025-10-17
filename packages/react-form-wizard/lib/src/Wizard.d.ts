import { ReactNode } from 'react';
import { EditMode } from '.';
import { WizardStrings } from './contexts/StringContext';
export interface WizardProps {
    wizardStrings?: WizardStrings;
    title: string;
    description?: string;
    children: ReactNode;
    defaultData?: object;
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
    hasButtons?: boolean;
    editMode?: EditMode;
    yamlEditor?: () => ReactNode;
    submitButtonText?: string;
    submittingButtonText?: string;
}
export type WizardSubmit = (data: unknown) => Promise<void>;
export type WizardCancel = () => void;
export declare function Wizard(props: WizardProps & {
    showHeader?: boolean;
    showYaml?: boolean;
}): import("react/jsx-runtime").JSX.Element;

import { ReactNode } from 'react';
import { HiddenFn } from './inputs/Input';
type SectionProps = {
    id?: string;
    label: string;
    description?: ReactNode;
    prompt?: string;
    children?: ReactNode;
    defaultExpanded?: boolean;
    labelHelpTitle?: string;
    labelHelp?: string;
    hidden?: HiddenFn;
    collapsable?: boolean;
    autohide?: boolean;
};
export declare function Section(props: SectionProps): import("react/jsx-runtime").JSX.Element;
export {};

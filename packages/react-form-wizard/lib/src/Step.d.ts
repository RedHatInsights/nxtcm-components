import { ReactNode } from 'react';
import { HiddenFn } from './inputs/Input';
export interface StepProps {
    label: string;
    children?: ReactNode;
    id: string;
    hidden?: HiddenFn;
    autohide?: boolean;
}
export declare function Step(props: StepProps): import("react/jsx-runtime").JSX.Element;
export declare function StepInternal(props: StepProps): import("react/jsx-runtime").JSX.Element;

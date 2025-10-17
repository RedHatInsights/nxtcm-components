import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
export type WizSwitchProps = InputCommonProps & {
    children?: ReactNode;
    title?: string;
};
export declare function WizSwitch(props: WizSwitchProps): import("react/jsx-runtime").JSX.Element;

import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
export type WizCheckboxProps = InputCommonProps & {
    children?: ReactNode;
    title?: string;
};
export declare function WizCheckbox(props: WizCheckboxProps): import("react/jsx-runtime").JSX.Element;

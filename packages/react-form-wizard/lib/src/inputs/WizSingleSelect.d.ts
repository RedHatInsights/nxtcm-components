import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
import './Select.css';
export type WizSingleSelectProps = InputCommonProps<string> & {
    label: string;
    placeholder?: string;
    isCreatable?: boolean;
    footer?: ReactNode;
    options: string[];
};
export declare function WizSingleSelect(props: WizSingleSelectProps): import("react/jsx-runtime").JSX.Element | null;

import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
import './Select.css';
export type WizMultiSelectProps = InputCommonProps<string[]> & {
    placeholder?: string;
    footer?: ReactNode;
    label: string;
    isCreatable?: boolean;
    options: string[];
};
export declare function WizMultiSelect(props: WizMultiSelectProps): import("react/jsx-runtime").JSX.Element | null;

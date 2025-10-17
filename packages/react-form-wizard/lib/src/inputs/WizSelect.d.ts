import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
import './Select.css';
export interface Option<T> {
    id?: string;
    label: string;
    description?: string;
    value: T;
    disabled?: boolean;
}
export type OptionType<T> = Omit<Option<T>, 'value'> & {
    value: string | number | T;
    keyedValue: string | number;
};
export interface OptionGroup<T> {
    id?: string;
    label: string;
    options: (Option<T> | string | number)[] | undefined;
}
type WizSelectCommonProps<T> = InputCommonProps<T> & {
    placeholder?: string;
    footer?: ReactNode;
    label: string;
    keyPath?: string;
    isCreatable?: boolean;
    onCreate?: (value: string) => void;
};
interface WizSelectSingleProps<T> extends WizSelectCommonProps<T> {
    variant: 'single';
    options?: (Option<T> | string | number)[];
}
export declare function WizSelect<T>(props: Omit<WizSelectSingleProps<T>, 'variant'>): import("react/jsx-runtime").JSX.Element;
export {};

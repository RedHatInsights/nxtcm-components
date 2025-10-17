import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
export interface IRadioGroupContextState {
    value?: any;
    setValue?: (value: any) => void;
    readonly?: boolean;
    disabled?: boolean;
    radioGroup?: string;
}
export declare const RadioGroupContext: import("react").Context<IRadioGroupContextState>;
export type WizRadioGroupProps = InputCommonProps & {
    children?: ReactNode;
};
export declare function WizRadioGroup(props: WizRadioGroupProps): import("react/jsx-runtime").JSX.Element;
export declare function Radio(props: {
    id: string;
    label: string;
    value: string | number | boolean | undefined;
    description?: string;
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

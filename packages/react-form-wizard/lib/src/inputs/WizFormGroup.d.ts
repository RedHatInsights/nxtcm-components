import { PropsWithChildren } from 'react';
import { InputCommonProps } from './Input';
type WizFormGroupProps = InputCommonProps & {
    noHelperText?: boolean;
};
export declare function WizFormGroup(props: PropsWithChildren<WizFormGroupProps>): import("react/jsx-runtime").JSX.Element;
export {};

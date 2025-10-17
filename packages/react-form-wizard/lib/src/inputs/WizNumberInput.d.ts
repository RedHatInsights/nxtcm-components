import { InputCommonProps } from './Input';
export type WizNumberInputProps = InputCommonProps<string> & {
    label: string;
    placeholder?: string;
    secret?: boolean;
    min?: number;
    max?: number;
    zeroIsUndefined?: boolean;
};
export declare function WizNumberInput(props: WizNumberInputProps): import("react/jsx-runtime").JSX.Element;

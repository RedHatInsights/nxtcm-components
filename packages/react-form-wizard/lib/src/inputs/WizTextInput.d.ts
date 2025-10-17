import { InputCommonProps } from './Input';
export type WizTextInputProps = InputCommonProps<string> & {
    placeholder?: string;
    secret?: boolean;
    canPaste?: boolean;
};
export declare function WizTextInput(props: WizTextInputProps): import("react/jsx-runtime").JSX.Element;

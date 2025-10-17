import { InputCommonProps } from './Input';
export type WizTextAreaProps = InputCommonProps<string> & {
    label: string;
    placeholder?: string;
    secret?: boolean;
    canPaste?: boolean;
};
export declare function WizTextArea(props: WizTextAreaProps): import("react/jsx-runtime").JSX.Element;

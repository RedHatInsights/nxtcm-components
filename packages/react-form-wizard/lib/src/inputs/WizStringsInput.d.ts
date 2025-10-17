import { InputCommonProps } from './Input';
export type WizStringsInputProps = InputCommonProps & {
    placeholder?: string;
};
export declare function WizStringsInput(props: WizStringsInputProps): import("react/jsx-runtime").JSX.Element;
type StringsMapInputProps = WizStringsInputProps & {
    map?: (value: any) => string[];
    unmap?: (values: string[]) => any;
};
export declare function StringsMapInput(props: StringsMapInputProps): import("react/jsx-runtime").JSX.Element;
export {};

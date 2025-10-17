import { ReactNode } from 'react';
export type HiddenFn = (item: any) => boolean;
export type InputCommonProps<ValueT = any> = {
    id?: string;
    path: string;
    hidden?: (item: any) => boolean;
    validation?: (value: ValueT, item?: unknown) => string | undefined;
    required?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    label?: string;
    labelHelp?: ReactNode;
    labelHelpTitle?: string;
    helperText?: ReactNode;
    prompt?: {
        label?: string;
        href?: string;
        isDisabled?: boolean;
    };
    disabledInEditMode?: boolean;
    inputValueToPathValue?: (inputValue: unknown, pathValue: unknown) => unknown;
    pathValueToInputValue?: (pathValue: unknown) => unknown;
    onValueChange?: (value: unknown, item?: any) => void;
};
export declare function convertId(props: {
    id?: string;
    path: string;
}): string;
export declare function useValue(props: Pick<InputCommonProps, 'id' | 'path' | 'label' | 'inputValueToPathValue' | 'pathValueToInputValue' | 'onValueChange'>, defaultValue: any): [value: any, setValue: (value: any) => void];
export declare function useInputValidation(props: Pick<InputCommonProps, 'id' | 'path' | 'label' | 'required' | 'validation'>): {
    validated: "error" | undefined;
    error: string | undefined;
};
export declare function useInputHidden(props: {
    hidden?: (item: any) => boolean;
}): boolean;
export declare function useInput(props: InputCommonProps): {
    id: string;
    displayMode: import("..").DisplayMode;
    value: any;
    setValue: (value: any) => void;
    validated: "error" | undefined;
    error: string | undefined;
    hidden: boolean;
    disabled: boolean | undefined;
    path: string;
    validation?: ((value: any, item?: unknown) => string | undefined) | undefined;
    required?: boolean | undefined;
    readonly?: boolean | undefined;
    label?: string | undefined;
    labelHelp?: ReactNode;
    labelHelpTitle?: string | undefined;
    helperText?: ReactNode;
    prompt?: {
        label?: string | undefined;
        href?: string | undefined;
        isDisabled?: boolean | undefined;
    } | undefined;
    disabledInEditMode?: boolean | undefined;
    inputValueToPathValue?: ((inputValue: unknown, pathValue: unknown) => unknown) | undefined;
    pathValueToInputValue?: ((pathValue: unknown) => unknown) | undefined;
    onValueChange?: ((value: unknown, item?: any) => void) | undefined;
};
export declare function getEnterPlaceholder(props: {
    label?: string;
    placeholder?: string;
}): string;
export declare function getSelectPlaceholder(props: {
    label: string;
    placeholder?: string;
}): string;
export declare function getCollapsedPlaceholder(props: {
    collapsedPlaceholder?: ReactNode;
}): string | number | boolean | import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode>;
export declare function getAddPlaceholder(props: {
    placeholder?: string;
}): string;

import { ReactNode } from 'react';
export declare function useSetShowValidation(): (show: boolean) => void;
export declare const ShowValidationContext: import("react").Context<boolean>;
export declare function useShowValidation(): boolean;
export declare function ShowValidationProvider(props: {
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

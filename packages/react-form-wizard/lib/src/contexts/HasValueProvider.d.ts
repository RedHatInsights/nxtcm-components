import { ReactNode } from 'react';
export declare const useSetHasValue: () => () => void;
export declare const HasValueContext: import("react").Context<boolean>;
export declare const useHasValue: () => boolean;
export declare const useUpdateHasValue: () => () => void;
export declare function HasValueProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

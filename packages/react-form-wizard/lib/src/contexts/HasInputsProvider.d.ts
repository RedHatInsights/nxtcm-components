import { ReactNode } from 'react';
export declare const useSetHasInputs: () => () => void;
export declare const HasInputsContext: import("react").Context<boolean>;
export declare const useHasInputs: () => boolean;
export declare const useUpdateHasInputs: () => () => void;
export declare function HasInputsProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

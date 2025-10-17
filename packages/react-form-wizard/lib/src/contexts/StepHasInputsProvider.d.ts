import { ReactNode } from 'react';
export declare const useSetStepHasInputs: () => (id: string, has: boolean) => void;
export declare const useStepHasInputs: () => Record<string, boolean>;
export declare function StepHasInputsProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

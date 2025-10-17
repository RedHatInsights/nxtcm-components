import { ReactNode } from 'react';
export declare const useSetStepShowValidation: () => (id: string, has: boolean) => void;
export declare const useStepShowValidation: () => Record<string, boolean>;
export declare function StepShowValidationProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

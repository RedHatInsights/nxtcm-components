import { ReactNode } from 'react';
export declare const useSetStepHasValidationError: () => (id: string, hasError: boolean) => void;
export declare const StepHasValidationErrorContext: import("react").Context<Record<string, boolean>>;
export declare const useStepHasValidationError: () => Record<string, boolean>;
export declare function StepValidationProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

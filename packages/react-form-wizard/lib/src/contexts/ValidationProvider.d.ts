import { ReactNode } from 'react';
export declare enum EditorValidationStatus {
    success = "success",
    pending = "pending",
    failure = "failure"
}
export declare const EditorValidationStatusContext: import("react").Context<{
    editorValidationStatus: EditorValidationStatus;
    setEditorValidationStatus: (status: EditorValidationStatus) => void;
}>;
export declare const useEditorValidationStatus: () => {
    editorValidationStatus: EditorValidationStatus;
    setEditorValidationStatus: (status: EditorValidationStatus) => void;
};
export declare const useSetHasValidationError: () => () => void;
export declare const HasValidationErrorContext: import("react").Context<boolean>;
export declare const useHasValidationError: () => boolean;
export declare const useValidate: () => () => void;
export declare function ValidationProvider(props: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

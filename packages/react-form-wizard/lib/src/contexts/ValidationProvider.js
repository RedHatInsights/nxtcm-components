import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
export var EditorValidationStatus;
(function (EditorValidationStatus) {
    EditorValidationStatus["success"] = "success";
    EditorValidationStatus["pending"] = "pending";
    EditorValidationStatus["failure"] = "failure";
})(EditorValidationStatus || (EditorValidationStatus = {}));
export const EditorValidationStatusContext = createContext({
    editorValidationStatus: EditorValidationStatus.success,
    setEditorValidationStatus: () => void 0,
});
export const useEditorValidationStatus = () => useContext(EditorValidationStatusContext);
const SetHasValidationErrorContext = createContext(() => null);
SetHasValidationErrorContext.displayName = 'SetHasValidationErrorContext';
export const useSetHasValidationError = () => useContext(SetHasValidationErrorContext);
export const HasValidationErrorContext = createContext(true);
HasValidationErrorContext.displayName = 'HasValidationErrorContext';
export const useHasValidationError = () => useContext(HasValidationErrorContext);
const ValidateContext = createContext(() => null);
ValidateContext.displayName = 'ValidateContext';
export const useValidate = () => useContext(ValidateContext);
export function ValidationProvider(props) {
    const [editorValidationStatus, setEditorValidationStatus] = useState(EditorValidationStatus.success);
    const [hasValidationError, setHasValidationErrorState] = useState(false);
    const [previousHasValidationError, setPreviousHasValidationError] = useState(false);
    const setHasValidationError = useCallback(() => {
        if (!hasValidationError) {
            setHasValidationErrorState(true);
        }
    }, [hasValidationError, setHasValidationErrorState]);
    const validate = useCallback(() => {
        setHasValidationErrorState(false);
    }, [setHasValidationErrorState]);
    const parentValidate = useContext(ValidateContext);
    if (hasValidationError !== previousHasValidationError) {
        setPreviousHasValidationError(hasValidationError);
        if (!hasValidationError) {
            parentValidate();
        }
    }
    useLayoutEffect(() => () => {
        parentValidate();
    }, [parentValidate]);
    const parentSetHasValidationError = useContext(SetHasValidationErrorContext);
    useLayoutEffect(() => {
        if (hasValidationError)
            parentSetHasValidationError?.();
    }, [parentSetHasValidationError, hasValidationError]);
    return (_jsx(ValidateContext.Provider, { value: validate, children: _jsx(EditorValidationStatusContext.Provider, { value: { editorValidationStatus, setEditorValidationStatus }, children: _jsx(SetHasValidationErrorContext.Provider, { value: setHasValidationError, children: _jsx(HasValidationErrorContext.Provider, { value: hasValidationError, children: props.children }) }) }) }));
}
//# sourceMappingURL=ValidationProvider.js.map
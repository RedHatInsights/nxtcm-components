import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const SetShowValidationContext = createContext(() => null);
SetShowValidationContext.displayName = 'SetShowValidationContexts';
export function useSetShowValidation() {
    return useContext(SetShowValidationContext);
}
export const ShowValidationContext = createContext(false);
ShowValidationContext.displayName = 'ShowValidationContext';
export function useShowValidation() {
    return useContext(ShowValidationContext);
}
export function ShowValidationProvider(props) {
    const [showValidation, setShowValidation] = useState(false);
    const parentShowValidationContext = useContext(ShowValidationContext);
    const activeShowValidation = showValidation || parentShowValidationContext;
    return (_jsx(SetShowValidationContext.Provider, { value: setShowValidation, children: _jsx(ShowValidationContext.Provider, { value: activeShowValidation, children: props.children }) }));
}
//# sourceMappingURL=ShowValidationProvider.js.map
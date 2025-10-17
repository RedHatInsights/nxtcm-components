import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
const SetHasValueContext = createContext(() => null);
SetHasValueContext.displayName = 'SetHasValueContext';
export const useSetHasValue = () => useContext(SetHasValueContext);
export const HasValueContext = createContext(false);
HasValueContext.displayName = 'HasValueContext';
export const useHasValue = () => useContext(HasValueContext);
const UpdateHasValueContext = createContext(() => null);
UpdateHasValueContext.displayName = 'UpdateHasValueContext';
export const useUpdateHasValue = () => useContext(UpdateHasValueContext);
export function HasValueProvider(props) {
    const [hasValue, setHasValueState] = useState(false);
    const [setHasValue, setHasValueFunction] = useState(() => () => setHasValueState(true));
    const validate = useCallback(() => {
        setHasValueState(false);
        setHasValueFunction(() => () => setHasValueState(true));
    }, []);
    useLayoutEffect(() => {
        validate();
    }, [validate]);
    const parentUpdateHasValue = useContext(UpdateHasValueContext);
    useLayoutEffect(() => {
        if (!hasValue)
            parentUpdateHasValue?.();
    }, [parentUpdateHasValue, hasValue]);
    useLayoutEffect(() => () => {
        if (parentUpdateHasValue)
            parentUpdateHasValue();
    }, [parentUpdateHasValue]);
    const parentSetHasValue = useContext(SetHasValueContext);
    useLayoutEffect(() => {
        if (hasValue)
            parentSetHasValue?.();
    }, [parentSetHasValue, hasValue]);
    return (_jsx(UpdateHasValueContext.Provider, { value: validate, children: _jsx(SetHasValueContext.Provider, { value: setHasValue, children: _jsx(HasValueContext.Provider, { value: hasValue, children: props.children }) }) }));
}
//# sourceMappingURL=HasValueProvider.js.map
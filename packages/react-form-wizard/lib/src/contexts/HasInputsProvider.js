import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
const SetHasInputsContext = createContext(() => null);
SetHasInputsContext.displayName = 'SetHasInputsContext';
export const useSetHasInputs = () => useContext(SetHasInputsContext);
export const HasInputsContext = createContext(false);
HasInputsContext.displayName = 'HasInputsContext';
export const useHasInputs = () => useContext(HasInputsContext);
const UpdateHasInputsContext = createContext(() => null);
UpdateHasInputsContext.displayName = 'UpdateHasInputsContext';
export const useUpdateHasInputs = () => useContext(UpdateHasInputsContext);
export function HasInputsProvider(props) {
    const parentHasInputs = useContext(HasInputsContext);
    const parentSetHasInputs = useContext(SetHasInputsContext);
    const parentUpdateHasInputs = useContext(UpdateHasInputsContext);
    const [hasInputs, setHasInputsState] = useState(false);
    const setHasInputs = useCallback(() => {
        setHasInputsState(true);
    }, [setHasInputsState]);
    if (hasInputs && !parentHasInputs) {
        parentSetHasInputs();
    }
    const updateHasInputs = useCallback(() => {
        setHasInputsState(false);
        parentUpdateHasInputs();
    }, [setHasInputsState, parentUpdateHasInputs]);
    useLayoutEffect(() => () => {
        parentUpdateHasInputs();
    }, [parentUpdateHasInputs]);
    return (_jsx(UpdateHasInputsContext.Provider, { value: updateHasInputs, children: _jsx(SetHasInputsContext.Provider, { value: setHasInputs, children: _jsx(HasInputsContext.Provider, { value: hasInputs, children: props.children }) }) }));
}
//# sourceMappingURL=HasInputsProvider.js.map
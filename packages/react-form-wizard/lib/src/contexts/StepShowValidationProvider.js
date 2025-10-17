import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { useItem } from './ItemContext';
const StepSetShowValidationContext = createContext(() => null);
StepSetShowValidationContext.displayName = 'StepSetShowValidationContext';
export const useSetStepShowValidation = () => useContext(StepSetShowValidationContext);
const StepShowValidationContext = createContext({});
StepShowValidationContext.displayName = 'StepShowValidationContext';
export const useStepShowValidation = () => useContext(StepShowValidationContext);
export function StepShowValidationProvider(props) {
    const [hasStepInputs, setHasStepInputsState] = useState({});
    const [setShowValidation, setShowValidationFunction] = useState(() => () => null);
    const refreshStepShowValidation = useCallback(() => {
        setHasStepInputsState({});
        setShowValidationFunction(() => (id, has) => {
            setHasStepInputsState((state) => {
                if (has && state[id] !== true) {
                    state = { ...state };
                    state[id] = true;
                }
                else if (!has && state[id] !== undefined) {
                    state = { ...state };
                    delete state[id];
                }
                return state;
            });
        });
    }, []);
    const item = useItem();
    useLayoutEffect(() => {
        refreshStepShowValidation();
    }, [item, refreshStepShowValidation]);
    return (_jsx(StepSetShowValidationContext.Provider, { value: setShowValidation, children: _jsx(StepShowValidationContext.Provider, { value: hasStepInputs, children: props.children }) }));
}
//# sourceMappingURL=StepShowValidationProvider.js.map
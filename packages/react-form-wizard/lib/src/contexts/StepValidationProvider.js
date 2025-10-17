import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { useItem } from './ItemContext';
const StepSetHasValidationErrorContext = createContext(() => null);
StepSetHasValidationErrorContext.displayName = 'StepSetHasValidationErrorContext';
export const useSetStepHasValidationError = () => useContext(StepSetHasValidationErrorContext);
export const StepHasValidationErrorContext = createContext({});
StepHasValidationErrorContext.displayName = 'StepHasValidationErrorContext';
export const useStepHasValidationError = () => useContext(StepHasValidationErrorContext);
export function StepValidationProvider(props) {
    const item = useItem();
    const [hasStepValidationErrors, setHasStepValidationErrorsState] = useState({});
    const [setHasValidationErrors, setHasValidationErrorsFunction] = useState(() => () => null);
    const validateSteps = useCallback(() => {
        setHasStepValidationErrorsState({});
        setHasValidationErrorsFunction(() => (id, hasError) => {
            setHasStepValidationErrorsState((state) => {
                if (hasError && state[id] !== true) {
                    state = { ...state };
                    state[id] = true;
                }
                else if (!hasError && state[id] !== undefined) {
                    state = { ...state };
                    delete state[id];
                }
                return state;
            });
        });
    }, []);
    useLayoutEffect(() => {
        validateSteps();
    }, [item, validateSteps]);
    return (_jsx(StepSetHasValidationErrorContext.Provider, { value: setHasValidationErrors, children: _jsx(StepHasValidationErrorContext.Provider, { value: hasStepValidationErrors, children: props.children }) }));
}
//# sourceMappingURL=StepValidationProvider.js.map
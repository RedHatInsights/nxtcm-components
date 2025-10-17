import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { useItem } from './ItemContext';
const StepSetHasInputsContext = createContext(() => null);
StepSetHasInputsContext.displayName = 'StepSetHasInputsContext';
export const useSetStepHasInputs = () => useContext(StepSetHasInputsContext);
const StepHasInputsContext = createContext({});
StepHasInputsContext.displayName = 'StepHasInputsContext';
export const useStepHasInputs = () => useContext(StepHasInputsContext);
export function StepHasInputsProvider(props) {
    const [hasStepInputs, setHasStepInputsState] = useState({});
    const [setHasInputs, setHasInputsFunction] = useState(() => () => null);
    const refreshStepInputs = useCallback(() => {
        setHasStepInputsState({});
        setHasInputsFunction(() => (id, has) => {
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
        refreshStepInputs();
    }, [item, refreshStepInputs]);
    return (_jsx(StepSetHasInputsContext.Provider, { value: setHasInputs, children: _jsx(StepHasInputsContext.Provider, { value: hasStepInputs, children: props.children }) }));
}
//# sourceMappingURL=StepHasInputsProvider.js.map
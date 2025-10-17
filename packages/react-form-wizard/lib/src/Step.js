import { jsx as _jsx } from "react/jsx-runtime";
import { Form } from '@patternfly/react-core';
import { Fragment, useLayoutEffect } from 'react';
import { DisplayMode, useDisplayMode } from './contexts/DisplayModeContext';
import { HasInputsProvider, useHasInputs } from './contexts/HasInputsProvider';
import { ShowValidationProvider, useSetShowValidation } from './contexts/ShowValidationProvider';
import { useSetStepHasInputs } from './contexts/StepHasInputsProvider';
import { useStepShowValidation } from './contexts/StepShowValidationProvider';
import { useSetStepHasValidationError } from './contexts/StepValidationProvider';
import { useHasValidationError, ValidationProvider } from './contexts/ValidationProvider';
import { useInputHidden } from './inputs/Input';
export function Step(props) {
    return (_jsx("div", { id: props.id, children: _jsx(HasInputsProvider, { children: _jsx(ShowValidationProvider, { children: _jsx(ValidationProvider, { children: _jsx(StepInternal, { ...props, children: props.children }) }) }) }, props.id) }));
}
export function StepInternal(props) {
    const displayMode = useDisplayMode();
    const setShowValidation = useSetShowValidation();
    const stepShowValidation = useStepShowValidation();
    useLayoutEffect(() => {
        if (displayMode !== DisplayMode.Details) {
            if (stepShowValidation[props.id]) {
                setShowValidation(true);
            }
        }
    }, [displayMode, props.id, setShowValidation, stepShowValidation]);
    const hasValidationError = useHasValidationError();
    const setStepHasValidationError = useSetStepHasValidationError();
    useLayoutEffect(() => {
        if (displayMode !== DisplayMode.Details)
            setStepHasValidationError(props.id, hasValidationError);
    }, [hasValidationError, displayMode, props.id, setStepHasValidationError]);
    const hasInputs = useHasInputs();
    const setStepHasInputs = useSetStepHasInputs();
    useLayoutEffect(() => {
        if (displayMode !== DisplayMode.Details) {
            setStepHasInputs(props.id, hasInputs);
        }
    }, [hasInputs, displayMode, props.id, setStepHasInputs]);
    const hidden = useInputHidden(props);
    if (hidden && props.autohide !== false)
        return _jsx(Fragment, {});
    if (displayMode === DisplayMode.Details) {
        return _jsx(Fragment, { children: props.children });
    }
    return (_jsx(Form, { onSubmit: (event) => {
            event.preventDefault();
        }, children: props.children }));
}
//# sourceMappingURL=Step.js.map
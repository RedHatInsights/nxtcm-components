import get from 'get-value';
import { useCallback, useContext, useState } from 'react';
import set from 'set-value';
import { EditMode } from '..';
import { useData } from '../contexts/DataContext';
import { useDisplayMode } from '../contexts/DisplayModeContext';
import { useEditMode } from '../contexts/EditModeContext';
import { useHasInputs, useSetHasInputs, useUpdateHasInputs } from '../contexts/HasInputsProvider';
import { useHasValue, useSetHasValue } from '../contexts/HasValueProvider';
import { ItemContext } from '../contexts/ItemContext';
import { useShowValidation } from '../contexts/ShowValidationProvider';
import { useStringContext } from '../contexts/StringContext';
import { useHasValidationError, useSetHasValidationError, useValidate } from '../contexts/ValidationProvider';
export function convertId(props) {
    if (props.id)
        return props.id;
    return props.path?.toLowerCase().split('.').join('-') ?? '';
}
export function useValue(props, defaultValue) {
    const { onValueChange, path } = props;
    const item = useContext(ItemContext);
    const { update } = useData();
    const pathValue = get(item, path) ?? defaultValue;
    const setValue = useCallback((newValue) => {
        if (props.inputValueToPathValue) {
            newValue = props.inputValueToPathValue(newValue, pathValue);
        }
        set(item, path, newValue, { preservePaths: false });
        onValueChange?.(newValue, item);
        update();
    }, [item, onValueChange, path, pathValue, props, update]);
    let value = pathValue;
    if (props.pathValueToInputValue) {
        value = props.pathValueToInputValue(pathValue);
    }
    return [value, setValue];
}
export function useInputValidation(props) {
    const [value] = useValue(props, '');
    const showValidation = useShowValidation();
    const item = useContext(ItemContext);
    const { required } = useStringContext();
    let error = undefined;
    let validated = undefined;
    if (props.required && (!value || (Array.isArray(value) && value.length === 0))) {
        error = required;
    }
    else if (props.validation) {
        error = props.validation(value, item);
    }
    if (showValidation) {
        validated = error ? 'error' : undefined;
    }
    return { validated, error };
}
export function useInputHidden(props) {
    const item = useContext(ItemContext);
    return props.hidden ? props.hidden(item) : false;
}
export function useInput(props) {
    const editMode = useEditMode();
    const displayMode = useDisplayMode();
    const [value, setValue] = useValue(props, '');
    const hidden = useInputHidden(props);
    const setHasInputs = useSetHasInputs();
    const hasInputs = useHasInputs();
    const updateHasInputs = useUpdateHasInputs();
    if (!hidden && !hasInputs) {
        setHasInputs();
    }
    const { validated, error } = useInputValidation(props);
    const hasValidationError = useHasValidationError();
    const setHasValidationError = useSetHasValidationError();
    if (!hidden && error && !hasValidationError) {
        setHasValidationError();
    }
    const [previousValue, setPreviousValue] = useState(value);
    const [previousHidden, setPreviousHidden] = useState(hidden);
    const [previousError, setPreviousError] = useState(error);
    const validate = useValidate();
    if (value !== previousValue || hidden !== previousHidden || error !== previousError) {
        setPreviousValue(value);
        setPreviousHidden(hidden);
        setPreviousError(error);
        if (hidden && !previousHidden) {
            updateHasInputs();
        }
        validate();
    }
    const id = convertId(props);
    const hasValue = useHasValue();
    const setHasValue = useSetHasValue();
    if (!hasValue && value && (!Array.isArray(value) || value.length > 0)) {
        setHasValue();
    }
    let disabled = props.disabled;
    if (editMode === EditMode.Edit) {
        if (props.disabledInEditMode) {
            disabled = props.disabledInEditMode;
        }
    }
    return {
        ...props,
        id,
        displayMode,
        value,
        setValue,
        validated,
        error,
        hidden,
        disabled,
    };
}
function lowercaseFirst(label) {
    if (label) {
        label = label[0].toLowerCase() + label.substring(1);
    }
    return label;
}
export function getEnterPlaceholder(props) {
    return props.placeholder ?? (props.label && props.label.length ? `Enter the ${lowercaseFirst(props.label)}` : '');
}
export function getSelectPlaceholder(props) {
    return props.placeholder ?? `Select the ${lowercaseFirst(props.label)}`;
}
export function getCollapsedPlaceholder(props) {
    return props.collapsedPlaceholder ?? 'Expand to edit';
}
export function getAddPlaceholder(props) {
    return props.placeholder ?? 'Add';
}
//# sourceMappingURL=Input.js.map
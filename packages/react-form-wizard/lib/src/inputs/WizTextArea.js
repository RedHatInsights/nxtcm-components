import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InputGroup, TextArea as PFTextArea, TextInput } from '@patternfly/react-core';
import { Fragment, useCallback, useRef, useState } from 'react';
import { WizTextDetail } from '..';
import { ClearInputButton } from '../components/ClearInputButton';
import { PasteInputButton } from '../components/PasteInputButton';
import { ShowSecretsButton } from '../components/ShowSecretsButton';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { getEnterPlaceholder, useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
import useResizeObserver from '@react-hook/resize-observer';
export function WizTextArea(props) {
    const { displayMode: mode, value, disabled, setValue, validated, hidden, id } = useInput(props);
    const [showSecrets, setShowSecrets] = useState(!value);
    const textAreaRef = useRef(null);
    const [initialHeightSet, setInitialHeightSet] = useState(false);
    const setInitialHeight = useCallback(() => {
        const field = textAreaRef.current;
        if (!initialHeightSet && field) {
            const parent = field.parentElement;
            if (parent) {
                parent.style.setProperty('height', 'inherit');
                const computed = window.getComputedStyle(field);
                const height = parseInt(computed.getPropertyValue('border-top-width')) +
                    parseInt(computed.getPropertyValue('padding-top')) +
                    field.scrollHeight +
                    parseInt(computed.getPropertyValue('padding-bottom')) +
                    parseInt(computed.getPropertyValue('border-bottom-width'));
                parent.style.setProperty('height', `${height}px`);
                setInitialHeightSet(true);
            }
        }
    }, [initialHeightSet]);
    useResizeObserver(textAreaRef, setInitialHeight);
    const onChange = useCallback((_event, value) => setValue(value), [setValue]);
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details) {
        if (!value)
            return _jsx(Fragment, {});
        return _jsx(WizTextDetail, { id: id, path: props.path, label: props.label, secret: props.secret });
    }
    const placeholder = getEnterPlaceholder(props);
    const canPaste = props.canPaste !== undefined ? props.canPaste : props.secret === true;
    return (_createElement(WizFormGroup, { ...props, id: id, key: id },
        _jsxs(InputGroup, { children: [value && !showSecrets && props.secret ? (_jsx(TextInput, { id: id, value: value, validated: validated, type: "password", readOnlyVariant: "default" })) : (_jsx(PFTextArea, { id: id, placeholder: placeholder, validated: validated, value: value, onChange: onChange, type: !props.secret || showSecrets ? 'text' : 'password', spellCheck: "false", resizeOrientation: "vertical", autoResize: true, readOnlyVariant: props.readonly ? 'default' : undefined, ref: textAreaRef })), !disabled && value !== '' && props.secret && (_jsx(ShowSecretsButton, { showSecrets: showSecrets, setShowSecrets: setShowSecrets })), canPaste && !disabled && value === '' && (_jsx(PasteInputButton, { setValue: setValue, setShowSecrets: setShowSecrets })), canPaste && !disabled && value !== '' && !props.readonly && !props.disabled && (_jsx(ClearInputButton, { onClick: () => {
                        setValue('');
                        setShowSecrets(true);
                    } }))] })));
}
//# sourceMappingURL=WizTextArea.js.map
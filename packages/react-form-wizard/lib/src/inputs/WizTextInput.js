import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InputGroup, InputGroupItem, TextInput as PFTextInput } from '@patternfly/react-core';
import { Fragment, useCallback, useState } from 'react';
import { WizTextDetail } from '..';
import { ClearInputButton } from '../components/ClearInputButton';
import { PasteInputButton } from '../components/PasteInputButton';
import { ShowSecretsButton } from '../components/ShowSecretsButton';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { getEnterPlaceholder, useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
export function WizTextInput(props) {
    const { displayMode: mode, value, setValue, disabled, validated, hidden, id } = useInput(props);
    const [showSecrets, setShowSecrets] = useState(false);
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
    const inputGroup = (_jsxs(InputGroup, { children: [_jsx(InputGroupItem, { isFill: true, children: _jsx(PFTextInput, { id: id, placeholder: placeholder, validated: validated, value: value, onChange: onChange, type: !props.secret || showSecrets ? 'text' : 'password', isDisabled: disabled, spellCheck: "false", readOnlyVariant: props.readonly ? 'default' : undefined }) }), !disabled && value !== '' && props.secret && (_jsx(ShowSecretsButton, { showSecrets: showSecrets, setShowSecrets: setShowSecrets })), canPaste && !disabled && value === '' && (_jsx(PasteInputButton, { setValue: setValue, setShowSecrets: setShowSecrets })), canPaste && !disabled && value !== '' && !props.readonly && !props.disabled && (_jsx(ClearInputButton, { onClick: () => setValue('') }))] }));
    return props.label ? (_jsx(WizFormGroup, { ...props, id: id, children: inputGroup })) : (inputGroup);
}
//# sourceMappingURL=WizTextInput.js.map
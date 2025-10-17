import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, FormHelperText, HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';
import { useInputValidation } from '../inputs/Input';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
export function WizHelperText(props) {
    const { validated, error } = useInputValidation({ ...props, path: props.path || '' });
    const { helperText, prompt } = props;
    const showHelperText = !!((validated === 'error' && error) || (validated !== 'error' && helperText) || prompt);
    const helperTextOrError = validated === 'error' ? error : helperText;
    return showHelperText ? (_jsx(FormHelperText, { children: _jsxs(Split, { children: [_jsx(SplitItem, { isFilled: true, children: _jsx(HelperText, { children: _jsx(HelperTextItem, { variant: validated, children: helperTextOrError }) }) }), prompt?.label && prompt?.href && (_jsx(SplitItem, { children: _jsx(Button, { variant: "link", style: { ['--pf-v6-c-button--PaddingRight']: '0px' }, onClick: () => window.open(prompt?.href), isDisabled: prompt?.isDisabled, icon: _jsx(ExternalLinkAltIcon, {}), iconPosition: "right", children: prompt?.label }) }))] }) })) : null;
}
//# sourceMappingURL=WizHelperText.js.map
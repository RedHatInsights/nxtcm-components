import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LabelHelp } from '../components/LabelHelp';
import { convertId } from './Input';
import { FormGroup } from '@patternfly/react-core';
import { WizHelperText } from '../components/WizHelperText';
export function WizFormGroup(props) {
    const { noHelperText } = props;
    const id = convertId(props);
    return (_jsxs(FormGroup, { id: `${id}-form-group`, fieldId: id, label: props.label, isRequired: props.required, labelHelp: _jsx(LabelHelp, { id: id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle }), children: [props.children, !noHelperText && _jsx(WizHelperText, { ...props })] }, `${id}-form-group`));
}
//# sourceMappingURL=WizFormGroup.js.map
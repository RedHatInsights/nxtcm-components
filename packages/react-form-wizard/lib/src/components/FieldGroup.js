import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormFieldGroupToggle } from '@patternfly/react-core/dist/js/components/Form/FormFieldGroupToggle';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Form/form';
import './FieldGroup.css';
export function FieldGroup(props) {
    const { children, header, isExpanded, setIsExpanded, toggleAriaLabel, ...extraProps } = props;
    return (_jsx(InternalFormFieldGroup, { className: "input-field-group", header: !isExpanded && header, isExpandable: true, isExpanded: props.isExpanded, toggleAriaLabel: toggleAriaLabel, onToggle: () => setIsExpanded(!props.isExpanded), ...extraProps, children: children }));
}
export const InternalFormFieldGroup = ({ children, className, header, isExpandable, isExpanded, onToggle, toggleAriaLabel, ...props }) => {
    const headerTitleText = header ? header.props.titleText : null;
    if (isExpandable && !toggleAriaLabel && !headerTitleText) {
        console.error('FormFieldGroupExpandable:', 'toggleAriaLabel or the titleText prop of FormfieldGroupHeader is required to make the toggle button accessible');
    }
    return (_jsxs("div", { className: css(className, styles.formFieldGroup, isExpanded && isExpandable && styles.modifiers.expanded), ...props, style: { margin: 0 }, children: [isExpandable && (_jsx(FormFieldGroupToggle, { onToggle: onToggle, isExpanded: isExpanded, "aria-label": toggleAriaLabel, ...(headerTitleText && { 'aria-labelledby': `c` }), style: { paddingTop: 16 } })), header && header, !isExpandable || (isExpandable && isExpanded) ? (_jsx("div", { className: css(styles.formFieldGroupBody), style: { paddingTop: 16, paddingBottom: 32 }, children: children })) : (_jsx("div", { style: { display: 'none' }, children: children }))] }));
};
InternalFormFieldGroup.displayName = 'InternalFormFieldGroup';
//# sourceMappingURL=FieldGroup.js.map
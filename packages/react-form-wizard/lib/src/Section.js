import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { DescriptionList, Divider, Icon, Split, SplitItem, Stack, Content, Title } from '@patternfly/react-core';
import { AngleDownIcon, AngleLeftIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { Fragment, useEffect, useState } from 'react';
import { LabelHelp } from './components/LabelHelp';
import { DisplayMode, useDisplayMode } from './contexts/DisplayModeContext';
import { HasInputsContext, HasInputsProvider, useSetHasInputs } from './contexts/HasInputsProvider';
import { HasValueContext, HasValueProvider } from './contexts/HasValueProvider';
import { useShowValidation } from './contexts/ShowValidationProvider';
import { useStringContext } from './contexts/StringContext';
import { HasValidationErrorContext, ValidationProvider } from './contexts/ValidationProvider';
import { useInputHidden } from './inputs/Input';
export function Section(props) {
    return _jsx(SectionInternal, { ...props });
}
function SectionInternal(props) {
    const mode = useDisplayMode();
    const id = props.id ?? props.label?.toLowerCase().split(' ').join('-') ?? '';
    const showValidation = useShowValidation();
    const [expanded, setExpanded] = useState(props.defaultExpanded === undefined ? true : props.defaultExpanded);
    const hidden = useInputHidden(props);
    const setHasInputs = useSetHasInputs();
    useEffect(() => {
        if (props.autohide === false)
            setHasInputs();
    }, [setHasInputs, props.autohide]);
    const { expandToFixValidationErrors } = useStringContext();
    if (hidden)
        return _jsx(Fragment, {});
    if (mode === DisplayMode.Details)
        return (_jsx(HasValueProvider, { children: _jsx(HasValueContext.Consumer, { children: (hasValue) => hasValue ? (_jsxs(_Fragment, { children: [_jsx(Title, { headingLevel: "h2", children: props.label }), _jsx(DescriptionList, { isHorizontal: true, isCompact: true, style: { padding: 16 }, children: props.children })] })) : (_jsx("div", { style: { display: 'none' }, children: props.children })) }) }, id));
    return (_jsx(HasInputsProvider, { children: _jsx(HasInputsContext.Consumer, { children: (hasInputs) => (_jsx(ValidationProvider, { children: _jsx(HasValidationErrorContext.Consumer, { children: (hasValidationError) => (_jsxs("section", { id: id, className: "pf-v6-c-form__section", role: "group", style: { display: !hasInputs && props.autohide !== false ? 'none' : undefined }, children: [_jsxs(Split, { hasGutter: true, onClick: () => {
                                    if (props.collapsable)
                                        setExpanded(!expanded);
                                }, children: [_jsx(SplitItem, { isFilled: true, children: _jsxs(Stack, { children: [_jsx(Split, { hasGutter: true, children: _jsxs("div", { className: "pf-v6-c-form__section-title", children: [props.label, props.id && (_jsx(LabelHelp, { id: props.id, labelHelp: props.labelHelp, labelHelpTitle: props.labelHelpTitle }))] }) }), expanded && props.description && (_jsx(Content, { component: "small", style: { paddingTop: 8 }, children: props.description }))] }) }), showValidation && !expanded && hasValidationError && (_jsx(SplitItem, { children: _jsxs(Split, { children: [_jsx(SplitItem, { children: _jsx(Icon, { status: "danger", children: _jsx(ExclamationCircleIcon, {}) }) }), _jsx(SplitItem, { children: _jsxs("span", { className: "pf-v6-c-form__helper-text pf-m-error", children: ["\u00A0 ", expandToFixValidationErrors] }) })] }) })), props.collapsable &&
                                        (expanded ? (_jsx(SplitItem, { children: _jsx("div", { style: { marginBottom: -5 }, children: _jsx(AngleDownIcon, {}) }) })) : (_jsx(SplitItem, { children: _jsx("div", { style: { marginBottom: -5 }, children: _jsx(AngleLeftIcon, {}) }) })))] }), expanded ? props.children : _jsx("div", { style: { display: 'none' }, children: props.children }), !expanded && _jsx(Divider, {})] })) }) })) }) }, id));
}
//# sourceMappingURL=Section.js.map
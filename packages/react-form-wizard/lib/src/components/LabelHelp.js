import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { Fragment } from 'react';
import { useStringContext } from '../contexts/StringContext';
export function LabelHelp(props) {
    const { moreInfo } = useStringContext();
    return props.labelHelp ? (_jsx(Popover, { id: `${props.id}-label-help-popover`, headerContent: props.labelHelpTitle, bodyContent: props.labelHelp, children: _jsx(Button, { variant: "plain", isInline: true, id: `${props.id}-label-help-button`, "aria-label": moreInfo, className: "pf-v6-c-form__group-label-help", style: { ['--pf-v6-c-form__group-label-help--TranslateY']: 0 }, icon: _jsx(HelpIcon, {}) }) })) : (_jsx(Fragment, {}));
}
//# sourceMappingURL=LabelHelp.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flex } from '@patternfly/react-core';
import { Fragment } from 'react';
import set from 'set-value';
import { WizSelect, WizMultiSelect, WizSingleSelect, WizStringsInput, WizTextInput } from '../../src';
import { DisplayMode, useDisplayMode } from '../../src/contexts/DisplayModeContext';
import { ItemContext, useItem } from '../../src/contexts/ItemContext';
export function MatchExpression(props) {
    const labelValuesMap = props.labelValuesMap;
    return (_jsxs(Flex, { style: { rowGap: 16 }, children: [labelValuesMap ? (_jsx(WizSingleSelect, { label: "Label", path: "key", options: Object.keys(labelValuesMap), isCreatable: true, required: true, onValueChange: (_value, item) => set(item, 'values', []) })) : (_jsx(WizTextInput, { label: "Label", path: "key", required: true, onValueChange: (_value, item) => set(item, 'values', []) })), _jsx(WizSelect, { label: "Operator", path: "operator", options: [
                    { label: 'equals any of', value: 'In' },
                    { label: 'does not equal any of', value: 'NotIn' },
                    { label: 'exists', value: 'Exists' },
                    { label: 'does not exist', value: 'DoesNotExist' },
                ], required: true, onValueChange: (value, item) => {
                    switch (value) {
                        case 'Exists':
                        case 'DoesNotExist':
                            set(item, 'values', undefined);
                            break;
                    }
                } }), labelValuesMap ? (_jsx(ItemContext.Consumer, { children: (item) => {
                    const selectedLabel = item.key ?? '';
                    const values = labelValuesMap[selectedLabel] ?? [];
                    return (_jsx(WizMultiSelect, { label: "Values", path: "values", isCreatable: true, required: true, hidden: (labelSelector) => !['In', 'NotIn'].includes(labelSelector?.operator), options: values }));
                } })) : (_jsx(WizStringsInput, { label: "Values", path: "values", required: true, hidden: (labelSelector) => !['In', 'NotIn'].includes(labelSelector?.operator) }))] }));
}
export function MatchExpressionCollapsed() {
    const expression = useItem();
    return _jsx(MatchExpressionSummary, { expression: expression });
}
export function MatchExpressionSummary(props) {
    const { expression } = props;
    let operator = 'unknown';
    switch (expression?.operator) {
        case 'In':
            if (expression.values && expression.values.length > 1) {
                operator = 'equals any of';
            }
            else {
                operator = 'equals';
            }
            break;
        case 'NotIn':
            if (expression.values && expression.values.length > 1) {
                operator = 'does not equal any of';
            }
            else {
                operator = 'does not equal';
            }
            break;
        case 'Exists':
            operator = 'exists';
            break;
        case 'DoesNotExist':
            operator = 'does not exist';
            break;
    }
    const displayMode = useDisplayMode();
    if (!expression?.key) {
        if (displayMode === DisplayMode.Details)
            return _jsx(Fragment, {});
        return _jsx("div", { children: "Expand to enter expression" });
    }
    return (_jsxs("div", { children: [expression?.key, " ", operator, " ", expression?.values?.map((value) => value).join(', ')] }));
}
//# sourceMappingURL=MatchExpression.js.map
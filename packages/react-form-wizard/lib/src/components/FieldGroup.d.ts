import { FormFieldGroupExpandableProps } from '@patternfly/react-core';
import * as React from 'react';
import './FieldGroup.css';
export type FieldGroupProps = FormFieldGroupExpandableProps & {
    setIsExpanded: (expanded: boolean) => void;
};
export declare function FieldGroup(props: FieldGroupProps): import("react/jsx-runtime").JSX.Element;
export interface InternalFormFieldGroupProps extends Omit<React.HTMLProps<HTMLDivElement>, 'label'> {
    children?: React.ReactNode;
    className?: string;
    header?: any;
    isExpandable?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
    toggleAriaLabel?: string;
}
export declare const InternalFormFieldGroup: React.FunctionComponent<InternalFormFieldGroupProps>;

import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
export declare function wizardArrayItems(props: any, item: any): object[];
export type WizArrayInputProps = Omit<InputCommonProps, 'path'> & {
    path: string | null;
    children: ReactNode;
    filter?: (item: any) => boolean;
    dropdownItems?: {
        label: string;
        action: () => object;
    }[];
    placeholder?: string;
    collapsedContent: ReactNode;
    expandedContent?: ReactNode;
    collapsedPlaceholder?: ReactNode;
    sortable?: boolean;
    newValue?: object;
    defaultCollapsed?: boolean;
    disallowEmpty?: boolean;
    isSection?: boolean;
    summaryList?: boolean;
};
export declare function WizArrayInput(props: WizArrayInputProps): import("react/jsx-runtime").JSX.Element;
export declare function ArrayInputItem(props: {
    id: string;
    value: object;
    index: number;
    count: number;
    children: ReactNode;
    defaultExpanded?: boolean;
    collapsedContent: ReactNode;
    expandedContent?: ReactNode;
    collapsedPlaceholder?: ReactNode;
    sortable?: boolean;
    required?: boolean;
    moveUp: (index: number) => void;
    moveDown: (index: number) => void;
    removeItem: (value: object) => void;
}): import("react/jsx-runtime").JSX.Element;

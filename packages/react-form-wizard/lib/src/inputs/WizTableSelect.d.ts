import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
interface ITableColumn<T> {
    name: string;
    cellFn: (item: T) => ReactNode;
}
export type WizTableSelectProps<T> = InputCommonProps<string> & {
    label: string;
    columns: ITableColumn<T>[];
    items: T[];
    itemToValue?: (item: T) => unknown;
    valueMatchesItem?: (value: unknown, item: T) => boolean;
    emptyTitle: string;
    emptyMessage: string;
    summaryList?: boolean;
};
export declare function WizTableSelect<T = any>(props: WizTableSelectProps<T>): import("react/jsx-runtime").JSX.Element;
export {};

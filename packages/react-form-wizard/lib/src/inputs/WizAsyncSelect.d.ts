import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
import './Select.css';
type WizAsyncSelectProps = InputCommonProps<string> & {
    label: string;
    placeholder?: string;
    isCreatable?: boolean;
    asyncCallback?: () => Promise<string[]>;
    footer?: ReactNode;
};
export declare function WizAsyncSelect(props: WizAsyncSelectProps): import("react/jsx-runtime").JSX.Element | null;
export {};

import { MenuToggleElement } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { OptionType } from './WizSelect';
type InputSelectProps = {
    disabled?: boolean;
    validated?: 'error';
    options: string[];
    setOptions: (options: string[]) => void;
    placeholder: string;
    value: string;
    onSelect: (value: string | undefined) => void;
    toggleRef: React.Ref<MenuToggleElement>;
    open: boolean;
    setOpen: (open: boolean) => void;
    required?: boolean;
};
export declare const InputSelect: ({ required, disabled, validated, options, setOptions, placeholder, value, onSelect, toggleRef, open, setOpen, }: InputSelectProps) => import("react/jsx-runtime").JSX.Element;
type SelectListOptionsProps<T = any> = {
    value: string;
    options: string[] | OptionType<T>[];
    footer?: ReactNode;
    isCreatable?: boolean;
    onCreate?: (value: string) => void;
    isMultiSelect?: boolean;
};
export declare const SelectListOptions: ({ value, options, isCreatable, onCreate, footer, isMultiSelect, }: SelectListOptionsProps) => import("react/jsx-runtime").JSX.Element;
export {};

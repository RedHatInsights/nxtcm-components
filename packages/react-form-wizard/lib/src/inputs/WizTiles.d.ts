import { ReactNode } from 'react';
import { InputCommonProps } from './Input';
type WizTilesProps = InputCommonProps & {
    children?: ReactNode;
};
export declare function WizTiles(props: WizTilesProps): import("react/jsx-runtime").JSX.Element;
export declare function Tile(props: {
    id: string;
    label: string;
    value: string | number | boolean;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};

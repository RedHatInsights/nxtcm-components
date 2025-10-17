import React, { ReactNode } from 'react';
interface ICatalogBreadcrumb {
    id?: string;
    label: string;
    to?: string;
    target?: string;
    component?: React.ElementType;
}
type CatalogFilterValue = string | number | boolean;
interface ICatalogFilterGroup {
    id: string;
    label: string;
    filters?: ICatalogFilter[];
}
interface ICatalogFilter {
    id?: string;
    label?: string;
    value: CatalogFilterValue;
    filters?: ICatalogFilter[];
}
interface ICatalogCard {
    id?: string;
    icon?: ReactNode;
    title: string;
    descriptions?: string[];
    featureGroups?: ICatalogCardFeatureGroup[];
    labels?: string[];
    badge?: string;
    onClick?: () => void;
}
interface ICatalogCardFeatureGroup {
    title: string;
    features: string[];
}
export declare function Catalog(props: {
    title: string;
    breadcrumbs?: ICatalogBreadcrumb[];
    filterGroups?: ICatalogFilterGroup[];
    cards?: ICatalogCard[];
    onBack?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function AcmScrollable(props: {
    children?: ReactNode;
    borderTop?: boolean;
    borderBottom?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};

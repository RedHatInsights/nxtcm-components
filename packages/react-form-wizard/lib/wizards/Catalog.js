import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb, BreadcrumbItem, Button, Card, CardBody, CardHeader, CardTitle, Checkbox, Content, Drawer, DrawerContent, DrawerContentBody, DrawerPanelBody, DrawerPanelContent, DrawerSection, Flex, FlexItem, Icon, Label, LabelGroup, List, ListItem, Page, PageSection, SearchInput, Split, SplitItem, Stack, Title, } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import Fuse from 'fuse.js';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Grid } from './common/Grid';
const fuseCardOptions = {
    includeScore: true,
    fieldNormWeight: 0,
    keys: [
        { name: 'title', weight: 0.35 },
        { name: 'descriptions', weight: 0.05 },
        { name: 'featureGroups.features', weight: 0.15 },
        { name: 'labels', weight: 0.15 },
        { name: 'labels.label', weight: 0.15 },
        { name: 'badge', weight: 0.15 },
    ],
};
export function Catalog(props) {
    const breadcrumbs = useMemo(() => {
        if (!props.breadcrumbs)
            return _jsx(Fragment, {});
        return (_jsx(Breadcrumb, { children: props.breadcrumbs.map((breadcrumb) => (_jsx(BreadcrumbItem, { id: breadcrumb.id, to: breadcrumb.to, target: breadcrumb.target, component: breadcrumb.component, children: breadcrumb.label }, breadcrumb.id))) }));
    }, [props.breadcrumbs]);
    const [search, setSearch] = useState('');
    const [filterSelections, setFilterSelections] = useState({});
    const onClickFilter = useCallback((filterGroup, filter) => {
        const newSelections = { ...filterSelections };
        const filterGroupSelections = newSelections[filterGroup.id];
        if (!filterGroupSelections) {
            newSelections[filterGroup.id] = [filter.value];
        }
        else {
            if (filterGroupSelections.includes(filter.value)) {
                filterGroupSelections.splice(filterGroupSelections.indexOf(filter.value), 1);
            }
            else {
                filterGroupSelections.push(filter.value);
            }
        }
        setFilterSelections(newSelections);
    }, [filterSelections]);
    const featureFilterGroups = useMemo(() => {
        const groupMap = {};
        for (const card of props.cards ?? []) {
            for (const featureGroup of card.featureGroups ?? []) {
                let catalogFilterGroup = groupMap[featureGroup.title];
                if (!catalogFilterGroup) {
                    catalogFilterGroup = {
                        id: featureGroup.title,
                        label: featureGroup.title,
                        filters: [],
                    };
                    groupMap[featureGroup.title] = catalogFilterGroup;
                }
                for (const feature of featureGroup.features) {
                    if (!catalogFilterGroup.filters?.find((filter) => filter.value === feature)) {
                        const filter = {
                            value: feature,
                        };
                        catalogFilterGroup.filters.push(filter);
                    }
                }
            }
        }
        const groups = Object.values(groupMap);
        for (const group of groups) {
            group.filters?.sort((l, r) => l.value.localeCompare(r.value));
        }
        return groups.sort((l, r) => l.label.localeCompare(r.label));
    }, [props.cards]);
    const catalogFilterGroups = useMemo(() => {
        if (!props.filterGroups && !featureFilterGroups.length)
            return _jsx(Fragment, {});
        return (_jsx(DrawerPanelContent, { minSize: "250px", defaultSize: "250px", maxSize: "250px", children: _jsxs(DrawerPanelBody, { children: [props.filterGroups?.map((filterGroup) => (_jsx(DrawerSection, { style: { paddingBottom: 32 }, children: _jsx(FilterGroup, { filterGroup: filterGroup, selectedValues: filterSelections[filterGroup.id], onClickFilter: onClickFilter }) }, filterGroup.id))), featureFilterGroups.map((filterGroup) => (_jsx(DrawerSection, { style: { paddingBottom: 32 }, children: _jsx(FilterGroup, { filterGroup: filterGroup, selectedValues: filterSelections[filterGroup.id], onClickFilter: onClickFilter }) }, filterGroup.id)))] }) }));
    }, [props.filterGroups, filterSelections, onClickFilter, featureFilterGroups]);
    const filteredCards = useMemo(() => {
        let filteredCards = props.cards;
        if (!filteredCards)
            return undefined;
        if (Object.keys(filterSelections).length > 0) {
            for (const key in filterSelections) {
                const t = filterSelections[key];
                if (t.length == 0)
                    continue;
                filteredCards = filteredCards?.filter((card) => {
                    const matchesLabel = card.labels?.find((label) => {
                        return t.includes(label);
                    });
                    if (matchesLabel)
                        return true;
                    const matchesFeature = card.featureGroups?.find((featureGroup) => {
                        for (const feature of featureGroup.features) {
                            if (t.includes(feature))
                                return true;
                        }
                        return false;
                    });
                    if (matchesFeature)
                        return true;
                    return false;
                });
            }
        }
        return filteredCards;
    }, [props.cards, filterSelections]);
    const searchedCards = useMemo(() => {
        let activeCards = filteredCards;
        if (!activeCards)
            return undefined;
        if (search) {
            const fuse = new Fuse(activeCards, fuseCardOptions);
            activeCards = fuse.search(search).map((result) => result.item);
        }
        else {
            activeCards = activeCards?.sort((lhs, rhs) => lhs.title.localeCompare(rhs.title));
        }
        return activeCards;
    }, [filteredCards, search]);
    const catalogCards = useMemo(() => {
        if (!searchedCards)
            return _jsx(Fragment, {});
        return (_jsx(Grid, { children: searchedCards.map((card) => {
                return (_jsxs(Card, { id: card.id, onClick: card.onClick, isLarge: true, isSelectable: card.onClick !== undefined, style: {
                        transition: 'box-shadow 0.25s',
                        cursor: card.onClick ? 'pointer' : undefined,
                        background: card.onClick ? undefined : '#00000008',
                    }, children: [_jsx(CardHeader, { children: _jsxs(Split, { hasGutter: true, style: { width: '100%' }, children: [_jsx(SplitItem, { isFilled: true, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [card.icon && (_jsx("div", { style: {
                                                        display: 'flex',
                                                        height: 40,
                                                        width: 40,
                                                        marginTop: -20,
                                                        marginBottom: -20,
                                                        marginRight: 12,
                                                        alignItems: 'center',
                                                        justifyItems: 'stretch',
                                                    }, children: card.icon })), _jsx(CardTitle, { children: card.title })] }) }), card.badge && (_jsx(SplitItem, { children: _jsx(Label, { isCompact: true, color: "orange", children: card.badge }) }))] }) }), _jsx(CardBody, { style: { paddingTop: 0 }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }, children: [Array.isArray(card.descriptions) &&
                                        card.descriptions.map((description, index) => (_jsx(Content, { component: "p", children: description }, index))), Array.isArray(card.featureGroups) &&
                                        card.featureGroups.map((featureGroup, index) => (_jsxs(Stack, { children: [_jsx(Title, { headingLevel: "h6", style: { paddingBottom: 8 }, children: featureGroup.title }), _jsx(List, { isPlain: true, children: featureGroup.features?.map((feature, index) => (_jsx(ListItem, { icon: _jsx(Icon, { status: "success", isInline: true, children: _jsx(CheckIcon, {}) }), children: feature }, index))) })] }, index))), card.labels && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'end' }, children: _jsx(LabelGroup, { numLabels: 999, children: card.labels.map((label) => (_jsx(Label, { children: label }, label))) }) }))] }) })] }, card.id ?? card.title));
            }) }));
    }, [searchedCards]);
    return (_jsxs(Page, { children: [_jsx(PageSection, { variant: "default", isWidthLimited: true, children: _jsxs(Flex, { style: { gap: 16 }, children: [_jsx(FlexItem, { grow: { default: 'grow' }, children: _jsxs(Stack, { hasGutter: true, children: [breadcrumbs, _jsx(Title, { headingLevel: "h1", children: props.title })] }) }), _jsx(FlexItem, { alignSelf: { default: 'alignSelfFlexEnd' }, grow: { default: 'grow' }, children: _jsx(SearchInput, { value: search, onChange: (_event, value) => setSearch(value), onClear: () => setSearch('') }) })] }) }), _jsx(PageSection, { variant: "default", padding: { default: 'noPadding' }, isFilled: true, hasOverflowScroll: true, children: _jsx(Drawer, { position: "left", isStatic: true, children: _jsx(DrawerContent, { panelContent: catalogFilterGroups, children: _jsx(DrawerContentBody, { hasPadding: true, children: catalogCards }) }) }) }), props.onBack && (_jsx(PageSection, { variant: "default", isFilled: false, children: _jsx(Button, { onClick: props.onBack, children: "Back" }) }))] }));
}
function FilterGroup(props) {
    const { filterGroup, selectedValues, onClickFilter } = props;
    return (_jsx(DrawerSection, { children: _jsxs(Stack, { hasGutter: true, children: [_jsx(Title, { headingLevel: "h4", children: filterGroup.label }), filterGroup.filters?.map((filter) => (_jsx(Filter, { filter: filter, selectedValues: selectedValues, onClick: () => onClickFilter(filterGroup, filter) }, filter.id ?? filter.value.toString())))] }) }, filterGroup.id));
}
function Filter(props) {
    const { filter, selectedValues, onClick } = props;
    return (_jsxs(Fragment, { children: [_jsx(Checkbox, { id: filter.id ?? filter.value.toString(), isChecked: selectedValues?.includes(filter.value), onChange: onClick, label: filter.label ?? filter.value.toString() }), filter.filters && (_jsx(Stack, { hasGutter: true, children: filter.filters.map((filter) => (_jsx(Filter, { filter: filter, selectedValues: selectedValues, onClick: onClick }, filter.id ?? filter.value.toString()))) }))] }));
}
export function AcmScrollable(props) {
    const divEl = useRef(null);
    const [topShadow, setTopShadow] = useState(0);
    const [bottomShadow, setBottomShadow] = useState(0);
    const update = useCallback(() => {
        if (divEl.current) {
            setTopShadow(Math.min(1, divEl.current.scrollTop / 8));
            const scrollBottom = divEl.current.scrollHeight - divEl.current.scrollTop - divEl.current.clientHeight;
            setBottomShadow(Math.max(0, Math.min(1, scrollBottom / 8)));
        }
    }, []);
    useEffect(() => update(), [update, props.children]);
    const shadowOpacityTop = 0.08 * topShadow;
    const shadowOpacityBottom = 0.06 * bottomShadow;
    const borderTop = props.borderTop ? 'thin solid rgba(0, 0, 0, 0.12)' : '';
    const borderBottom = props.borderBottom ? 'thin solid rgba(0, 0, 0, 0.12)' : '';
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'hidden', position: 'relative' }, children: [_jsx("div", { ref: divEl, style: { display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto', borderTop, borderBottom }, onScroll: update, children: props.children }), shadowOpacityTop > 0 && (_jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    height: '8px',
                    width: '100%',
                    background: `linear-gradient(rgba(0,0,0,${shadowOpacityTop}), rgba(0,0,0,0))`,
                } })), shadowOpacityBottom > 0 && (_jsx("div", { style: {
                    position: 'absolute',
                    bottom: 0,
                    height: '6px',
                    width: '100%',
                    background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,${shadowOpacityBottom}))`,
                } }))] }));
}
//# sourceMappingURL=Catalog.js.map
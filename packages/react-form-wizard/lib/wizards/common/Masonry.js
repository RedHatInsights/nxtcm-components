import { jsx as _jsx } from "react/jsx-runtime";
import { Grid, GridItem, Stack } from '@patternfly/react-core';
import useResizeObserver from '@react-hook/resize-observer';
import { Children, useLayoutEffect, useMemo, useRef, useState } from 'react';
export function Masonry(props) {
    const target = useRef(null);
    const [columns, setColumns] = useState(1);
    useResizeObserver(target, (entry) => {
        setColumns(Math.min(props.maxColumns ?? 12, Math.max(Math.floor(entry.contentRect.width / props.size), 1)));
    });
    const [span, setSpan] = useState(12);
    const [sizes, setSizes] = useState({});
    useLayoutEffect(() => {
        switch (columns) {
            case 1:
                setSpan(12);
                break;
            case 2:
                setSpan(6);
                break;
            case 3:
                setSpan(4);
                break;
            case 4:
                setSpan(3);
                break;
            case 5:
                setSpan(2);
                break;
            case 6:
                setSpan(2);
                break;
            default:
                setSpan(1);
                break;
        }
    }, [columns]);
    const realColumns = 12 / span;
    const itemColumns = useMemo(() => {
        const itemColumns = new Array(realColumns).fill(0).map(() => []);
        const columnHeights = new Array(realColumns).fill(0);
        Children.forEach(props.children, (child, index) => {
            const smallest = Math.min(...columnHeights);
            const columnIndex = columnHeights.findIndex((column) => column === smallest);
            if (columnIndex !== undefined && columnIndex !== -1) {
                itemColumns[columnIndex].push(_jsx(MasonryItem, { index: index, sizes: sizes, setSizes: setSizes, children: child }, index));
                const height = sizes[index];
                if (height !== undefined) {
                    columnHeights[columnIndex] += height + 16;
                }
            }
        });
        return itemColumns;
    }, [props.children, realColumns, sizes]);
    return (_jsx("div", { ref: target, children: _jsx(Grid, { hasGutter: true, style: { maxWidth: realColumns * props.size }, children: itemColumns.map((column, index) => (_jsx(GridItem, { span: span, children: _jsx(Stack, { hasGutter: true, children: column }) }, index))) }) }));
}
function MasonryItem(props) {
    const target = useRef(null);
    useResizeObserver(target, (entry) => {
        props.setSizes((sizes) => {
            if (props.sizes[props.index] !== entry.contentRect.height) {
                sizes = { ...sizes };
                sizes[props.index] = entry.contentRect.height;
            }
            return sizes;
        });
    });
    return _jsx("div", { ref: target, children: props.children });
}
//# sourceMappingURL=Masonry.js.map
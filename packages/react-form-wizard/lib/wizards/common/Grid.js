import { jsx as _jsx } from "react/jsx-runtime";
import useResizeObserver from '@react-hook/resize-observer';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
export function Grid(props) {
    const size = props.size ?? 350;
    const target = useRef(null);
    const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');
    const resize = useCallback((width) => {
        let columns = Math.min(props.maxColumns ?? 12, Math.max(Math.floor(width / size), 1));
        if (columns < 1)
            columns = 1;
        setGridTemplateColumns(() => new Array(columns).fill('1fr').join(' '));
    }, [props.maxColumns, size]);
    useResizeObserver(target, (entry) => resize(entry.contentRect.width));
    useLayoutEffect(() => {
        resize(target.current?.clientWidth ?? 0);
    }, [resize]);
    return (_jsx("div", { ref: target, style: { display: 'grid', gridAutoRows: '1fr', gridTemplateColumns, gap: 16, paddingBottom: 24 }, children: props.children }));
}
//# sourceMappingURL=Grid.js.map
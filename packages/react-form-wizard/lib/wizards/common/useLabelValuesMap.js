import { useMemo } from 'react';
export function useLabelValuesMap(clusters) {
    return useMemo(() => {
        const labelValuesMap = {};
        for (const cluster of clusters) {
            const labels = cluster.metadata?.labels ?? {};
            for (const label in labels) {
                let values = labelValuesMap[label];
                if (!values) {
                    values = [];
                    labelValuesMap[label] = values;
                }
                const value = labels[label];
                if (value !== undefined) {
                    if (!values.includes(value)) {
                        values.push(value);
                    }
                }
            }
        }
        return labelValuesMap;
    }, [clusters]);
}
//# sourceMappingURL=useLabelValuesMap.js.map
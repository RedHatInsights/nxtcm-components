import { createContext, useContext } from 'react';
import get from 'get-value';
export const ItemContext = createContext({});
ItemContext.displayName = 'ItemContext';
export function useItem(path) {
    const item = useContext(ItemContext);
    if (path) {
        return get(item, path);
    }
    return item;
}
//# sourceMappingURL=ItemContext.js.map
import { createContext, useContext } from 'react';
export const DataContext = createContext({ update: () => null });
DataContext.displayName = 'DataContext';
export function useData() {
    return useContext(DataContext);
}
//# sourceMappingURL=DataContext.js.map
import { createContext, useContext } from 'react';
export var DisplayMode;
(function (DisplayMode) {
    DisplayMode[DisplayMode["Details"] = 0] = "Details";
    DisplayMode[DisplayMode["Step"] = 1] = "Step";
    DisplayMode[DisplayMode["StepsHidden"] = 2] = "StepsHidden";
})(DisplayMode || (DisplayMode = {}));
export const DisplayModeContext = createContext(DisplayMode.Step);
DisplayModeContext.displayName = 'DisplayModeContext';
export function useDisplayMode() {
    return useContext(DisplayModeContext);
}
//# sourceMappingURL=DisplayModeContext.js.map
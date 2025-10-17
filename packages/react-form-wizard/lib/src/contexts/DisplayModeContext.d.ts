/// <reference types="react" />
export declare enum DisplayMode {
    Details = 0,
    Step = 1,
    StepsHidden = 2
}
export declare const DisplayModeContext: import("react").Context<DisplayMode>;
export declare function useDisplayMode(): DisplayMode;

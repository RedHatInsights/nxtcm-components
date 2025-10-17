/// <reference types="react" />
export interface IDataContext {
    update: (data?: any) => void;
}
export declare const DataContext: import("react").Context<IDataContext>;
export declare function useData(): IDataContext;

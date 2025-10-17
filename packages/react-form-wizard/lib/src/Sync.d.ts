import { IResource } from './common/resource';
export declare function Sync(props: {
    kind: string;
    path: string;
    targetKind?: string;
    targetPath?: string;
    suffix?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SyncCount(props: {
    kind: string;
    targetKind: string;
    newTarget: IResource;
}): import("react/jsx-runtime").JSX.Element;

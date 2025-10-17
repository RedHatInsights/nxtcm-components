export declare function YamlToObject(yaml: string, isYamlArray?: boolean): any;
export declare function ObjectToYaml(data: any, isYamlArray: boolean): string;
export declare function YamlEditor(props: {
    data: any;
    setData?: (data: any) => void;
    isYamlArray: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function WizardYamlEditor(): import("react/jsx-runtime").JSX.Element;

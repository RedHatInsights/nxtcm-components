export declare function ClusterForm(): import("react/jsx-runtime").JSX.Element;
export declare function ControlPlaneStep(): import("react/jsx-runtime").JSX.Element;
export declare function WorkerPoolsStep(): import("react/jsx-runtime").JSX.Element;
export declare const awsRegions: {
    'us-east-1': string[];
    'us-east-2': string[];
    'us-west-1': string[];
    'us-west-2': string[];
    'af-south-1': string[];
    'ap-east-1': string[];
    'ap-northeast-1': string[];
    'ap-northeast-2': string[];
    'ap-northeast-3': string[];
    'ap-south-1': string[];
    'ap-southeast-1': string[];
    'ap-southeast-2': string[];
    'ca-central-1': string[];
    'eu-central-1': string[];
    'eu-north-1': string[];
    'eu-south-1': string[];
    'eu-west-1': string[];
    'eu-west-2': string[];
    'eu-west-3': string[];
    'me-south-1': string[];
    'sa-east-1': string[];
    'us-gov-west-1': string[];
    'us-gov-east-1': string[];
};
export declare const AWSworkerInstanceTypes: {
    label: string;
    children: ({
        label: string;
        children: {
            label: string;
            children: {
                value: string;
                description: string;
            }[];
        }[];
    } | {
        label: string;
        children: {
            value: string;
            description: string;
        }[];
    })[];
}[];

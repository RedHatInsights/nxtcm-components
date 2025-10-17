import { WizardCancel, WizardSubmit } from '../../src';
export declare enum CredentialsType {
    redhatcloud = "rhocm",
    ansible = "ans",
    openstack = "ost",
    aws = "aws",
    gcp = "gcp",
    azure = "azr",
    vmware = "vmw",
    ibm = "ibm",
    ibmpower = "ibmpower",
    ibmz = "ibmz",
    baremetal = "bmc",
    hybrid = "hybrid",
    other = "other"
}
export declare function CredentialsWizard(props: {
    onSubmit: WizardSubmit;
    onCancel: WizardCancel;
}): import("react/jsx-runtime").JSX.Element;

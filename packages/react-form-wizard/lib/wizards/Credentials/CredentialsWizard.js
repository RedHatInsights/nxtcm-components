import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnsibleTowerIcon, ServerIcon } from '@patternfly/react-icons';
import { Section, WizSelect, Step, WizTextArea, Tile, WizTiles, WizardPage, WizTextInput, } from '../../src';
import { isValidKubernetesResourceName } from '../common/validation';
import AWSIcon from './icons/AWSIcon';
import AzureIcon from './icons/AzureIcon';
import GCPIcon from './icons/GCPIcon';
import HybridIcon from './icons/HybridIcon';
import RedHatIcon from './icons/RedHatIcon';
import VMWareIcon from './icons/VMWareIcon';
export var CredentialsType;
(function (CredentialsType) {
    CredentialsType["redhatcloud"] = "rhocm";
    CredentialsType["ansible"] = "ans";
    CredentialsType["openstack"] = "ost";
    CredentialsType["aws"] = "aws";
    CredentialsType["gcp"] = "gcp";
    CredentialsType["azure"] = "azr";
    CredentialsType["vmware"] = "vmw";
    CredentialsType["ibm"] = "ibm";
    CredentialsType["ibmpower"] = "ibmpower";
    CredentialsType["ibmz"] = "ibmz";
    CredentialsType["baremetal"] = "bmc";
    CredentialsType["hybrid"] = "hybrid";
    CredentialsType["other"] = "other";
})(CredentialsType || (CredentialsType = {}));
export function CredentialsWizard(props) {
    return (_jsxs(WizardPage, { title: "Add credentials", defaultData: {
            apiVersion: 'v1',
            kind: 'Secret',
            type: 'Opaque',
            metadata: {
                name: '',
                namespace: '',
                labels: { 'cluster.open-cluster-management.io/credentials': '' },
            },
        }, onSubmit: props.onSubmit, onCancel: props.onCancel, children: [_jsx(Step, { label: "Credential type", id: "credential-type", children: _jsxs(Section, { label: "Credentials type", children: [_jsxs(WizTiles, { id: "cloudCredentials", path: "metadata.labels.cluster\\.open-cluster-management\\.io/type", label: "Cloud provider credentials", children: [_jsx(Tile, { id: CredentialsType.aws, icon: _jsx(AWSIcon, {}), value: CredentialsType.aws, label: "Amazon Web Services" }), _jsx(Tile, { id: CredentialsType.azure, icon: _jsx(AzureIcon, {}), value: CredentialsType.azure, label: "Microsoft Azure" }), _jsx(Tile, { id: CredentialsType.gcp, icon: _jsx(GCPIcon, {}), value: CredentialsType.gcp, label: "Google Cloud Platform" })] }), _jsxs(WizTiles, { id: "datacenterCredentials", path: "metadata.labels.cluster\\.open-cluster-management\\.io/type", label: "Datacenter credentials", children: [_jsx(Tile, { id: CredentialsType.openstack, icon: _jsx(RedHatIcon, {}), value: CredentialsType.openstack, label: "Red Hat OpenStack Platform" }), _jsx(Tile, { id: CredentialsType.vmware, icon: _jsx(VMWareIcon, {}), value: CredentialsType.vmware, label: "VMWare vSphere" }), _jsx(Tile, { id: CredentialsType.baremetal, icon: _jsx(ServerIcon, { color: "slategray" }), value: CredentialsType.baremetal, label: "Bare metal" })] }), _jsxs(WizTiles, { id: "automationCredentials", path: "metadata.labels.cluster\\.open-cluster-management\\.io/type", label: "Automation & other credentials", children: [_jsx(Tile, { id: CredentialsType.ansible, icon: _jsx("span", { style: { color: '#EE0000' }, children: _jsx(AnsibleTowerIcon, {}) }), value: CredentialsType.ansible, label: "Red Hat Ansible Automation Platform" }), _jsx(Tile, { id: CredentialsType.redhatcloud, icon: _jsx(RedHatIcon, {}), value: CredentialsType.redhatcloud, label: "Red Hat OpenShift Cluster Manager" })] }), _jsx(WizTiles, { id: 'centrallyManagedCredentials', path: "metadata.labels.cluster\\.open-cluster-management\\.io/type", label: "Centrally managed", children: _jsx(Tile, { id: CredentialsType.hybrid, icon: _jsx(HybridIcon, {}), value: CredentialsType.hybrid, label: "On premise" }) })] }) }), _jsx(Step, { label: "Basic Information", id: "basic-information", children: _jsxs(Section, { label: "Details", prompt: "Enter the details for the credentials", children: [_jsx(WizTextInput, { id: "name", path: "metadata.name", label: "Name", required: true, validation: isValidKubernetesResourceName }), _jsx(WizSelect, { id: "namespace", path: "metadata.namespace", label: "Namespace", helperText: "The namespace on the hub cluster where the resources will be created.", options: ['default'], required: true }), _jsx(WizTextInput, { id: "base-domain", path: "stringData.baseDomain", label: "Base DNS domain", placeholder: "Enter the Base DNS domain" })] }) }), _jsx(Step, { label: "Amazon Web Services", id: "amazon-web-services", hidden: (item) => item.metadata?.labels?.['cluster.open-cluster-management.io/type'] !== CredentialsType.aws, children: _jsxs(Section, { label: "Amazon Web Services", prompt: "Enter the Amazon Web Services credentials", children: [_jsx(WizTextInput, { id: "aws-key-id", path: "stringData.aws_access_key_id", label: "Access key ID", required: true }), _jsx(WizTextInput, { id: "aws-access-key", path: "stringData.aws_secret_access_key", label: "Secret access key", required: true, secret: true })] }) }), _jsx(Step, { label: "Proxy", id: "proxy", children: _jsxs(Section, { label: "Proxy", prompt: "", children: [_jsx(WizTextInput, { id: "http-proxy", path: "stringData.httpProxy", label: "HTTP Proxy", placeholder: "Enter the HTTP Proxy url" }), _jsx(WizTextInput, { id: "https-proxy", path: "stringData.httpsProxy", label: "HTTPS Proxy", placeholder: "Enter the HTTPS Proxy url" }), _jsx(WizTextInput, { id: "no-proxy", path: "stringData.noProxy", label: "No Proxy", placeholder: "Enter the comma deliminated list of urls that do not require a proxy" }), _jsx(WizTextArea, { id: "trust-bundle", path: "stringData.additionalTrustBundle", label: "Additional Trust Bundle", placeholder: "Enter your additional trust bundle" })] }) }), _jsx(Step, { label: "Pull secret and SSH", id: "pull-secret-and-ssh", children: _jsxs(Section, { label: "Pull secret and SSH", prompt: "Enter the pull secret and SSH keys", children: [_jsx(WizTextArea, { id: "pull-secret", path: "stringData.pullSecret", label: "Pull secret", required: true, secret: true }), _jsx(WizTextArea, { id: "ssh-private-key", path: "stringData.ssh-privatekey", label: "SSH private key", placeholder: "Enter the SSH private key", required: true, secret: true }), _jsx(WizTextArea, { id: "ssh-public-key", path: "stringData.ssh-publickey", label: "SSH public key", placeholder: "Enter the SSH public key", required: true, secret: true })] }) })] }));
}
//# sourceMappingURL=CredentialsWizard.js.map
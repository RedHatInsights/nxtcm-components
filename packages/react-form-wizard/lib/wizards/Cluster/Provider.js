import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon, Stack } from '@patternfly/react-core';
import { ServerIcon, VirtualMachineIcon } from '@patternfly/react-icons';
import { useHistory } from 'react-router-dom';
import { WizHidden, ItemContext, WizNumberInput, Section, WizSelect, WizSingleSelect, Step, WizSwitch, WizTableSelect, WizTextDetail, WizardPage, WizArrayInput, WizTextInput, } from '../../src';
import { Catalog } from '../Catalog';
import { RouteE } from '../Routes';
import ALIBABA from './icons/alibaba.svg';
import AWS from './icons/aws.svg';
import AZURE from './icons/azure.svg';
import GOOGLE from './icons/google-cloud.svg';
export function ProviderCatalog() {
    const history = useHistory();
    return (_jsx(Catalog, { title: "Provider", breadcrumbs: [{ label: 'Provider' }], cards: [
            {
                icon: _jsx(ALIBABA, {}),
                title: 'ALIBABA',
                descriptions: ['Create and manage your clusters through ALIBABA cloud.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['Standalone'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
            {
                icon: _jsx(AWS, {}),
                title: 'Amazon Web Services',
                descriptions: ['Create and manage your clusters through Amazon cloud.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['Hosted', 'Standalone', 'Managed'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
            {
                icon: (_jsx(Icon, { size: "lg", children: _jsx(ServerIcon, {}) })),
                title: 'Bare Metal',
                descriptions: ['Create and manage your clusters on your bare metal machines.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['Hosted', 'Standalone'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
            {
                icon: _jsx(GOOGLE, {}),
                title: 'Google Cloud',
                descriptions: ['Create and manage your clusters through Google cloud.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['Standalone'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
            {
                icon: _jsx(AZURE, {}),
                title: 'Microsoft Azure',
                descriptions: ['Create and manage your clusters through Azure cloud.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['Standalone', 'Managed'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
            {
                icon: (_jsx(Icon, { size: "lg", children: _jsx(VirtualMachineIcon, {}) })),
                title: 'VIRT',
                descriptions: ['Create and manage your clusters on virtual machines.'],
                featureGroups: [{ title: 'Available Control Planes', features: ['VSphere', 'RHV', 'OpenStack'] }],
                onClick: () => history.push(RouteE.ControlPlane),
            },
        ] }));
}
export function ControlPlaneCatalog() {
    const history = useHistory();
    return (_jsx(Catalog, { title: "Control Plane Type", breadcrumbs: [{ label: 'Provider', to: RouteE.Provider }, { label: 'Control plane' }], cards: [
            {
                title: 'Hosted',
                descriptions: [
                    'Run OpenShift in a hyperscale manner with many control planes hosted on a central hosting service cluster.',
                ],
                featureGroups: [
                    {
                        title: 'Features',
                        features: [
                            'Lower cost clusters',
                            'Network and trust segment between control planes and workers',
                            'Rapid cluster creation',
                        ],
                    },
                    {
                        title: 'Available cluster types',
                        features: ['Hosted cluster'],
                    },
                ],
                onClick: () => history.push(RouteE.CreateCluster),
            },
            {
                title: 'Standalone',
                descriptions: ['Run an OpenShift cluster with dedicated control plane nodes.'],
                featureGroups: [
                    {
                        title: 'Features',
                        features: [
                            'Increase resiliency with mulitple masters',
                            'Isolateion of workload creates secure profile',
                            'Dedicated control plane nodes',
                        ],
                    },
                    {
                        title: 'Available cluster types',
                        features: ['ACM Hub', 'Hosting service cluster'],
                    },
                ],
            },
        ], onBack: () => history.push(RouteE.Provider) }));
}
export function HostsCatalog() {
    const history = useHistory();
    return (_jsx(Catalog, { title: "Hosts", breadcrumbs: [{ label: 'Provider', to: RouteE.Provider }, { label: 'Control plane' }], cards: [
            {
                title: 'Use existing hosts',
                descriptions: [
                    'Create a cluster from hosts that have been discoverred and made available via infrstructure environments.',
                ],
            },
            {
                title: 'Discover new hosts',
                descriptions: [
                    'Discover new hosts when creating the cluster without prior need to create on infrstructure environment.',
                ],
            },
            {
                title: 'IPI existing?',
            },
        ], onBack: () => history.push(RouteE.Provider) }));
}
export function CreateCluster() {
    const history = useHistory();
    return (_jsxs(WizardPage, { title: "Create cluster", breadcrumb: [
            { label: 'Provider', to: RouteE.Provider },
            { label: 'Control plane', to: RouteE.ControlPlane },
            { label: 'Create cluster' },
        ], onSubmit: () => Promise.resolve(undefined), onCancel: () => history.push(RouteE.ControlPlane), defaultData: { clusterSet: 'default', hostingCluster: 'local-cluster' }, children: [_jsx(Step, { label: "Details", id: "cluster-details-step", children: _jsxs(Section, { label: "Cluster Details", children: [_jsx(WizTextInput, { label: "Name", path: "name", required: true }), _jsx(WizSingleSelect, { label: "Cluster set", path: "clusterSet", options: ['default', 'cluster-set-1'], helperText: "A cluster set enables grouping of clusters and access control for those clusters.", required: true })] }) }), _jsxs(Step, { label: "Hosts", id: "work-pools-step", children: [_jsx(Section, { label: "Control plane location", children: _jsx(WizSingleSelect, { label: "Cluster", path: "hostingCluster", options: ['local-cluster'], required: true, helperText: "By default, the local-cluster will be selected as the hosting service cluster in order to run OpenShift in a hyperscale maneer with many control planes hosted on a central hosting service cluster." }) }), _jsxs(WizArrayInput, { path: "workerPools", helperText: "Worker pools are created from infrastructure environment hosts.", label: "Worker pools", placeholder: "Add worker pool", collapsedContent: _jsx(ItemContext.Consumer, { children: (item) => {
                                const typedItem = item;
                                return (_jsxs(Stack, { hasGutter: true, children: [_jsx(WizTextDetail, { path: "name", placeholder: "Expand to edit the worker pool details" }), typedItem.name && (typedItem.hosts?.length ?? 0) > 0 && (_jsx("div", { children: _jsxs("small", { children: [typedItem.hosts?.length, " worker nodes"] }) }))] }));
                            } }), expandedContent: _jsx("div", { children: "Enter worker pool details" }), isSection: true, newValue: { numberOfHosts: 1 }, children: [_jsx(WizTextInput, { path: "name", label: "Worker pool name", required: true }), _jsx(WizSingleSelect, { label: "Infrastructure environment", path: "infraEnv", options: ['infrastructure-1'], required: true }), _jsxs(WizHidden, { hidden: (item) => !item.infraEnv, children: [_jsx(WizSwitch, { path: "auto", label: "Auto select hosts" }), _jsx(WizNumberInput, { label: "Number of hosts", path: "numberOfHosts", min: 1, hidden: (item) => !item.auto }), _jsx(WizTableSelect, { label: "Infrastructure hosts", path: "hosts", columns: [
                                            { name: 'Name', cellFn: (item) => item.name },
                                            { name: 'Status', cellFn: (item) => item.status },
                                            { name: 'Cores', cellFn: (item) => item.cores },
                                            { name: 'Memory', cellFn: (item) => item.memory },
                                            { name: 'Storage', cellFn: (item) => item.storage },
                                        ], items: new Array(16).fill(0).map((_, i) => ({
                                            name: `host-${i.toString().padStart(4, '0')}`,
                                            status: 'Ready',
                                            cores: '8',
                                            memory: '16 GB',
                                            storage: '128 GB',
                                        })), itemToValue: (item) => item.name, valueMatchesItem: (value, item) => value === item.name, emptyTitle: "Nothing available for selection.", emptyMessage: "Nothing available for selection.", hidden: (item) => item.auto })] })] })] }), _jsx(Step, { label: "Automation", id: "automation-step", children: _jsx(Section, { label: "Automation", description: "Choose an automation job template to automatically run Ansible jobs at differrent stages of a clusters life cycle. To use this feature the Ansible Automation Platform Resource Operator must be installed.", children: _jsx(WizSelect, { label: "Ansible automation template", path: "ansibleAutomationtemplate", options: ['my-ansible-template-1', 'my-ansible-template-2'], placeholder: "Select the Ansible automation template" }) }) })] }));
}
//# sourceMappingURL=Provider.js.map
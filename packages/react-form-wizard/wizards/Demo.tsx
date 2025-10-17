import {
    Masthead,
    MastheadBrand,
    MastheadContent,
    MastheadMain,
    MastheadToggle,
    Nav,
    NavItem,
    NavList,
    Page,
    PageSidebar,
    PageToggleButton,
    Title,
    PageSidebarBody,
    Icon,
    MastheadLogo,
    Brand,
    Flex,
    FlexItem,
} from '@patternfly/react-core'
import { AnsibleTowerIcon, ApplicationsIcon, BarsIcon, ClusterIcon, GithubIcon, LockIcon, RedhatIcon } from '@patternfly/react-icons'
import { ReactNode } from 'react'
import { BrowserRouter, Link, useHistory, useLocation } from 'react-router-dom'
import { AnsibleExample } from './Ansible/AnsibleExample'
import { ApplicationExample } from './Application/ApplicationExample'
import { AppExample } from './AppWizard/AppExample'
import { ApplicationSetExamples, CreateApplicationSet, EditApplicationSet } from './Argo/ArgoExamples'
import ArgoIcon from './Argo/logos/ArgoIcon.svg'
import { Catalog } from './Catalog'
import { ClusterForm } from './Cluster/ClusterForm'
import { ControlPlaneCatalog, CreateCluster, ProviderCatalog } from './Cluster/Provider'
import { CredentialsExample } from './Credentials/CredentialsExample'
import AWSIcon from './Credentials/icons/AWSIcon'
import { HomeWizard } from './Home/HomeWizard'
import { AmazonHypershiftWizardExample } from './Hypershift/AWSHypershiftWizardExample'
import { InputsWizard } from './Inputs/InputsWizard'
import {
    CreatePlacement,
    CreatePlacementRule,
    EditPlacement,
    EditPlacementRule,
    EditPlacements,
    PlacementExamples,
} from './Placement/PlacementExamples'
import {
    CreatePolicy,
    EditPolicyCertificate,
    EditPolicyComplianceOperatorCisScan,
    EditPolicyComplianceOperatorE8Scan,
    EditPolicyComplianceOperatorInstall,
    EditPolicyEtcdEncryption,
    EditPolicyGatekeeperOperatorDownstream,
    EditPolicyImageManifestVuln,
    EditPolicyLimitClusterAdmin,
    EditPolicyLimitMemory,
    EditPolicyNamespace,
    EditPolicyPod,
    EditPolicyPsp,
    EditPolicyRole,
    EditPolicyRoleBinding,
    EditPolicyScc,
    PolicyExamples,
} from './Policy/PolicyExamples'
import { CreatePolicyAutomation, EditPolicyAutomation, PolicyAutomationExamples } from './PolicyAutomation/PolicyAutomationExamples'
import {
    CreatePolicySet,
    EditPolicySet1,
    EditPolicySet2,
    EditPolicySet3,
    EditPolicySet4,
    EditPolicySet5,
    EditPolicySet6,
    EditPolicySet7,
    EditPolicySet8,
    PolicySetExamples,
} from './PolicySet/PolicySetExamples'
import { RosaExample } from './ROSA/RosaExample'
import { RouteE } from './Routes'
import PFLabsIcon from './PFLabsLogo'

enum StateE {
    prototype = 'Prototype',
    alpha = 'Alpha',
    beta = 'Beta',
    production = 'Production',
    techPreview = 'Tech preview',
}

interface IWizard {
    shortName: string
    name: string
    icon?: ReactNode
    description?: string
    route: RouteE
    state?: StateE
    labels?: string[]
}

const wizards: IWizard[] = [
    {
        icon: (
            <Icon size="lg">
                <AWSIcon />
            </Icon>
        ),
        shortName: 'AmazonHyperShift',
        name: 'Amazon HyperShift Cluster',
        route: RouteE.AmazonHyperShift,
        description: 'Run OpenShift in a hyperscale manner with many control planes hosted on a central hosting service cluster.',
        labels: ['Advanced Cluster Management'],
        state: StateE.prototype,
    },
    {
        icon: (
            <span style={{ color: '#EE0000' }}>
                <Icon size="lg" isInline>
                    <AnsibleTowerIcon />{' '}
                </Icon>
            </span>
        ),
        shortName: 'Ansible',
        name: 'Ansible automation',
        route: RouteE.Ansible,
        description: 'Multi-Cluster Engine uses ansible to run ansible jobs during cluster provisioning and upgrade.',
        labels: ['Multi-Cluster Engine'],
        state: StateE.beta,
    },
    {
        icon: (
            <Icon size="lg">
                <ApplicationsIcon />
            </Icon>
        ),
        shortName: 'Application',
        name: 'Application',
        route: RouteE.Application,
        description: 'Advanced Cluster Management configures applications for deployment to clusters managed by ACM.',
        labels: ['Advanced Cluster Management'],
        state: StateE.alpha,
    },
    {
        icon: <ArgoIcon />,
        shortName: 'ArgoCD',
        name: 'ArgoCD',
        route: RouteE.ArgoCD,
        description: 'Advanced Cluster Management configures applications for deployment to clusters managed by ACM.',
        labels: ['Advanced Cluster Management'],
        state: StateE.beta,
    },
    {
        icon: (
            <Icon size="lg">
                <ClusterIcon />
            </Icon>
        ),
        shortName: 'Cluster',
        name: 'Cluster',
        route: RouteE.Cluster,
        state: StateE.prototype,
        description:
            'Multi-Cluster Engine creates clusters on cloud providers. This is an early prototype of a possible cluster wizard flow.',
        labels: ['Multi-Cluster Engine'],
    },
    {
        icon: (
            <Icon size="lg">
                <LockIcon />
            </Icon>
        ),
        shortName: 'Credentials',
        name: 'Credentials',
        route: RouteE.Credentials,
        description:
            'Multi-Cluster Engine uses credentials to provision clusters on cloud providers. Credentials are also used for integrations such as automation using Ansible.',
        labels: ['Multi-Cluster Engine'],
        state: StateE.alpha,
    },
    {
        shortName: 'Placement',
        name: 'Placement',
        route: RouteE.Placement,
        description:
            'Advanced Cluster Management has placement custom resources to control the placement of various resources on managed clusters. This is an early prototype of common wizard functionality for handling placement.',
        labels: ['Advanced Cluster Management'],
        state: StateE.prototype,
    },
    {
        shortName: 'Policy',
        name: 'Policy',
        route: RouteE.Policy,
        description:
            'Advanced Cluster Management uses policies to generate reports and validate a cluster compliance based on specified security standards, categories, and controls.',
        labels: ['Advanced Cluster Management'],
        state: StateE.beta,
    },
    {
        icon: (
            <span style={{ color: '#EE0000' }}>
                <Icon size="lg" isInline>
                    <AnsibleTowerIcon />{' '}
                </Icon>
            </span>
        ),
        shortName: 'Policy Automation',
        name: 'Policy Automation',
        route: RouteE.PolicyAutomation,
        description: 'Advanced Cluster Management uses policy automation to automate Ansible jobs with policies.',
        labels: ['Advanced Cluster Management'],
        state: StateE.beta,
    },
    {
        shortName: 'Policy Set',
        name: 'Policy Set',
        route: RouteE.PolicySet,
        description: 'Advanced Cluster Management groups policies in policy sets.',
        labels: ['Advanced Cluster Management'],
    },
    {
        icon: (
            <span style={{ color: '#EE0000' }}>
                <Icon size="lg" isInline>
                    <RedhatIcon />
                </Icon>
            </span>
        ),
        shortName: 'ROSA',
        name: 'ROSA',
        route: RouteE.ROSA,
        description:
            "Red Hat OpenShift Service on AWS provides a model that allows Red Hat to deploy clusters into a customer's existing Amazon Web Service (AWS) account.",
        state: StateE.prototype,
    },
]

export default function Demo() {
    return (
        <BrowserRouter>
            <Page
                masthead={<DemoHeader />}
                sidebar={<DemoSidebar />}
                isManagedSidebar
                defaultManagedSidebarIsOpen={true}
                style={{ height: '100vh', width: '100%' }}
            >
                <DemoRouter />
            </Page>
        </BrowserRouter>
    )
}
export function DemoRouter(): JSX.Element {
    const location = useLocation()
    switch (location.search) {
        case RouteE.AmazonHyperShift:
            return <AmazonHypershiftWizardExample />
        case RouteE.Ansible:
            return <AnsibleExample />
        case RouteE.Application:
            return <ApplicationExample />
        case RouteE.ArgoCD:
            return <ApplicationSetExamples />
        case RouteE.CreateArgoCD:
            return <CreateApplicationSet />
        case RouteE.EditArgoCD:
            return <EditApplicationSet />
        case RouteE.App:
            return <AppExample />
        case RouteE.Cluster:
            return <ClusterForm />
        case RouteE.Credentials:
            return <CredentialsExample />
        case RouteE.PolicyAutomation:
            return <PolicyAutomationExamples />
        case RouteE.CreatePolicyAutomation:
            return <CreatePolicyAutomation />
        case RouteE.EditPolicyAutomation:
            return <EditPolicyAutomation />
        case RouteE.Policy:
            return <PolicyExamples />
        case RouteE.CreatePolicy:
            return <CreatePolicy />
        case RouteE.EditPolicyLimitClusterAdmin:
            return <EditPolicyLimitClusterAdmin />
        case RouteE.EditPolicyRole:
            return <EditPolicyRole />
        case RouteE.EditPolicyRoleBinding:
            return <EditPolicyRoleBinding />
        case RouteE.EditPolicyComplianceOperatorInstall:
            return <EditPolicyComplianceOperatorInstall />
        case RouteE.EditPolicyComplianceOperatorCisScan:
            return <EditPolicyComplianceOperatorCisScan />
        case RouteE.EditPolicyComplianceOperatorE8Scan:
            return <EditPolicyComplianceOperatorE8Scan />
        case RouteE.EditPolicyGatekeeperOperatorDownstream:
            return <EditPolicyGatekeeperOperatorDownstream />
        case RouteE.EditPolicyNamespace:
            return <EditPolicyNamespace />
        case RouteE.EditPolicyPod:
            return <EditPolicyPod />
        case RouteE.EditPolicyCertificate:
            return <EditPolicyCertificate />
        case RouteE.EditPolicyEtcdEncryption:
            return <EditPolicyEtcdEncryption />
        case RouteE.EditPolicyLimitMemory:
            return <EditPolicyLimitMemory />
        case RouteE.EditPolicyImageManifestVuln:
            return <EditPolicyImageManifestVuln />
        case RouteE.EditPolicyPsp:
            return <EditPolicyPsp />
        case RouteE.EditPolicyScc:
            return <EditPolicyScc />
        case RouteE.Placement:
            return <PlacementExamples />
        case RouteE.CreatePlacement:
            return <CreatePlacement />
        case RouteE.CreatePlacementRule:
            return <CreatePlacementRule />
        case RouteE.EditPlacement:
            return <EditPlacement />
        case RouteE.EditPlacementRule:
            return <EditPlacementRule />
        case RouteE.EditPlacements:
            return <EditPlacements />
        case RouteE.PolicySet:
            return <PolicySetExamples />
        case RouteE.CreatePolicySet:
            return <CreatePolicySet />
        case RouteE.EditPolicySet1:
            return <EditPolicySet1 />
        case RouteE.EditPolicySet2:
            return <EditPolicySet2 />
        case RouteE.EditPolicySet3:
            return <EditPolicySet3 />
        case RouteE.EditPolicySet4:
            return <EditPolicySet4 />
        case RouteE.EditPolicySet5:
            return <EditPolicySet5 />
        case RouteE.EditPolicySet6:
            return <EditPolicySet6 />
        case RouteE.EditPolicySet7:
            return <EditPolicySet7 />
        case RouteE.EditPolicySet8:
            return <EditPolicySet8 />
        case RouteE.ROSA:
            return <RosaExample />
        case RouteE.Inputs:
            return <InputsWizard />
        case RouteE.Wizards:
            return <ExampleWizards />
        case RouteE.Provider:
            return <ProviderCatalog />
        case RouteE.ControlPlane:
            return <ControlPlaneCatalog />
        case RouteE.CreateCluster:
            return <CreateCluster />
        default:
            return <HomeWizard />
    }
}

function ExampleWizards() {
    const history = useHistory()

    return (
        <Catalog
            title="Example Wizards"
            breadcrumbs={[{ label: 'Example Wizards' }]}
            filterGroups={[
                {
                    id: 'labels',
                    label: 'Products',
                    filters: [{ value: 'Advanced Cluster Management' }, { value: 'Multi-Cluster Engine' }],
                },
            ]}
            cards={wizards.map((wizard) => ({
                icon: wizard.icon,
                title: wizard.name,
                descriptions: wizard.description ? [wizard.description] : undefined,
                labels: wizard.labels,
                badge: wizard.state,
                onClick: () => history.push(wizard.route),
            }))}
        />
    )
}

function DemoHeader() {
    return (
        <Masthead display={{ default: 'inline' }}>
            <Flex alignItems={{default: 'alignItemsCenter'}}>
                <FlexItem>
                    <MastheadToggle>
                        <PageToggleButton variant="plain" aria-label="Global navigation">
                            <BarsIcon />
                        </PageToggleButton>
                    </MastheadToggle>
                </FlexItem>

                <FlexItem>
                    <MastheadMain>
                        <MastheadBrand>
                            <MastheadLogo component="a">
                                <Flex >
                                    <FlexItem alignSelf={{default: 'alignSelfFlexEnd'}}>
                                        <Icon>
                                            <PFLabsIcon />
                                        </Icon>
                                    </FlexItem>
                                    <FlexItem>
                                        <div style={{ color: 'white' }}>
                                            <Title headingLevel="h4" style={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                                                PatternFly Labs
                                            </Title>
                                            <Title headingLevel="h3" style={{ fontWeight: 'lighter', lineHeight: 1.3 }}>
                                                React Form Wizard
                                            </Title>
                                        </div>
                                    </FlexItem>

                                </Flex>


                            </MastheadLogo>
                        </MastheadBrand>
                    </MastheadMain>
                </FlexItem>

            </Flex>

            <MastheadContent>
                <span style={{ flexGrow: 1 }} />
                <a href="https://github.com/patternfly-labs/react-form-wizard" style={{ color: 'white' }}>
                    <Icon size="lg">
                        <GithubIcon />
                    </Icon>
                </a>
            </MastheadContent>
        </Masthead>
    )
}

function DemoSidebar() {
    const location = useLocation()
    return (
        <PageSidebar>
            <PageSidebarBody>
                <Nav>
                    <NavList>
                        <NavItem isActive={location.search === ''}>
                            <Link to={RouteE.Home}>Home</Link>
                        </NavItem>
                        <NavItem isActive={location.search === RouteE.Inputs}>
                            <Link to={RouteE.Inputs}>Inputs</Link>
                        </NavItem>
                        <NavItem isActive={location.search === RouteE.Wizards}>
                            <Link to={RouteE.Wizards}>Example Wizards</Link>
                        </NavItem>
                        {/* <NavExpandable title="Wizards" isExpanded={true}>
                            {wizards.map((wizard, index) => (
                                <NavItem key={index} isActive={location.search === wizard.route}>
                                    <Link to={wizard.route}>{wizard.shortName}</Link>
                                </NavItem>
                            ))}
                        </NavExpandable> */}
                    </NavList>
                </Nav>
            </PageSidebarBody>
        </PageSidebar>
    )
}

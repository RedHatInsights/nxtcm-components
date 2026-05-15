import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ROSAHCPWizard from './ROSAHCPWizard';
import {
  createMockRosaHcpWizardData,
  getMockStoryPrivateSubnets,
  rosaHcpWizardDetailsFieldsAllApiErrorsData,
} from './ROSAHCPWizard.stories.helpers';
import { MachineTypesDropdownType, Region, Role, ROSAHCPWizardData } from './types';
import fixtures from './ROSAHCPWizard.fixtures';
import { defaultRosaWizardStrings } from '../RosaWizard/rosaWizardStrings.defaults';

const onWizardSubmit = async (data: unknown) => {
  console.log('Wizard submitted with data:', data);
  await new Promise((resolve) => setTimeout(resolve, 1500));
};
const onWizardCancel = () => {
  console.log('Wizard was cancelled');
  alert('Wizard cancelled');
};

const mockWizardData: ROSAHCPWizardData = {
  awsInfrastructureAccounts: fixtures.mockResource(fixtures.mockAwsInfrastructureAccounts),
  awsBillingAccounts: fixtures.mockResource(fixtures.mockAwsBillingAccounts),
  regions: {
    ...fixtures.mockFetchResource<Region[], [awsAccount: string]>(fixtures.mockRegions),
    fetch: async () => {},
  },
  versions: {
    ...fixtures.mockFetchResource(fixtures.mockVersionsData),
    fetch: async () => {},
  },
  machineTypes: {
    ...fixtures.mockFetchResource<MachineTypesDropdownType[], [region: string]>(
      fixtures.mockMachineTypes
    ),
    fetch: async () => {},
  },
  roles: {
    ...fixtures.mockFetchResource<Role[], [awsAccount: string]>(fixtures.mockRoles),
    fetch: async () => {},
  },
  oidcConfig: fixtures.mockResource(fixtures.mockOicdConfig),
  vpcList: fixtures.mockResource(fixtures.mockVPCs),
  subnets: fixtures.mockResource(getMockStoryPrivateSubnets()),
  securityGroups: fixtures.mockResource(fixtures.mockSecurityGroups),
  clusterNameValidation: fixtures.mockValidationResource(),
};

function DefaultWithInitialLoading(props: React.ComponentProps<typeof ROSAHCPWizard>) {
  const [isFetching, setIsFetching] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsFetching(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const wizardData = React.useMemo<ROSAHCPWizardData>(
    () => ({
      ...props.wizardData,
      versions: { ...props.wizardData.versions, isFetching },
      awsInfrastructureAccounts: { ...props.wizardData.awsInfrastructureAccounts, isFetching },
      awsBillingAccounts: { ...props.wizardData.awsBillingAccounts, isFetching },
      regions: { ...props.wizardData.regions, isFetching },
      oidcConfig: { ...props.wizardData.oidcConfig, isFetching },
      vpcList: { ...props.wizardData.vpcList, isFetching },
      machineTypes: { ...props.wizardData.machineTypes, isFetching },
    }),
    [props.wizardData, isFetching]
  );
  return <ROSAHCPWizard {...props} wizardData={wizardData} />;
}

const meta: Meta<typeof ROSAHCPWizard> = {
  title: 'Wizards/RosaHCPWizard',
  component: ROSAHCPWizard,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', paddingBottom: '4rem', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ROSA (Red Hat OpenShift Service on AWS) Wizard component for creating ROSA clusters with a step-by-step interface. The wizard includes Basic setup steps (Details, Roles & Policies, Machine Pools, Networking), Additional setup steps (Encryption, Networking, Cluster-wide proxy, Cluster updates), and a Review step.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: 'Callback function called when the wizard is submitted',
      action: 'submitted',
    },
    onCancel: {
      description: 'Callback function called when the wizard is cancelled',
      action: 'cancelled',
    },
    title: {
      description: 'The title displayed at the top of the wizard',
      control: 'text',
    },
    wizardData: {
      description: 'Data object containing configuration for all wizard steps',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ROSAHCPWizard>;

/**
 * Default story with all required `wizardData` resources populated (aligned with Details step fixtures).
 * AWS infrastructure account, billing account, region, and OpenShift version start in a loading state,
 * then finish loading after 1 second. VPC list, subnets, and compute instance types use HCP wizard
 * Storybook fixtures (`mockVPCs`, `mockMachineTypes` from `ROSAHCPWizard.fixtures`).
 */
export const Default: Story = {
  render: (args) => <DefaultWithInitialLoading {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    wizardData: createMockRosaHcpWizardData(),
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      //await sleep(2000);
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    strings: defaultRosaWizardStrings,
  },
};

/** Wizard with initially loading state for fetched data */
export const WizardWithLoadingState: Story = {
  render: (args) => <DefaultWithInitialLoading {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    strings: defaultRosaWizardStrings,
    wizardData: mockWizardData,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
  },
};

export const AllApiErrors: Story = {
  args: {
    title: 'Create ROSA HCP Cluster — all API errors',
    yaml: true,
    strings: defaultRosaWizardStrings,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
    wizardData: rosaHcpWizardDetailsFieldsAllApiErrorsData,
  },
};

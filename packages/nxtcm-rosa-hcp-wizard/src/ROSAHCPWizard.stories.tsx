import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ROSAHCPWizard from './ROSAHCPWizard';
import {
  createMockRosaHcpWizardDataWithFetchLogging,
  getMockStoryPrivateSubnets,
  rosaHcpWizardDetailsFieldsAllApiErrorsData,
  useStoryClusterNameValidation,
} from './ROSAHCPWizard.stories.helpers';
import { MachineTypesDropdownType, Region, Role, ROSAHCPWizardData } from './types';
import fixtures from './ROSAHCPWizard.fixtures';
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

/** Default story wrapper: initial resource loading plus logged cluster name validation. */
function DefaultStoryWrapper(props: React.ComponentProps<typeof ROSAHCPWizard>) {
  const { clusterNameValidation, checkClusterNameUniqueness } = useStoryClusterNameValidation();
  const [isFetching, setIsFetching] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsFetching(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const wizardData = React.useMemo<ROSAHCPWizardData>(
    () => ({
      ...props.wizardData,
      clusterNameValidation,
      checkClusterNameUniqueness,
      versions: { ...props.wizardData.versions, isFetching },
      awsInfrastructureAccounts: { ...props.wizardData.awsInfrastructureAccounts, isFetching },
      awsBillingAccounts: { ...props.wizardData.awsBillingAccounts, isFetching },
      regions: { ...props.wizardData.regions, isFetching },
      oidcConfig: { ...props.wizardData.oidcConfig, isFetching },
      vpcList: { ...props.wizardData.vpcList, isFetching },
      machineTypes: { ...props.wizardData.machineTypes, isFetching },
    }),
    [props.wizardData, isFetching, clusterNameValidation, checkClusterNameUniqueness]
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
 * then finish loading after 1 second. VPC list, subnets, and compute instance types use ROSA HCP wizard
 * Storybook fixtures (`mockVPCs`, `mockMachineTypes` from `ROSAHCPWizard.fixtures`).
 * Cluster name uniqueness is mocked asynchronously — type `taken`, `existing`, or `my-cluster` to
 * see a duplicate-name error after ~800 ms (check the browser console for validation logs).
 */
export const Default: Story = {
  render: (args) => <DefaultStoryWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    wizardData: createMockRosaHcpWizardDataWithFetchLogging(),
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
  },
};

/** Wizard with initially loading state for fetched data */
export const WizardWithLoadingState: Story = {
  render: (args) => <DefaultWithInitialLoading {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    wizardData: mockWizardData,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
  },
};

export const AllApiErrors: Story = {
  args: {
    title: 'Create ROSA HCP Cluster — all API errors',
    yaml: true,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
    wizardData: rosaHcpWizardDetailsFieldsAllApiErrorsData,
  },
};

/**
 * Default story that shows a submit error after the wizard is submitted.
 * "Back to the wizard" clears the error after a one-second delay.
 */
function SubmitErrorWrapper(props: React.ComponentProps<typeof ROSAHCPWizard>) {
  const [submitError, setSubmitError] = React.useState<string | boolean | undefined>(undefined);

  return (
    <DefaultWithInitialLoading
      {...props}
      onSubmitError={submitError}
      onSubmit={async (data) => {
        console.log('Wizard submitted with data:', data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSubmitError(
          'There has been an error - any error message returned from the API will display here.'
        );
      }}
      onCancel={() => {
        setSubmitError(undefined);
        props.onCancel();
      }}
      onBackToReviewStep={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitError(undefined);
      }}
    />
  );
}

export const SubmitError: Story = {
  render: (args) => <SubmitErrorWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    wizardData: createMockRosaHcpWizardData(),
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
  },
};

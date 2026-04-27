import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RosaWizard } from './RosaWizard';
import type {
  MachineTypesDropdownType,
  OIDCConfig,
  Region,
  AWSInfrastructureAccounts,
  OpenShiftVersionsData,
  Resource,
  Role,
  SelectDropdownType,
  ValidationResource,
  VPC,
} from '../types';
import type { BasicSetupStepProps } from './RosaWizard';

// wraps static mock data in the Resource shape for stories
const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

const mockValidationResource = (): ValidationResource => ({
  error: null,
  isFetching: false,
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Default story: versions start loading, then resolve after 3 seconds. */
function DefaultWithInitialVersionLoading(props: React.ComponentProps<typeof RosaWizard>) {
  const [versionsFetching, setVersionsFetching] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setVersionsFetching(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const [awsIsFetching, setAwsIsFetching] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setAwsIsFetching(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const wizardsStepsData = React.useMemo(
    () => ({
      ...props.wizardsStepsData,
      basicSetupStep: {
        ...props.wizardsStepsData.basicSetupStep,
        versions: {
          ...props.wizardsStepsData.basicSetupStep.versions,
          isFetching: versionsFetching,
        },
        awsInfrastructureAccounts: {
          ...props.wizardsStepsData.basicSetupStep.awsInfrastructureAccounts,
          isFetching: awsIsFetching,
        },
      },
    }),
    [props.wizardsStepsData, versionsFetching, awsIsFetching]
  );

  return <RosaWizard {...props} wizardsStepsData={wizardsStepsData} />;
}

// Mock data for the wizard
const mockVersionsData: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [
    { label: 'OpenShift 4.11.5', value: '4.11.5' },
    { label: 'OpenShift 4.10.8', value: '4.10.8' },
  ],
};

/** When default and latest share the same value, wizard shows a single "Default (Recommended)" group. */
const mockOpenShiftVersionsDataDefaultEqualsLatest = {
  latest: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  default: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  releases: [
    { label: 'OpenShift 4.21.6', value: '4.21.6' },
    { label: 'OpenShift 4.21.5', value: '4.21.5' },
    { label: 'OpenShift 4.20.8', value: '4.20.8' },
  ],
};

const mockAwsInfrastructureAccounts = [
  {
    label: 'AWS Account - Production (123456789012)',
    value: 'aws-prod-123456789012',
  },
  {
    label: 'AWS Account - Staging (234567890123)',
    value: 'aws-staging-234567890123',
  },
  {
    label: 'AWS Account - Development (345678901234)',
    value: 'aws-dev-345678901234',
  },
];

const mockAwsBillingAccounts = [
  {
    label: 'Billing Account - Main (123456789012)',
    value: 'billing-main-123456789012',
  },
  {
    label: 'Billing Account - Secondary (234567890123)',
    value: 'billing-secondary-234567890123',
  },
];

const mockRegions = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
  { label: 'EU (Ireland)', value: 'eu-west-1' },
  { label: 'EU (Frankfurt)', value: 'eu-central-1' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
];

const mockRoles = [
  {
    installerRole: {
      label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      roleVersion: '4.21.6',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Support-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
      },
    ],
  },
  {
    installerRole: {
      label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Installer-Role',
      roleVersion: '4.21.8',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Support-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Worker-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Worker-Role',
      },
    ],
  },
  {
    // No roleVersion: this role is always shown regardless of selected cluster version
    installerRole: {
      label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Installer-Role',
      value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Installer-Role',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Support-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Worker-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-UNVERSIONED-Worker-Role',
      },
    ],
  },
];

const mockOicdConfig = [
  {
    label: 'oidc-config-test-id-1',
    value: 'oidc-config-test-id-1',
    issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-1',
  },
  {
    label: 'oidc-config-test-id-2',
    value: 'oidc-config-test-id-2',
    issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-2',
  },
];

const mockMachineTypes = [
  {
    id: 'm5a.xlarge',
    label: 'm5a.xlarge',
    description: '4 vCPU 16 GiB RAM',
    value: 'm5a.xlarge',
  },
  {
    id: 'm6a.xlarge',
    label: 'm6a.xlarge',
    description: '4 vCPU 16 GiB RAM',
    value: 'm6a.xlarge',
  },
];

const mockMachineTypesLimited = [
  {
    id: 'm6a.xlarge',
    label: 'm6a.xlarge',
    description: '4 vCPU 16 GiB RAM',
    value: 'm6a.xlarge',
  },
];

const mockSecurityGroups = [
  { id: 'sg-0a1b2c3d4e5f00001', name: 'default' },
  { id: 'sg-0a1b2c3d4e5f00002', name: 'k8s-traffic-rules' },
  { id: 'sg-0a1b2c3d4e5f00003', name: 'web-server-sg' },
  { id: 'sg-0a1b2c3d4e5f00004', name: 'database-access-sg' },
  { id: 'sg-0a1b2c3d4e5f00005', name: '' },
];

const mockVPCs = [
  {
    name: 'test-vpc-1',
    id: 'vpc-01496860a4b0475a3',
    aws_subnets: [
      {
        subnet_id: 'subnet-0cd89766e94deb008',
        name: 'test-1-subnet-public1-us-east-1b',
        availability_zone: 'us-east-1b',
        cidr_block: '10.0.16.0/20',
      },
      {
        subnet_id: 'subnet-032asd766e94deb008',
        name: 'test-1-subnet-private1-us-east-1a',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.128.0/20',
      },
      {
        subnet_id: 'subnet-032as34ty2a6e94deb008',
        name: 'test-1-subnet-public1-us-east-1a',
        availability_zone: 'us-east-1a',
        cidr_block: '10.0.160.0/20',
      },
      {
        subnet_id: 'subnet-03aas45qwe94deb008',
        name: 'test-1-subnet-private1-us-east-1b',
        availability_zone: 'us-east-1b',
        cidr_block: '10.0.144.0/20',
      },
      {
        subnet_id: 'subnet-03azxc15qwe94deb008',
        name: 'test-1-subnet-public1-us-east-1c',
        availability_zone: 'us-east-1c',
        cidr_block: '10.0.32.0/20',
      },
      {
        subnet_id: 'subnet-03aas45qzxc123deb008',
        name: 'test-1-subnet-private1-us-east-1c',
        availability_zone: 'us-east-1c',
        cidr_block: '10.0.160.0/20',
      },
    ],
    aws_security_groups: mockSecurityGroups,
  },
  {
    name: 'test-2-vpc',
    id: 'vpc-9866ceabc28332c7144',
    aws_subnets: [
      {
        name: 'test-subnet-private1-us-east-1a',
        availability_zone: 'us-east-1a',
        subnet_id: 'subnet-0b5b55dvdv12236d',
      },
      {
        name: 'test-subnet-public1-us-east-1a',
        availability_zone: 'us-east-1a',
        subnet_id: 'subnet-0b5b33hgvdv12236d',
      },
      {
        name: 'test-subnet-private1-us-east-1b',
        availability_zone: 'us-east-1a',
        subnet_id: 'subnet-0b5b5611aser12236d',
      },
      {
        name: 'test-subnet-public1-us-east-1b',
        availability_zone: 'us-east-1a',
        subnet_id: 'subnet-0b776hbdfdfdv12236d',
      },
    ],
  },
];

// shared baseline for basicSetupStep across stories — wraps all mock data in Resource shape
const mockBasicSetupStep: BasicSetupStepProps = {
  clusterNameValidation: mockValidationResource(),
  userRole: mockValidationResource(),
  versions: mockFetchResource(mockVersionsData),
  awsInfrastructureAccounts: mockResource(mockAwsInfrastructureAccounts),
  awsBillingAccounts: mockResource(mockAwsBillingAccounts),
  regions: mockFetchResource<Region[], [awsAccount: string]>(mockRegions),
  roles: mockFetchResource<Role[], [awsAccount: string]>(mockRoles),
  oidcConfig: mockResource(mockOicdConfig),
  machineTypes: mockResource(mockMachineTypes),
  vpcList: mockResource(mockVPCs),
  subnets: mockResource([]),
  securityGroups: mockResource([]),
};

const meta: Meta<typeof RosaWizard> = {
  title: 'Wizards/RosaWizard',
  component: RosaWizard,
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
    wizardsStepsData: {
      description: 'Data object containing configuration for all wizard steps',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RosaWizard>;

/**
 * Default story with all required data populated.
 * Versions start in a loading state (isFetching true), then resolve after 3 seconds.
 */
export const Default: Story = {
  render: (args) => <DefaultWithInitialVersionLoading {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/** Shared API error string for the `AllApiErrors` story (popover/detail body). */
const storyApiErrorMessage = 'This is the error returned from the API call';

/**
 * Every basic-setup resource reports an error so `FieldWithAPIErrorAlert` can be reviewed.
 * Mock data is kept so controls still populate for exploration.
 */
const basicSetupStepAllApiErrors: BasicSetupStepProps = {
  ...mockBasicSetupStep,
  clusterNameValidation: {
    error: storyApiErrorMessage,
    isFetching: false,
  },
  userRole: {
    error: storyApiErrorMessage,
    isFetching: false,
  },
  versions: {
    ...mockBasicSetupStep.versions,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  awsInfrastructureAccounts: {
    ...mockBasicSetupStep.awsInfrastructureAccounts,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  awsBillingAccounts: {
    ...mockBasicSetupStep.awsBillingAccounts,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  regions: {
    ...mockBasicSetupStep.regions,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  roles: {
    ...mockBasicSetupStep.roles,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  oidcConfig: {
    ...mockBasicSetupStep.oidcConfig,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  machineTypes: {
    ...mockBasicSetupStep.machineTypes,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  vpcList: {
    ...mockBasicSetupStep.vpcList,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  subnets: {
    ...mockBasicSetupStep.subnets,
    error: storyApiErrorMessage,
    isFetching: false,
  },
  securityGroups: {
    ...mockBasicSetupStep.securityGroups,
    error: storyApiErrorMessage,
    isFetching: false,
  },
};

export const AllApiErrors: Story = {
  args: {
    title: 'Create ROSA Cluster — all API errors',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted (story):', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled (story)');
    },
    wizardsStepsData: {
      basicSetupStep: basicSetupStepAllApiErrors,
    },
  },
};

/**
 * When default and latest versions have the same value (e.g. 4.21.8), only one group is shown:
 * "Default (Recommended)" — avoiding "Latest" to reduce anxiety for conservative enterprise customers.
 */
export const VersionsDefaultEqualsLatest: Story = {
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: mockFetchResource(mockOpenShiftVersionsDataDefaultEqualsLatest),
      },
    },
  },
};

/**
 * Wizard with minimal options - useful for testing scenarios with limited choices
 */
export const MinimalOptions: Story = {
  args: {
    title: 'Create ROSA Cluster - Limited Options',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: mockFetchResource({
          latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
          default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
          releases: [],
        }),
        awsInfrastructureAccounts: mockResource([
          {
            label: 'AWS Account - Production (123456789012)',
            value: 'aws-prod-123456789012',
          },
        ]),
        awsBillingAccounts: mockResource([
          {
            label: 'Billing Account - Main (123456789012)',
            value: 'billing-main-123456789012',
          },
        ]),
      },
    },
  },
};

/**
 * Wizard with empty options - demonstrates validation and empty states
 */
export const EmptyOptions: Story = {
  args: {
    title: 'Create ROSA Cluster - No Options Available',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: mockFetchResource({
          latest: { label: '', value: '' },
          default: { label: '', value: '' },
          releases: [],
        }),
        awsInfrastructureAccounts: mockResource([]),
        awsBillingAccounts: mockResource([]),
        regions: mockFetchResource([]),
      },
    },
  },
};

/**
 * Wizard with extensive options - tests performance with many items
 */
export const ExtensiveOptions: Story = {
  args: {
    title: 'Create ROSA Cluster - Many Options',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: mockFetchResource({
          latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
          default: { label: 'OpenShift 4.11.4', value: '4.11.4' },
          releases: Array.from({ length: 18 }, (_, i) => ({
            label: `OpenShift 4.${11 - Math.floor(i / 5)}.${i % 5}`,
            value: `4.${11 - Math.floor(i / 5)}.${i % 5}`,
          })),
        }),
        awsInfrastructureAccounts: mockResource(
          Array.from({ length: 15 }, (_, i) => ({
            label: `AWS Account - Environment ${i + 1} (${100000000000 + i})`,
            value: `aws-env-${i + 1}-${100000000000 + i}`,
          }))
        ),
        awsBillingAccounts: mockResource(
          Array.from({ length: 10 }, (_, i) => ({
            label: `Billing Account ${i + 1} (${100000000000 + i})`,
            value: `billing-${i + 1}-${100000000000 + i}`,
          }))
        ),
        vpcList: mockResource([
          ...mockVPCs,
          ...Array.from({ length: 5 }, (_, i) => ({
            name: `extensive-vpc-${i + 3}`,
            id: `vpc-extensive-${i + 3}`,
            aws_subnets: [
              {
                subnet_id: `subnet-ext-private-${i}-a`,
                name: `extensive-vpc-${i + 3}-subnet-private1-us-east-1a`,
                availability_zone: 'us-east-1a',
              },
              {
                subnet_id: `subnet-ext-public-${i}-a`,
                name: `extensive-vpc-${i + 3}-subnet-public1-us-east-1a`,
                availability_zone: 'us-east-1a',
              },
              {
                subnet_id: `subnet-ext-private-${i}-b`,
                name: `extensive-vpc-${i + 3}-subnet-private1-us-east-1b`,
                availability_zone: 'us-east-1b',
              },
              {
                subnet_id: `subnet-ext-public-${i}-b`,
                name: `extensive-vpc-${i + 3}-subnet-public1-us-east-1b`,
                availability_zone: 'us-east-1b',
              },
            ],
          })),
        ]),
        machineTypes: mockResource([
          ...mockMachineTypes,
          ...Array.from({ length: 10 }, (_, i) => ({
            id: `ext-instance-${i + 1}`,
            label: `ext-instance-${i + 1}.xlarge`,
            description: `${(i + 2) * 2} vCPU ${(i + 2) * 8} GiB RAM`,
            value: `ext-instance-${i + 1}.xlarge`,
          })),
        ]),
      },
    },
  },
};

/**
 * Wizard with custom title - demonstrates title customization
 */
export const CustomTitle: Story = {
  args: {
    title: 'Deploy Red Hat OpenShift Service on AWS',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/**
 * Wizard with error handling demonstration
 */
export const WithErrorHandling: Story = {
  args: {
    title: 'Create ROSA Cluster - Error Demo',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error('Failed to create cluster: AWS credentials are invalid');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/**
 * Wizard with rich machine pool options - demonstrates the Machine Pools step
 * with a variety of compute node instance types and VPC configurations with
 * multiple private/public subnets across availability zones.
 */
export const WithMachinePoolsOptions: Story = {
  args: {
    title: 'Create ROSA Cluster - Machine Pools',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        machineTypes: mockResource([
          ...mockMachineTypes,
          {
            id: 'c5.2xlarge',
            label: 'c5.2xlarge',
            description: '8 vCPU 16 GiB RAM',
            value: 'c5.2xlarge',
          },
          {
            id: 'r5.xlarge',
            label: 'r5.xlarge',
            description: '4 vCPU 32 GiB RAM',
            value: 'r5.xlarge',
          },
          {
            id: 'm5.4xlarge',
            label: 'm5.4xlarge',
            description: '16 vCPU 64 GiB RAM',
            value: 'm5.4xlarge',
          },
          {
            id: 'c6i.8xlarge',
            label: 'c6i.8xlarge',
            description: '32 vCPU 64 GiB RAM',
            value: 'c6i.8xlarge',
          },
        ]),
        vpcList: mockResource([
          {
            name: 'prod-vpc-multi-az',
            id: 'vpc-prod-multi-az-001',
            aws_subnets: [
              {
                subnet_id: 'subnet-mp-private-1a',
                name: 'prod-vpc-subnet-private1-us-east-1a',
                availability_zone: 'us-east-1a',
              },
              {
                subnet_id: 'subnet-mp-public-1a',
                name: 'prod-vpc-subnet-public1-us-east-1a',
                availability_zone: 'us-east-1a',
              },
              {
                subnet_id: 'subnet-mp-private-1b',
                name: 'prod-vpc-subnet-private1-us-east-1b',
                availability_zone: 'us-east-1b',
              },
              {
                subnet_id: 'subnet-mp-public-1b',
                name: 'prod-vpc-subnet-public1-us-east-1b',
                availability_zone: 'us-east-1b',
              },
              {
                subnet_id: 'subnet-mp-private-1c',
                name: 'prod-vpc-subnet-private1-us-east-1c',
                availability_zone: 'us-east-1c',
              },
              {
                subnet_id: 'subnet-mp-public-1c',
                name: 'prod-vpc-subnet-public1-us-east-1c',
                availability_zone: 'us-east-1c',
              },
            ],
            aws_security_groups: mockSecurityGroups,
          },
          ...mockVPCs,
        ]),
      },
    },
  },
};

/**
 * Wizard demonstrating the empty security groups state - when a VPC has no
 * security groups, an info alert is shown with a link to the AWS console
 * and a refresh button.
 */
export const NoSecurityGroups: Story = {
  args: {
    title: 'Create ROSA Cluster - No Security Groups',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        vpcList: mockResource(
          mockVPCs.map((vpc) => ({
            ...vpc,
            aws_security_groups: [],
          }))
        ),
      },
    },
  },
};

/**
 * Wizard simulating production environment setup
 */
export const ProductionSetup: Story = {
  args: {
    title: 'Create Production ROSA Cluster',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Production cluster submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      alert('Production cluster creation initiated. This may take up to 30 minutes.');
    },
    onCancel: () => {
      const confirmed = confirm('Are you sure you want to cancel production cluster creation?');
      if (confirmed) {
        console.log('Production wizard cancelled');
      }
    },
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: mockFetchResource({
          latest: { label: 'OpenShift 4.12.0 (LTS)', value: '4.12.0' },
          default: { label: 'OpenShift 4.11.5 (Stable)', value: '4.11.5' },
          releases: [],
        }),
        awsInfrastructureAccounts: mockResource([
          {
            label: 'AWS Production Account (987654321098)',
            value: 'aws-prod-987654321098',
          },
        ]),
        awsBillingAccounts: mockResource([
          {
            label: 'Corporate Billing Account (987654321098)',
            value: 'billing-corp-987654321098',
          },
        ]),
      },
    },
  },
};

/**
 * Default story that shows an error on submit.
 */
function SubmitErrorWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(false);
  return (
    <RosaWizard
      {...props}
      onSubmitError={submitError}
      onSubmit={async (data: any) => {
        console.log('Wizard submitted with data:', data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSubmitError(
          'The data provided is not valid .... this is the error message returned from the API.'
        );
        if (props.onSubmit) {
          return props.onSubmit(data);
        }
      }}
      onCancel={() => {
        setSubmitError(false);
        props.onCancel();
      }}
      onBackToReviewStep={() => setSubmitError(false)}
    />
  );
}

export const SubmitError: Story = {
  render: (args) => <SubmitErrorWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/**
 * Demonstrates async loading behaviour:
 * - AWS infrastructure accounts start loading, then populate after 2 s.
 * - When the user picks an account, the regions dropdown enters a loading
 *   state for 1.5 s before populating with mock regions.
 */
function AsyncLoadingWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [awsAccounts, setAwsAccounts] = React.useState<Resource<AWSInfrastructureAccounts[]>>({
    data: [],
    error: null,
    isFetching: true,
  });

  const [regions, setRegions] = React.useState<Resource<Region[]>>({
    data: [],
    error: null,
    isFetching: false,
  });

  const [machineTypes, setMachineTypes] = React.useState<Resource<MachineTypesDropdownType[]>>({
    data: mockMachineTypes,
    error: null,
    isFetching: false,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAwsAccounts({
        data: mockAwsInfrastructureAccounts,
        error: null,
        isFetching: false,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const machineTypesFetch = React.useCallback(async (region?: string) => {
    setMachineTypes((prev) => ({ ...prev, isFetching: true }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (region === 'us-east-1') {
      // fetching m6a and m5a
      setMachineTypes({ data: mockMachineTypes, error: null, isFetching: false });
    } else {
      // fetching only m6a
      setMachineTypes({ data: mockMachineTypesLimited, error: null, isFetching: false });
    }
  }, []);

  const regionsFetch = React.useCallback(async (awsAccount?: string) => {
    const mockedRegions = [
      { label: 'US East (N. Virginia)', value: 'us-east-1' },
      { label: 'US West (Oregon)', value: 'us-west-2' },
      { label: 'EU (London)', value: 'eu-west-2' },
      { label: 'EU (Paris)', value: 'eu-west-3' },
      { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
      { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
      { label: 'Canada (Central)', value: 'ca-central-1' },
    ];
    const mockedRegionsLimited = [
      { label: 'US East (N. Virginia) - Limited', value: 'us-east-1' },
      { label: 'US West (Oregon) - Limited', value: 'us-west-2' },
      { label: 'EU (Frankfurt)', value: 'eu-west-4' },
      { label: 'EU (Rome)', value: 'eu-west-5' },
    ];
    setRegions((prev) => ({ ...prev, isFetching: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (awsAccount === 'aws-dev-345678901234') {
      setRegions({ data: mockedRegionsLimited, error: null, isFetching: false });
    } else {
      setRegions({ data: mockedRegions, error: null, isFetching: false });
    }
  }, []);

  const basicSetupStep: BasicSetupStepProps = {
    ...props.wizardsStepsData.basicSetupStep,
    awsInfrastructureAccounts: awsAccounts,
    regions: { ...regions, fetch: regionsFetch },
    machineTypes: { ...machineTypes, fetch: machineTypesFetch },
  };

  return <RosaWizard {...props} wizardsStepsData={{ ...props.wizardsStepsData, basicSetupStep }} />;
}

export const AsyncLoading: Story = {
  render: (args) => <AsyncLoadingWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster - Async Loading',
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

const REFRESH_SIMULATED_DELAY_MS = 3000;

/**
 * Simulates ~3 s async refetches for AWS infrastructure accounts (Details), AWS billing accounts
 * (Details), and OIDC configuration (Roles & policies) when each field’s refresh control is used.
 */
function BasicSetupSimulatedRefetchesWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [awsInfrastructureAccounts, setAwsInfrastructureAccounts] = React.useState<
    Resource<AWSInfrastructureAccounts[]>
  >({
    data: mockAwsInfrastructureAccounts,
    error: null,
    isFetching: false,
  });

  const [awsBillingAccounts, setAwsBillingAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsBillingAccounts,
    error: null,
    isFetching: false,
  });

  const [oidcConfig, setOidcConfig] = React.useState<Resource<OIDCConfig[]>>({
    data: mockOicdConfig,
    error: null,
    isFetching: false,
  });

  const fetchAwsInfrastructureAccounts = React.useCallback(async () => {
    setAwsInfrastructureAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFRESH_SIMULATED_DELAY_MS);
    setAwsInfrastructureAccounts({
      data: [
        ...mockAwsInfrastructureAccounts,
        {
          label: 'AWS Account — loaded after refresh (999999999999)',
          value: 'aws-refreshed-999999999999',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchAwsBillingAccounts = React.useCallback(async () => {
    setAwsBillingAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFRESH_SIMULATED_DELAY_MS);
    setAwsBillingAccounts({
      data: [
        ...mockAwsBillingAccounts,
        {
          label: 'Billing Account — loaded after refresh (999999999999)',
          value: 'billing-refreshed-999999999999',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchOidcConfig = React.useCallback(async () => {
    setOidcConfig((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFRESH_SIMULATED_DELAY_MS);
    setOidcConfig({
      data: [
        ...mockOicdConfig,
        {
          label: 'refreshed-oidc-config-id',
          value: 'refreshed-oidc-config-id',
          issuer_url: 'https://oidc.os1.devshift.org/refreshed-after-refresh',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  return (
    <RosaWizard
      {...props}
      wizardsStepsData={{
        ...props.wizardsStepsData,
        basicSetupStep: {
          ...props.wizardsStepsData.basicSetupStep,
          awsInfrastructureAccounts: {
            ...awsInfrastructureAccounts,
            fetch: fetchAwsInfrastructureAccounts,
          },
          awsBillingAccounts: {
            ...awsBillingAccounts,
            fetch: fetchAwsBillingAccounts,
          },
          oidcConfig: {
            ...oidcConfig,
            fetch: fetchOidcConfig,
          },
        },
      }}
    />
  );
}

export const BasicSetupSimulatedRefetches: Story = {
  render: (args) => <BasicSetupSimulatedRefetchesWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster — simulated refresh (infra, billing, OIDC)',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Details: use the refresh control on AWS infrastructure account and on billing account — each shows ~3 s loading then an extra option. Roles & policies: refresh OIDC configuration for the same behavior.',
      },
    },
  },
};

const REFETCH_ALL_DELAY_MS = 2000;

/**
 * Simulates 2 s async refetches for every WizSelect refresh button across
 * the Basic Setup steps: AWS infrastructure accounts, AWS billing accounts,
 * OpenShift versions, OIDC configuration, and VPC list.
 */
function AllRefetchesWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [awsInfrastructureAccounts, setAwsInfrastructureAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsInfrastructureAccounts,
    error: null,
    isFetching: false,
  });

  const [awsBillingAccounts, setAwsBillingAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsBillingAccounts,
    error: null,
    isFetching: false,
  });

  const [versions, setVersions] = React.useState<Resource<OpenShiftVersionsData>>({
    data: mockVersionsData,
    error: null,
    isFetching: false,
  });

  const [oidcConfig, setOidcConfig] = React.useState<Resource<OIDCConfig[]>>({
    data: mockOicdConfig,
    error: null,
    isFetching: false,
  });

  const [vpcList, setVpcList] = React.useState<Resource<VPC[]>>({
    data: mockVPCs,
    error: null,
    isFetching: false,
  });

  const fetchAwsInfrastructureAccounts = React.useCallback(async () => {
    setAwsInfrastructureAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsInfrastructureAccounts({
      data: [
        ...mockAwsInfrastructureAccounts,
        {
          label: 'AWS Account — refreshed (999999999999)',
          value: 'aws-refreshed-999999999999',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchAwsBillingAccounts = React.useCallback(async () => {
    setAwsBillingAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsBillingAccounts({
      data: [
        ...mockAwsBillingAccounts,
        {
          label: 'Billing Account — refreshed (999999999999)',
          value: 'billing-refreshed-999999999999',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVersions = React.useCallback(async () => {
    setVersions((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVersions({
      data: mockVersionsData,
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchOidcConfig = React.useCallback(async () => {
    setOidcConfig((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setOidcConfig({
      data: [
        ...mockOicdConfig,
        {
          label: 'refreshed-oidc-config-id',
          value: 'refreshed-oidc-config-id',
          issuer_url: 'https://oidc.os1.devshift.org/refreshed-oidc',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVpcList = React.useCallback(async () => {
    setVpcList((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVpcList({
      data: mockVPCs,
      error: null,
      isFetching: false,
    });
  }, []);

  return (
    <RosaWizard
      {...props}
      wizardsStepsData={{
        ...props.wizardsStepsData,
        basicSetupStep: {
          ...props.wizardsStepsData.basicSetupStep,
          awsInfrastructureAccounts: {
            ...awsInfrastructureAccounts,
            fetch: fetchAwsInfrastructureAccounts,
          },
          awsBillingAccounts: {
            ...awsBillingAccounts,
            fetch: fetchAwsBillingAccounts,
          },
          versions: {
            ...versions,
            fetch: fetchVersions,
          },
          oidcConfig: {
            ...oidcConfig,
            fetch: fetchOidcConfig,
          },
          vpcList: {
            ...vpcList,
            fetch: fetchVpcList,
          },
        },
      }}
    />
  );
}

export const AllDropdownRefetches: Story = {
  render: (args) => <AllRefetchesWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster — all dropdown refetches',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Covers every WizSelect refresh button: AWS infrastructure account, AWS billing account, OpenShift versions (Details step), OIDC configuration (Roles & Policies step), and VPC list (Machine Pools / Networking steps). Each refresh enters a 2 s loading state then repopulates with the same (or slightly extended) mock data.',
      },
    },
  },
};

/**
 * Like AllDropdownRefetches but every refresh replaces the data with a
 * completely different set, so the user can verify the dropdown contents
 * actually change after a refetch.
 */
function RefetchWithNewDataWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [awsInfrastructureAccounts, setAwsInfrastructureAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsInfrastructureAccounts,
    error: null,
    isFetching: false,
  });

  const [awsBillingAccounts, setAwsBillingAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsBillingAccounts,
    error: null,
    isFetching: false,
  });

  const [versions, setVersions] = React.useState<Resource<OpenShiftVersionsData>>({
    data: mockVersionsData,
    error: null,
    isFetching: false,
  });

  const [oidcConfig, setOidcConfig] = React.useState<Resource<OIDCConfig[]>>({
    data: mockOicdConfig,
    error: null,
    isFetching: false,
  });

  const [vpcList, setVpcList] = React.useState<Resource<VPC[]>>({
    data: mockVPCs,
    error: null,
    isFetching: false,
  });

  const fetchAwsInfrastructureAccounts = React.useCallback(async () => {
    setAwsInfrastructureAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsInfrastructureAccounts({
      data: [
        {
          label: 'AWS Account - EU Production (555000111222)',
          value: 'aws-eu-prod-555000111222',
        },
        {
          label: 'AWS Account - APAC Staging (555000333444)',
          value: 'aws-apac-staging-555000333444',
        },
        {
          label: 'AWS Account - US Sandbox (555000555666)',
          value: 'aws-us-sandbox-555000555666',
        },
        {
          label: 'AWS Account - GovCloud (555000777888)',
          value: 'aws-govcloud-555000777888',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchAwsBillingAccounts = React.useCallback(async () => {
    setAwsBillingAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsBillingAccounts({
      data: [
        {
          label: 'Billing - EMEA Cost Center (600111222333)',
          value: 'billing-emea-600111222333',
        },
        {
          label: 'Billing - Global Operations (600444555666)',
          value: 'billing-global-ops-600444555666',
        },
        {
          label: 'Billing - R&D Budget (600777888999)',
          value: 'billing-rnd-600777888999',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVersions = React.useCallback(async () => {
    setVersions((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVersions({
      data: {
        latest: { label: 'OpenShift 4.22.1', value: '4.22.1' },
        default: { label: 'OpenShift 4.21.10', value: '4.21.10' },
        releases: [
          { label: 'OpenShift 4.21.9', value: '4.21.9' },
          { label: 'OpenShift 4.21.8', value: '4.21.8' },
          { label: 'OpenShift 4.20.12', value: '4.20.12' },
          { label: 'OpenShift 4.19.6', value: '4.19.6' },
        ],
      },
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchOidcConfig = React.useCallback(async () => {
    setOidcConfig((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setOidcConfig({
      data: [
        {
          label: 'oidc-config-test-id-3',
          value: 'oidc-config-test-id-3',
          issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-3',
        },
        {
          label: 'oidc-config-test-id-4',
          value: 'oidc-config-test-id-4',
          issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-4',
        },
        {
          label: 'oidc-config-test-id-5',
          value: 'oidc-config-test-id-5',
          issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-5',
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVpcList = React.useCallback(async () => {
    setVpcList((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVpcList({
      data: [
        {
          name: 'refreshed-prod-vpc',
          id: 'vpc-refreshed-prod-001',
          aws_subnets: [
            {
              subnet_id: 'subnet-ref-priv-1a',
              name: 'refreshed-prod-subnet-private1-us-west-2a',
              availability_zone: 'us-west-2a',
            },
            {
              subnet_id: 'subnet-ref-pub-1a',
              name: 'refreshed-prod-subnet-public1-us-west-2a',
              availability_zone: 'us-west-2a',
            },
            {
              subnet_id: 'subnet-ref-priv-1b',
              name: 'refreshed-prod-subnet-private1-us-west-2b',
              availability_zone: 'us-west-2b',
            },
            {
              subnet_id: 'subnet-ref-pub-1b',
              name: 'refreshed-prod-subnet-public1-us-west-2b',
              availability_zone: 'us-west-2b',
            },
          ],
          aws_security_groups: [
            { id: 'sg-ref-00001', name: 'refreshed-default' },
            { id: 'sg-ref-00002', name: 'refreshed-app-traffic' },
          ],
        },
        {
          name: 'refreshed-staging-vpc',
          id: 'vpc-refreshed-staging-002',
          aws_subnets: [
            {
              subnet_id: 'subnet-ref-stg-priv-1a',
              name: 'refreshed-staging-subnet-private1-eu-west-1a',
              availability_zone: 'eu-west-1a',
            },
            {
              subnet_id: 'subnet-ref-stg-pub-1a',
              name: 'refreshed-staging-subnet-public1-eu-west-1a',
              availability_zone: 'eu-west-1a',
            },
          ],
        },
        {
          name: 'refreshed-dev-vpc',
          id: 'vpc-refreshed-dev-003',
          aws_subnets: [
            {
              subnet_id: 'subnet-ref-dev-priv-1a',
              name: 'refreshed-dev-subnet-private1-ap-southeast-1a',
              availability_zone: 'ap-southeast-1a',
            },
            {
              subnet_id: 'subnet-ref-dev-pub-1a',
              name: 'refreshed-dev-subnet-public1-ap-southeast-1a',
              availability_zone: 'ap-southeast-1a',
            },
          ],
        },
      ],
      error: null,
      isFetching: false,
    });
  }, []);

  return (
    <RosaWizard
      {...props}
      wizardsStepsData={{
        ...props.wizardsStepsData,
        basicSetupStep: {
          ...props.wizardsStepsData.basicSetupStep,
          awsInfrastructureAccounts: {
            ...awsInfrastructureAccounts,
            fetch: fetchAwsInfrastructureAccounts,
          },
          awsBillingAccounts: {
            ...awsBillingAccounts,
            fetch: fetchAwsBillingAccounts,
          },
          versions: {
            ...versions,
            fetch: fetchVersions,
          },
          oidcConfig: {
            ...oidcConfig,
            fetch: fetchOidcConfig,
          },
          vpcList: {
            ...vpcList,
            fetch: fetchVpcList,
          },
        },
      }}
    />
  );
}

export const RefetchWithNewData: Story = {
  render: (args) => <RefetchWithNewDataWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster — refetch with different data',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Same as AllDropdownRefetches but every refresh replaces the dropdown contents with entirely new mock data — different AWS accounts, billing accounts, OpenShift versions, OIDC configs, and VPCs — so the change is clearly visible after each refetch.',
      },
    },
  },
};

/**
 * Simulates 2 s refetches that return the exact same data for every dropdown.
 * Verifies that a previously selected value is retained after the refresh
 * completes, since the item still exists in the returned list.
 */
function RefetchSameDataWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [awsInfrastructureAccounts, setAwsInfrastructureAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsInfrastructureAccounts,
    error: null,
    isFetching: false,
  });

  const [awsBillingAccounts, setAwsBillingAccounts] = React.useState<
    Resource<SelectDropdownType[]>
  >({
    data: mockAwsBillingAccounts,
    error: null,
    isFetching: false,
  });

  const [versions, setVersions] = React.useState<Resource<OpenShiftVersionsData>>({
    data: mockVersionsData,
    error: null,
    isFetching: false,
  });

  const [oidcConfig, setOidcConfig] = React.useState<Resource<OIDCConfig[]>>({
    data: mockOicdConfig,
    error: null,
    isFetching: false,
  });

  const [vpcList, setVpcList] = React.useState<Resource<VPC[]>>({
    data: mockVPCs,
    error: null,
    isFetching: false,
  });

  const fetchAwsInfrastructureAccounts = React.useCallback(async () => {
    setAwsInfrastructureAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsInfrastructureAccounts({
      data: mockAwsInfrastructureAccounts,
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchAwsBillingAccounts = React.useCallback(async () => {
    setAwsBillingAccounts((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setAwsBillingAccounts({
      data: mockAwsBillingAccounts,
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVersions = React.useCallback(async () => {
    setVersions((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVersions({
      data: mockVersionsData,
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchOidcConfig = React.useCallback(async () => {
    setOidcConfig((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setOidcConfig({
      data: mockOicdConfig,
      error: null,
      isFetching: false,
    });
  }, []);

  const fetchVpcList = React.useCallback(async () => {
    setVpcList((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(REFETCH_ALL_DELAY_MS);
    setVpcList({
      data: mockVPCs,
      error: null,
      isFetching: false,
    });
  }, []);

  return (
    <RosaWizard
      {...props}
      wizardsStepsData={{
        ...props.wizardsStepsData,
        basicSetupStep: {
          ...props.wizardsStepsData.basicSetupStep,
          awsInfrastructureAccounts: {
            ...awsInfrastructureAccounts,
            fetch: fetchAwsInfrastructureAccounts,
          },
          awsBillingAccounts: {
            ...awsBillingAccounts,
            fetch: fetchAwsBillingAccounts,
          },
          versions: {
            ...versions,
            fetch: fetchVersions,
          },
          oidcConfig: {
            ...oidcConfig,
            fetch: fetchOidcConfig,
          },
          vpcList: {
            ...vpcList,
            fetch: fetchVpcList,
          },
        },
      }}
    />
  );
}

export const RefetchWithSameData: Story = {
  render: (args) => <RefetchSameDataWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster — refetch with same data',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await sleep(2000);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Every dropdown refresh returns the exact same mock data. Select a value in each dropdown, then click refresh — the selected value should be preserved after the 2 s loading completes because the item still exists in the returned list.',
      },
    },
  },
};

/**
 * Demonstrates async cluster name uniqueness validation with debouncing.
 * Type "taken" or "existing" as a cluster name to see the duplicate error
 * after a simulated API delay. Any other valid name will pass.
 */
function AsyncClusterNameValidationWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const [validationState, setValidationState] = React.useState<ValidationResource>({
    error: null,
    isFetching: false,
  });

  const checkClusterNameUniqueness = React.useCallback((name: string, region?: string) => {
    setValidationState({ error: null, isFetching: true });

    // simulate API call with 800ms latency
    const timer = setTimeout(() => {
      const takenNames = ['taken', 'existing', 'my-cluster', 'production'];
      const takenRegion = ['us-west-1'];
      const isTaken = takenNames.includes(name);
      const takenRegionData = takenRegion.includes(region ? region : '');
      setValidationState({
        error:
          isTaken && takenRegionData
            ? `Cluster name "${name}" already exists. Choose a different name.`
            : null,
        isFetching: false,
      });
      console.log(
        `[Mock API] Checked "${name}" → ${isTaken && takenRegionData ? 'TAKEN' : 'available'}`
      );
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <RosaWizard
      {...props}
      wizardsStepsData={{
        ...props.wizardsStepsData,
        basicSetupStep: {
          ...props.wizardsStepsData.basicSetupStep,
          clusterNameValidation: validationState,
          checkClusterNameUniqueness,
        },
      }}
    />
  );
}

export const AsyncClusterNameValidation: Story = {
  render: (args) => <AsyncClusterNameValidationWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster - Async Name Validation',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tests async cluster name uniqueness validation. Names "taken", "existing", "my-cluster", and "production" are simulated as already in use. The debouncing (1s) happens inside the wizard component; the simulated API adds 800ms on top.',
      },
    },
  },
};

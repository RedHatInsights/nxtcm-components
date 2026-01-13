import type { Meta, StoryObj } from '@storybook/react';
import { RosaWizardWithYamlEditor } from './RosaWizardWithYamlEditor';

// Mock data for the wizard
const mockOpenShiftVersions = [
  { label: 'OpenShift 4.12.0', value: '4.12.0' },
  { label: 'OpenShift 4.11.5', value: '4.11.5' },
  { label: 'OpenShift 4.10.8', value: '4.10.8' },
];

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

const mockRoles = {
  installerRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
    },
  ],
  supportRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
    },
  ],
  workerRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
    },
  ],
};

const mockOicdConfig = [
  {
    label: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    value: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    issuer_url: 'https://oidc.os1.devshift.org/2kl4t2st8eg2u5jppv8kjeemkvimfm99',
  },
  {
    label: '2gjb8s2fo7p5ofg2evjfmk9j4t8k52e0',
    value: '2gjb8s2fo7p5ofg2evjfmk9j4t8k52e0',
    issuer_url: 'https://oidc.os1.devshift.org/2gjb8s2fo7p5ofg2evjfmk9j4t8k52e0',
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

const mockVPCs = [
  {
    name: 'test-vpc-1',
    id: 'vpc-01496860a4b0475a3',
    aws_subnets: [
      {
        subnet_id: 'subnet-0cd89766e94deb008',
        name: 'test-1-subnet-public1-us-east-1b',
        availability_zone: 'us-east-1b',
      },
      {
        subnet_id: 'subnet-032asd766e94deb008',
        name: 'test-1-subnet-private1-us-east-1a',
        availability_zone: 'us-east-1a',
      },
      {
        subnet_id: 'subnet-032as34ty2a6e94deb008',
        name: 'test-1-subnet-public1-us-east-1a',
        availability_zone: 'us-east-1a',
      },
      {
        subnet_id: 'subnet-03aas45qwe94deb008',
        name: 'test-1-subnet-private1-us-east-1b',
        availability_zone: 'us-east-1b',
      },
    ],
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

const meta: Meta<typeof RosaWizardWithYamlEditor> = {
  title: 'Wizards/RosaWizardWithYamlEditor',
  component: RosaWizardWithYamlEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ROSA Wizard with YAML editor.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RosaWizardWithYamlEditor>;

export const Default: Story = {
  args: {
    title: 'Create ROSA Cluster (with YAML Editor)',
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
        regions: mockRegions,
        roles: mockRoles,
        oicdConfig: mockOicdConfig,
        machineTypes: mockMachineTypes,
        vpcList: mockVPCs,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
      },
    },
  },
};

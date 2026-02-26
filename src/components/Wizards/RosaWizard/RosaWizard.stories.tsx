import type { Meta, StoryObj } from '@storybook/react';
import { RosaWizard } from './RosaWizard';

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

const meta: Meta<typeof RosaWizard> = {
  title: 'Wizards/RosaWizard',
  component: RosaWizard,
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
 * Default story with all required data populated
 */
export const Default: Story = {
  args: {
    title: 'Create ROSA Cluster',
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      // Simulate API call
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
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: [{ label: 'OpenShift 4.12.0', value: '4.12.0' }],
        awsInfrastructureAccounts: [
          {
            label: 'AWS Account - Production (123456789012)',
            value: 'aws-prod-123456789012',
          },
        ],
        awsBillingAccounts: [
          {
            label: 'Billing Account - Main (123456789012)',
            value: 'billing-main-123456789012',
          },
        ],
        regions: [
          { label: 'US East 1, US, Virginia', value: 'us-east-1' },
          { label: 'US West 1, US, Oregon', value: 'us-west-1' },
        ],
        roles: {
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
        },
        oicdConfig: mockOicdConfig,
        vpcList: mockVPCs,
        machineTypes: mockMachineTypes,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: [],
        awsInfrastructureAccounts: [],
        awsBillingAccounts: [],
        regions: [],
        roles: mockRoles,
        oicdConfig: mockOicdConfig,
        machineTypes: mockMachineTypes,
        vpcList: mockVPCs,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: Array.from({ length: 20 }, (_, i) => ({
          label: `OpenShift 4.${12 - Math.floor(i / 5)}.${i % 5}`,
          value: `4.${12 - Math.floor(i / 5)}.${i % 5}`,
        })),
        awsInfrastructureAccounts: Array.from({ length: 15 }, (_, i) => ({
          label: `AWS Account - Environment ${i + 1} (${100000000000 + i})`,
          value: `aws-env-${i + 1}-${100000000000 + i}`,
        })),
        awsBillingAccounts: Array.from({ length: 10 }, (_, i) => ({
          label: `Billing Account ${i + 1} (${100000000000 + i})`,
          value: `billing-${i + 1}-${100000000000 + i}`,
        })),
        vpcList: [
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
        ],
        oicdConfig: mockOicdConfig,
        machineTypes: [
          ...mockMachineTypes,
          ...Array.from({ length: 10 }, (_, i) => ({
            id: `ext-instance-${i + 1}`,
            label: `ext-instance-${i + 1}.xlarge`,
            description: `${(i + 2) * 2} vCPU ${(i + 2) * 8} GiB RAM`,
            value: `ext-instance-${i + 1}.xlarge`,
          })),
        ],
        regions: mockRegions,
        roles: mockRoles,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
        regions: mockRegions,
        roles: mockRoles,
        vpcList: mockVPCs,
        machineTypes: mockMachineTypes,
        oicdConfig: mockOicdConfig,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
      },
    },
  },
};

/**
 * Wizard with error handling demonstration
 */
export const WithErrorHandling: Story = {
  args: {
    title: 'Create ROSA Cluster - Error Demo',
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      // Simulate API call that fails
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error('Failed to create cluster: AWS credentials are invalid');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
        regions: mockRegions,
        roles: mockRoles,
        vpcList: mockVPCs,
        oicdConfig: mockOicdConfig,
        machineTypes: mockMachineTypes,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
      },
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
        regions: mockRegions,
        roles: mockRoles,
        oicdConfig: mockOicdConfig,
        machineTypes: [
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
        ],
        vpcList: [
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
        ],
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
      console.log('Wizard submitted with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
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
        vpcList: mockVPCs.map((vpc) => ({
          ...vpc,
          aws_security_groups: [],
        })),
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
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
    onSubmit: async (data: any) => {
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
        openShiftVersions: [
          { label: 'OpenShift 4.12.0 (LTS)', value: '4.12.0' },
          { label: 'OpenShift 4.11.5 (Stable)', value: '4.11.5' },
        ],
        awsInfrastructureAccounts: [
          {
            label: 'AWS Production Account (987654321098)',
            value: 'aws-prod-987654321098',
          },
        ],
        awsBillingAccounts: [
          {
            label: 'Corporate Billing Account (987654321098)',
            value: 'billing-corp-987654321098',
          },
        ],
        regions: [
          { label: 'US East 1, US, Virginia', value: 'us-east-1' },
          { label: 'US West 1, US, Oregon', value: 'us-west-1' },
        ],
        roles: {
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
        },
        oicdConfig: mockOicdConfig,
        machineTypes: mockMachineTypes,
        vpcList: mockVPCs,
      },
      callbackFunctions: {
        onAWSAccountChange: () => console.log('AWS ACCOUNT CHANGE CALLBACK'),
        refreshAwsBillingAccountCallback: () => console.log('AWS ACCOUNT REFRESH CALLBACK'),
        refreshAwsAccountDataCallback: () => console.log('AWS BILLING ACCOUNT REFRESH CALLBACK'),
      },
    },
  },
};

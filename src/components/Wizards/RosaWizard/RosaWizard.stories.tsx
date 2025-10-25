import type { Meta, StoryObj } from '@storybook/react';
import { RosaWizard } from './RosaWizard';

// Mock link components
const MockAwsControlPlaneLink = (
  <a href="https://example.com/control-plane" target="_blank" rel="noopener noreferrer">
    Learn more about control plane architecture
  </a>
);

const MockRosaArchitectureRenamingAlertLink = (
  <a href="https://example.com/renaming" target="_blank" rel="noopener noreferrer">
    Learn more about architecture renaming
  </a>
);

const MockVirtualPrivateCloudLink = (
  <a href="https://example.com/vpc" target="_blank" rel="noopener noreferrer">
    Learn more about VPC
  </a>
);

const MockRosaGetStartedLink = (
  <a href="https://example.com/get-started" target="_blank" rel="noopener noreferrer">
    GetStarted with ROSA
  </a>
);

// Mock history object
const mockHistory = {
  push: (path: string) => console.log('Navigate to:', path),
  goBack: () => console.log('Navigate back'),
  location: { pathname: '/' },
};

// Default mock props
const defaultStepsProps = {
  constrolPlane: {
    classNames: {},
    AwsControlPlaneLink: MockAwsControlPlaneLink,
    allowAlertFeatureFlag: true,
    rosaArchitectureRenaimingAlertLink: MockRosaArchitectureRenamingAlertLink,
    showRosaCliRequirement: true,
    rosaHostedCliMinVersion: '1.2.25',
    productName: 'Red Hat OpenShift Service on AWS (ROSA)',
    virtualPrivateCloudLink: MockVirtualPrivateCloudLink,
    isTileSelected: 'hcp',
    handleChange: () => console.log('Tile selection changed'),
    isHCPDisabled: false,
    linkToGetStarted: MockRosaGetStartedLink,
    rosaHomeGetStartedLink: MockRosaGetStartedLink,
    hasHostedProductQuota: true,
  },
};

// Initial wizard data - required for WizTiles and other form inputs
const defaultWizardData = {
  'control-plane-tiles': 'HCP', // Initialize the tiles value
};

const meta: Meta<typeof RosaWizard> = {
  title: 'Wizards/RosaWizard',
  component: RosaWizard,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Create ROSA Cluster',
    history: mockHistory,
    defaultData: defaultWizardData,
    stepsProps: defaultStepsProps,
    onSubmit: async (data: unknown) => {
      console.log('Form submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
};

export const WithAlertHidden: Story = {
  args: {
    title: 'Create ROSA Cluster',
    history: mockHistory,
    defaultData: defaultWizardData,
    stepsProps: {
      constrolPlane: {
        ...defaultStepsProps.constrolPlane,
        allowAlertFeatureFlag: false,
      },
    },
    onSubmit: async (data: unknown) => {
      console.log('Form submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
};

export const WithHCPDisabled: Story = {
  args: {
    title: 'Create ROSA Cluster',
    history: mockHistory,
    defaultData: {
      'control-plane-tiles': 'Classic', // Pre-select Classic
    },
    stepsProps: {
      constrolPlane: {
        ...defaultStepsProps.constrolPlane,
        isHCPDisabled: true,
        isTileSelected: 'classic',
      },
    },
    onSubmit: async (data: unknown) => {
      console.log('Form submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
};

export const WithoutCliRequirement: Story = {
  args: {
    title: 'Create ROSA Cluster',
    history: mockHistory,
    defaultData: defaultWizardData,
    stepsProps: {
      constrolPlane: {
        ...defaultStepsProps.constrolPlane,
        showRosaCliRequirement: false,
      },
    },
    onSubmit: async (data: unknown) => {
      console.log('Form submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
};

export const ClassicSelected: Story = {
  args: {
    title: 'Create ROSA Cluster',
    history: mockHistory,
    defaultData: {
      'control-plane-tiles': 'Classic', // Pre-select Classic
    },
    stepsProps: {
      constrolPlane: {
        ...defaultStepsProps.constrolPlane,
        isTileSelected: 'classic',
      },
    },
    onSubmit: async (data: unknown) => {
      console.log('Form submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
};

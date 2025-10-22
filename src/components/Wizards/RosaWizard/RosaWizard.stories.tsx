import type { Meta, StoryObj } from '@storybook/react';
import { RosaWizard } from './RosaWizard';

// Mock data for the wizard
const mockOpenShiftVersions = [
  { label: "OpenShift 4.12.0", value: "4.12.0" },
  { label: "OpenShift 4.11.5", value: "4.11.5" },
  { label: "OpenShift 4.10.8", value: "4.10.8" },
];

const mockAwsInfrastructureAccounts = [
  {
    label: "AWS Account - Production (123456789012)",
    value: "aws-prod-123456789012",
  },
  {
    label: "AWS Account - Staging (234567890123)",
    value: "aws-staging-234567890123",
  },
  {
    label: "AWS Account - Development (345678901234)",
    value: "aws-dev-345678901234",
  },
];

const mockAwsBillingAccounts = [
  {
    label: "Billing Account - Main (123456789012)",
    value: "billing-main-123456789012",
  },
  {
    label: "Billing Account - Secondary (234567890123)",
    value: "billing-secondary-234567890123",
  },
];

const mockRegions = [
  { label: "US East (N. Virginia) - us-east-1", value: "us-east-1" },
  { label: "US East (Ohio) - us-east-2", value: "us-east-2" },
  { label: "US West (N. California) - us-west-1", value: "us-west-1" },
  { label: "US West (Oregon) - us-west-2", value: "us-west-2" },
  { label: "EU (Ireland) - eu-west-1", value: "eu-west-1" },
  { label: "EU (Frankfurt) - eu-central-1", value: "eu-central-1" },
  { label: "Asia Pacific (Tokyo) - ap-northeast-1", value: "ap-northeast-1" },
];

const meta: Meta<typeof RosaWizard> = {
  title: 'Wizards/RosaWizard',
  component: RosaWizard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ROSA (Red Hat OpenShift Service on AWS) Wizard component for creating ROSA clusters with a step-by-step interface.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description: "Callback function called when the wizard is submitted",
      action: "submitted",
    },
    onCancel: {
      description: "Callback function called when the wizard is cancelled",
      action: "cancelled",
    },
    title: {
      description: "The title displayed at the top of the wizard",
      control: "text",
    },
    wizardsStepsData: {
      description: "Data object containing configuration for all wizard steps",
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
    title: "Create ROSA Cluster",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Cluster creation initiated successfully!");
    },
    onCancel: () => {
      console.log("Wizard cancelled");
      alert("Wizard cancelled");
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
      },
    },
  },
};

/**
 * Wizard with minimal options - useful for testing scenarios with limited choices
 */
export const MinimalOptions: Story = {
  args: {
    title: "Create ROSA Cluster - Limited Options",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: [{ label: "OpenShift 4.12.0", value: "4.12.0" }],
        awsInfrastructureAccounts: [
          {
            label: "AWS Account - Production (123456789012)",
            value: "aws-prod-123456789012",
          },
        ],
        awsBillingAccounts: [
          {
            label: "Billing Account - Main (123456789012)",
            value: "billing-main-123456789012",
          },
        ],
      },
    },
  },
};

/**
 * Wizard with empty options - demonstrates validation and empty states
 */
export const EmptyOptions: Story = {
  args: {
    title: "Create ROSA Cluster - No Options Available",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
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
      },
    },
  },
};

/**
 * Wizard with extensive options - tests performance with many items
 */
export const ExtensiveOptions: Story = {
  args: {
    title: "Create ROSA Cluster - Many Options",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
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
      },
    },
  },
};

/**
 * Wizard with custom title - demonstrates title customization
 */
export const CustomTitle: Story = {
  args: {
    title: "Deploy Red Hat OpenShift Service on AWS",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
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
      },
    },
  },
};

/**
 * Wizard with error handling demonstration
 */
export const WithErrorHandling: Story = {
  args: {
    title: "Create ROSA Cluster - Error Demo",
    onSubmit: async (data) => {
      console.log("Wizard submitted with data:", data);
      // Simulate API call that fails
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error("Failed to create cluster: AWS credentials are invalid");
    },
    onCancel: () => {
      console.log("Wizard cancelled");
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: mockOpenShiftVersions,
        awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
        awsBillingAccounts: mockAwsBillingAccounts,
      },
    },
  },
};

/**
 * Wizard simulating production environment setup
 */
export const ProductionSetup: Story = {
  args: {
    title: "Create Production ROSA Cluster",
    onSubmit: async (data) => {
      console.log("Production cluster submitted with data:", data);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      alert(
        "Production cluster creation initiated. This may take up to 30 minutes.",
      );
    },
    onCancel: () => {
      const confirmed = confirm(
        "Are you sure you want to cancel production cluster creation?",
      );
      if (confirmed) {
        console.log("Production wizard cancelled");
      }
    },
    wizardsStepsData: {
      basicSetupStep: {
        openShiftVersions: [
          { label: "OpenShift 4.12.0 (LTS)", value: "4.12.0" },
          { label: "OpenShift 4.11.5 (Stable)", value: "4.11.5" },
        ],
        awsInfrastructureAccounts: [
          {
            label: "AWS Production Account (987654321098)",
            value: "aws-prod-987654321098",
          },
        ],
        awsBillingAccounts: [
          {
            label: "Corporate Billing Account (987654321098)",
            value: "billing-corp-987654321098",
          },
        ],
      },
    },
  },
};

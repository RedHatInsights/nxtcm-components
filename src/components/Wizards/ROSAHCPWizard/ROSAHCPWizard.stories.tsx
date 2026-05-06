import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ROSAHCPWizard from './ROSAHCPWizard';

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
    wizardsStepsData: {
      description: 'Data object containing configuration for all wizard steps',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ROSAHCPWizard>;

/**
 * Default story with all required data populated.
 * Versions start in a loading state (isFetching true), then resolve after 3 seconds.
 */
export const Default: Story = {
  render: (args) => <ROSAHCPWizard {...args} />,
  args: {
    title: 'Create ROSA Cluster',
    yaml: true,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      //await sleep(2000);
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
  },
};

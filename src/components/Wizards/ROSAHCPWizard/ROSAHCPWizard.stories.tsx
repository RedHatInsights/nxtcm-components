import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ROSAHCPWizard from './ROSAHCPWizard';
import { createMockRosaHcpWizardData, rosaHcpWizardDetailsFieldsAllApiErrorsData } from './ROSAHCPWizard.stories.helpers';

/** Default story: AWS account, billing account, region, and OpenShift version start loading, then resolve after 1 second. */
function DefaultWithInitialResourceLoading(props: React.ComponentProps<typeof ROSAHCPWizard>) {
  const [versionsFetching, setVersionsFetching] = React.useState(true);
  const [awsInfraFetching, setAwsInfraFetching] = React.useState(true);
  const [awsBillingFetching, setAwsBillingFetching] = React.useState(true);
  const [regionsFetching, setRegionsFetching] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setVersionsFetching(false);
      setAwsInfraFetching(false);
      setAwsBillingFetching(false);
      setRegionsFetching(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const wizardData = React.useMemo(
    () => ({
      ...props.wizardData,
      awsInfrastructureAccounts: {
        ...props.wizardData.awsInfrastructureAccounts,
        isFetching: awsInfraFetching,
      },
      awsBillingAccounts: {
        ...props.wizardData.awsBillingAccounts,
        isFetching: awsBillingFetching,
      },
      regions: {
        ...props.wizardData.regions,
        isFetching: regionsFetching,
      },
      versions: {
        ...props.wizardData.versions,
        isFetching: versionsFetching,
      },
    }),
    [props.wizardData, versionsFetching, awsBillingFetching, awsInfraFetching, regionsFetching]
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
 * then finish loading after 1 second.
 */
export const Default: Story = {
  render: (args) => <DefaultWithInitialResourceLoading {...args} />,
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
  },
};

/**
 * Details step only: the AWS infrastructure account, billing account, region, and OpenShift version
 * API calls all fail with no dropdown options (empty lists), so `FieldWithAPIErrorAlert` can be reviewed.
 * Other wizard resources match the default story fixtures.
 */
export const DetailsFieldsAllApiErrors: Story = {
  render: (args) => <ROSAHCPWizard {...args} />,
  args: {
    title: 'Create ROSA Cluster — API errors',
    yaml: true,
    wizardData: rosaHcpWizardDetailsFieldsAllApiErrorsData,
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
    },
    onCancel: () => {
      console.log('Wizard cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulates failed fetches for the four Details dropdowns only. Each field shows the API error alert and has no selectable options.',
      },
    },
  },
};

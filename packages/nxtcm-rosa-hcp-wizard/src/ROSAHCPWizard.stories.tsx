import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ROSAHCPWizard from './ROSAHCPWizard';
import {
  createMockRosaHcpWizardData,
  createMockRosaHcpWizardDataWithFetchLogging,
  createSelectOptionsReconcileDemoWizardData,
  getMockStoryPrivateSubnets,
  rosaHcpWizardDetailsFieldsAllApiErrorsData,
  storyAwsInfrastructureAccountRefetchCycle,
  storyFetchWithLogging,
  storyRegionsAfterRefetch,
  useCyclingRefetchResource,
  useRefetchReplacingData,
  useStoryClusterNameValidation,
} from './ROSAHCPWizard.stories.helpers';
import fixtures from './ROSAHCPWizard.fixtures';
import { MachineTypesDropdownType, OIDCConfig, Region, Role, ROSAHCPWizardData } from './types';
import { defaultRosaHcpWizardStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';

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
    ocmRoleError: null,
    userRoleError: null,
    ocmRoleARN: null,
  },
  oidcConfig: {
    ...fixtures.mockFetchResource<OIDCConfig[], [awsAccount: string]>(fixtures.mockOicdConfig),
    fetch: async () => {},
  },
  vpcList: { ...fixtures.mockResource(fixtures.mockVPCs), fetch: async () => {} },
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

/**
 * Details-step demo for select value reconciliation after refetch:
 * - AWS infrastructure account refresh cycles through three disjoint option sets.
 * - Region refresh replaces the list with `us-east-1` only (pick an AWS account first).
 */
function SelectOptionsReconcileOnRefetchWrapper(props: React.ComponentProps<typeof ROSAHCPWizard>) {
  const awsInfrastructureAccounts = useCyclingRefetchResource(
    storyAwsInfrastructureAccountRefetchCycle
  );
  const regions = useRefetchReplacingData(fixtures.mockRegions, storyRegionsAfterRefetch);

  const wizardData: ROSAHCPWizardData = {
    ...createSelectOptionsReconcileDemoWizardData(),
    awsInfrastructureAccounts: {
      ...awsInfrastructureAccounts,
      fetch: storyFetchWithLogging('awsInfrastructureAccounts', awsInfrastructureAccounts.fetch),
    },
    regions: {
      ...regions,
      fetch: storyFetchWithLogging<[awsAccount: string]>('regions', async () => {
        await regions.fetch();
      }),
    },
  };

  return <ROSAHCPWizard {...props} wizardData={wizardData} />;
}

/** Stop Storybook focus shortcuts (1/2/3) outside text fields so they don't steal focus from the wizard. */
function BlockStorybookFocusShortcuts({ children }: Readonly<{ children: React.ReactNode }>) {
  React.useEffect(() => {
    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      return (
        /input|textarea/i.test(target.tagName) || target.getAttribute('contenteditable') !== null
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!['1', '2', '3'].includes(event.key)) {
        return;
      }
      const eventTarget = event.composedPath()[0] ?? event.target;
      if (isEditableTarget(eventTarget)) {
        return;
      }

      event.stopPropagation();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return <>{children}</>;
}

const meta: Meta<typeof ROSAHCPWizard> = {
  title: 'Wizards/RosaHCPWizard',
  component: ROSAHCPWizard,
  decorators: [
    (Story) => (
      <BlockStorybookFocusShortcuts>
        <div style={{ height: '100vh', overflow: 'hidden' }}>
          <Story />
        </div>
      </BlockStorybookFocusShortcuts>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    toolbar: {
      'storybook/measure-addon/tool': { hidden: true },
    },
    docs: {
      description: {
        component:
          'ROSA (Red Hat OpenShift Service on AWS) Wizard component for creating ROSA clusters with a step-by-step interface. The wizard includes Basic setup steps (Details, Roles & Policies, Machine Pools, Networking), Additional setup steps (Encryption, Networking, Cluster-wide proxy, Cluster updates), and a Review step.',
      },
    },
  },
  tags: ['autodocs'],
  globals: {
    measureEnabled: false,
  },
  argTypes: {
    enableAllWizardNavSteps: {
      description:
        'Enables all wizard nav steps for Storybook development. Do not use in production.',
      control: 'boolean',
    },
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

/**
 * Same wizard as Default, with simulated refetches on the Details step to exercise
 * `WizSelect` option reconciliation. Select an AWS infrastructure account, then use
 * its refresh control — each refetch (~2 s) returns a new disjoint account list and
 * clears the field when the prior value is missing. Select an account and a non–`us-east-1`
 * region, then refresh the region list; only `us-east-1` remains and other regions clear.
 */
export const SelectOptionsReconcileOnRefetch: Story = {
  render: (args) => <SelectOptionsReconcileOnRefetchWrapper {...args} />,
  args: {
    title: 'Create ROSA Cluster — select reconcile on refetch',
    yaml: true,
    wizardData: createSelectOptionsReconcileDemoWizardData(),
    onSubmit: async (data: unknown) => {
      console.log('Wizard submitted with data:', data);
      alert('Cluster creation initiated successfully!');
    },
    onCancel: () => {
      console.log('Wizard cancelled');
      alert('Wizard cancelled');
    },
    strings: defaultRosaHcpWizardStrings,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates clearing stale `WizSelect` values when refetched options no longer include the current selection. On the Details step: refresh **AWS infrastructure account** to cycle through three different mock account lists; refresh **Region** (after choosing an account) to load only `us-east-1`.',
      },
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

/**
 * Wizard with no account roles available. Navigate to the Roles & Policies step to see
 * the "Missing account roles" danger alert with a `rosa create account-role` copy instruction.
 */
export const RolesAlertMissingAccountRoles: Story = {
  args: {
    title: 'Create ROSA Cluster — missing account roles',
    yaml: true,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
    wizardData: createMockRosaHcpWizardData({
      roles: {
        data: [],
        error: null,
        isFetching: false,
        ocmRoleError: null,
        userRoleError: null,
        ocmRoleARN: null,
        fetch: async () => {},
      },
    }),
  },
};

/**
 * Wizard with a user role error. Navigate to the Roles & Policies step to see
 * the "Missing user role" danger alert with a `rosa create user-role` copy instruction.
 */
export const RolesAlertMissingUserRole: Story = {
  args: {
    title: 'Create ROSA Cluster — missing user role',
    yaml: true,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
    wizardData: createMockRosaHcpWizardData({
      roles: {
        data: fixtures.mockRoles,
        error: null,
        isFetching: false,
        ocmRoleError: null,
        userRoleError: 'User role is not linked to your Red Hat account',
        ocmRoleARN: null,
        fetch: async () => {},
      },
    }),
  },
};

/**
 * Wizard with an OCM role error. Navigate to the Roles & Policies step to see
 * the danger alert with the OCM error message.
 * When `ocmRoleError` is set, the "Missing user role" section is suppressed even if `userRoleError` is also set.
 */
export const RolesAlertOcmRoleError: Story = {
  args: {
    title: 'Create ROSA Cluster — OCM role error',
    yaml: true,
    onSubmit: onWizardSubmit,
    onCancel: onWizardCancel,
    wizardData: createMockRosaHcpWizardData({
      roles: {
        data: fixtures.mockRoles,
        error: null,
        isFetching: false,
        ocmRoleError: 'OCM role is not linked to your organization',
        userRoleError: null,
        ocmRoleARN: null,
        fetch: async () => {},
      },
    }),
  },
};

/**
 * DEVS ONLY — same as Default, with all wizard nav steps enabled for engineering work.
 * Business-facing demos should use Default so visit and validation nav rules match production.
 */
export const DefaultAllNavStepsEnabled: Story = {
  name: 'DEVS ONLY - default all nav steps enabled',
  render: (args) => <DefaultStoryWrapper {...args} />,
  args: {
    ...Default.args,
    enableAllWizardNavSteps: true,
    title: 'Create ROSA Cluster — all nav steps enabled',
  },
};

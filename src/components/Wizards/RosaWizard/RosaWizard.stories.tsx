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
  VPC,
  ClusterWithNonUniqueName,
} from '../types';
import type { BasicSetupStepProps } from './RosaWizard';
import fixtures, {
  sleep,
  STORY_API_ERROR_MESSAGE,
  useFetchNeededData,
  useSetMockState,
} from './RosaWizard.fixtures';

const onWizardSubmit = async (data: unknown) => {
  console.log('Wizard submitted with data:', data);
  await new Promise((resolve) => setTimeout(resolve, 1500));
};

const onWizardCancel = () => {
  console.log('Wizard was cancelled');
  alert('Wizard cancelled');
};

/** Default story: versions start loading, then resolve after 3 seconds. */
function DefaultWithInitialVersionLoading(props: React.ComponentProps<typeof RosaWizard>) {
  const [versionsFetching, setVersionsFetching] = React.useState(true);
  const [awsInfraFetching, setAwsInfraFetching] = React.useState(true);
  const [awsBillingFetching, setAwsBillingFetching] = React.useState(true);
  const [regionsFetching, setRegionsFetching] = React.useState(true);
  const [oidcFetching, setOidcFetching] = React.useState(true);
  const [vpcsFetching, setVpcsFetching] = React.useState(true);
  const [machineTypesFetching, setMachineTypesFetching] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setVersionsFetching(false);
      setAwsInfraFetching(false);
      setAwsBillingFetching(false);
      setRegionsFetching(false);
      setOidcFetching(false);
      setVpcsFetching(false);
      setMachineTypesFetching(false);
    }, 3000);
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
          isFetching: awsInfraFetching,
        },
        awsBillingAccounts: {
          ...props.wizardsStepsData.basicSetupStep.awsBillingAccounts,
          isFetching: awsBillingFetching,
        },
        regions: {
          ...props.wizardsStepsData.basicSetupStep.regions,
          isFetching: regionsFetching,
        },
        oidcConfig: {
          ...props.wizardsStepsData.basicSetupStep.oidcConfig,
          isFetching: oidcFetching,
        },
        vpcList: {
          ...props.wizardsStepsData.basicSetupStep.vpcList,
          isFetching: vpcsFetching,
        },
        machineTypes: {
          ...props.wizardsStepsData.basicSetupStep.machineTypes,
          isFetching: machineTypesFetching,
        },
      },
    }),
    [
      props.wizardsStepsData,
      versionsFetching,
      awsBillingFetching,
      awsInfraFetching,
      machineTypesFetching,
      oidcFetching,
      regionsFetching,
      vpcsFetching,
    ]
  );

  return <RosaWizard {...props} wizardsStepsData={wizardsStepsData} />;
}

// shared baseline for basicSetupStep across stories — wraps all mock data in Resource shape
const mockBasicSetupStep: BasicSetupStepProps = {
  clusterNameValidation: fixtures.mockValidationResource(),
  userRole: fixtures.mockValidationResource(),
  versions: fixtures.mockFetchResource(fixtures.mockVersionsData),
  awsInfrastructureAccounts: fixtures.mockResource(fixtures.mockAwsInfrastructureAccounts),
  awsBillingAccounts: fixtures.mockResource(fixtures.mockAwsBillingAccounts),
  regions: fixtures.mockFetchResource<Region[], [awsAccount: string]>(fixtures.mockRegions),
  roles: fixtures.mockFetchResource<Role[], [awsAccount: string]>(fixtures.mockRoles),
  oidcConfig: fixtures.mockResource(fixtures.mockOicdConfig),
  machineTypes: fixtures.mockResource(fixtures.mockMachineTypes),
  vpcList: fixtures.mockResource(fixtures.mockVPCs),
  subnets: fixtures.mockResource([]),
  securityGroups: fixtures.mockResource([]),
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
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/**
 * Every basic-setup resource reports an error so `FieldWithAPIErrorAlert` can be reviewed.
 * Mock data is kept so controls still populate for exploration.
 */
const basicSetupStepAllApiErrors: BasicSetupStepProps = {
  ...mockBasicSetupStep,
  clusterNameValidation: {
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  userRole: {
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  versions: {
    ...mockBasicSetupStep.versions,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  awsInfrastructureAccounts: {
    ...mockBasicSetupStep.awsInfrastructureAccounts,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  awsBillingAccounts: {
    ...mockBasicSetupStep.awsBillingAccounts,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  regions: {
    ...mockBasicSetupStep.regions,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  roles: {
    ...mockBasicSetupStep.roles,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  oidcConfig: {
    ...mockBasicSetupStep.oidcConfig,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  machineTypes: {
    ...mockBasicSetupStep.machineTypes,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  vpcList: {
    ...mockBasicSetupStep.vpcList,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  subnets: {
    ...mockBasicSetupStep.subnets,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
  },
  securityGroups: {
    ...mockBasicSetupStep.securityGroups,
    error: STORY_API_ERROR_MESSAGE,
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
    onCancel: onWizardCancel,
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
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: fixtures.mockFetchResource(fixtures.mockOpenShiftVersionsDataDefaultEqualsLatest),
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: fixtures.mockFetchResource(fixtures.mockLimitedOpenShiftVersions),
        awsInfrastructureAccounts: fixtures.mockResource(
          fixtures.mockLimitedAwsInfrastructureAccounts
        ),
        awsBillingAccounts: fixtures.mockResource(fixtures.mockLimitedAwsBillingAccounts),
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: fixtures.mockFetchResource({
          latest: { label: '', value: '' },
          default: { label: '', value: '' },
          releases: [],
        }),
        awsInfrastructureAccounts: fixtures.mockResource([]),
        awsBillingAccounts: fixtures.mockResource([]),
        regions: fixtures.mockFetchResource([]),
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        versions: fixtures.mockFetchResource(fixtures.mockExtensiveNumOpenShiftVersions),
        awsInfrastructureAccounts: fixtures.mockResource(
          fixtures.mockExtensiveNumAWsInfrastructureAccounts
        ),
        awsBillingAccounts: fixtures.mockResource(fixtures.mockExtensiveNumAwsBillingAccounts),
        vpcList: fixtures.mockResource([...fixtures.mockVPCs, ...fixtures.mockExtensiveNumVPCs]),
        machineTypes: fixtures.mockResource([
          ...fixtures.mockMachineTypes,
          ...fixtures.mockExtensiveNumMachineTypes,
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
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
    onCancel: onWizardCancel,
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        machineTypes: fixtures.mockResource([
          ...fixtures.mockMachineTypes,
          ...fixtures.mockAdditionalMachineTypes,
        ]),
        vpcList: fixtures.mockResource([...fixtures.mockAdditionalVPCs, ...fixtures.mockVPCs]),
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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: {
        ...mockBasicSetupStep,
        vpcList: fixtures.mockResource(
          fixtures.mockVPCs.map((vpc) => ({
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
        versions: fixtures.mockFetchResource({
          latest: { label: 'OpenShift 4.12.0 (LTS)', value: '4.12.0' },
          default: { label: 'OpenShift 4.11.5 (Stable)', value: '4.11.5' },
          releases: [],
        }),
        awsInfrastructureAccounts: fixtures.mockResource([
          {
            label: 'AWS Production Account (987654321098)',
            value: 'aws-prod-987654321098',
          },
        ]),
        awsBillingAccounts: fixtures.mockResource([
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
    onCancel: onWizardCancel,
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
    data: fixtures.mockMachineTypes,
    error: null,
    isFetching: false,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAwsAccounts({
        data: fixtures.mockAwsInfrastructureAccounts,
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
      setMachineTypes({ data: fixtures.mockMachineTypes, error: null, isFetching: false });
    } else {
      // fetching only m6a
      setMachineTypes({ data: fixtures.mockMachineTypesLimited, error: null, isFetching: false });
    }
  }, []);

  const regionsFetch = React.useCallback(async (awsAccount?: string) => {
    setRegions((prev) => ({ ...prev, isFetching: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (awsAccount === 'aws-dev-345678901234') {
      setRegions({ data: fixtures.mockRegionsLimited, error: null, isFetching: false });
    } else {
      setRegions({ data: fixtures.mockRegions, error: null, isFetching: false });
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
    onCancel: onWizardCancel,
    wizardsStepsData: {
      basicSetupStep: mockBasicSetupStep,
    },
  },
};

/**
 * Simulates ~3 s async refetches for AWS infrastructure accounts (Details), AWS billing accounts
 * (Details), and OIDC configuration (Roles & policies) when each field’s refresh control is used.
 */
function BasicSetupSimulatedRefetchesWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const { state: awsInfrastructureAccounts, fetchData: fetchAwsInfrastructureAccounts } =
    useFetchNeededData<AWSInfrastructureAccounts[]>([
      ...fixtures.mockAwsInfrastructureAccounts,
      {
        label: 'AWS Account — loaded after refresh (999999999999)',
        value: 'aws-refreshed-999999999999',
      },
    ]);

  const { state: awsBillingAccounts, fetchData: fetchAwsBillingAccounts } = useFetchNeededData<
    SelectDropdownType[]
  >([
    ...fixtures.mockAwsBillingAccounts,
    {
      label: 'Billing Account — loaded after refresh (999999999999)',
      value: 'billing-refreshed-999999999999',
    },
  ]);

  const { state: oidcConfig, fetchData: fetchOidcConfig } = useFetchNeededData<OIDCConfig[]>([
    ...fixtures.mockOicdConfig,
    {
      label: 'refreshed-oidc-config-id',
      value: 'refreshed-oidc-config-id',
      issuer_url: 'https://oidc.os1.devshift.org/refreshed-after-refresh',
    },
  ]);

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
    onCancel: onWizardCancel,
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

/**
 * Simulates 2 s async refetches for every WizSelect refresh button across
 * the Basic Setup steps: AWS infrastructure accounts, AWS billing accounts,
 * OpenShift versions, OIDC configuration, and VPC list.
 */
function AllRefetchesWrapper(props: React.ComponentProps<typeof RosaWizard>) {
  const { state: awsInfrastructureAccounts, fetchData: fetchAwsInfrastructureAccounts } =
    useFetchNeededData<AWSInfrastructureAccounts[]>([
      ...fixtures.mockAwsInfrastructureAccounts,
      {
        label: 'AWS Account — refreshed (999999999999)',
        value: 'aws-refreshed-999999999999',
      },
    ]);

  const { state: awsBilling, fetchData: fetchAwsBillingAccounts } = useFetchNeededData<
    SelectDropdownType[]
  >([
    ...fixtures.mockAwsBillingAccounts,
    {
      label: 'Billing Account — refreshed (999999999999)',
      value: 'billing-refreshed-999999999999',
    },
  ]);

  const { state: versions, fetchData: fetchVersions } = useFetchNeededData<OpenShiftVersionsData>(
    fixtures.mockVersionsData
  );

  const { state: oidcConfig, fetchData: fetchOidcConfig } = useFetchNeededData<OIDCConfig[]>([
    ...fixtures.mockOicdConfig,
    {
      label: 'refreshed-oidc-config-id',
      value: 'refreshed-oidc-config-id',
      issuer_url: 'https://oidc.os1.devshift.org/refreshed-oidc',
    },
  ]);

  const { state: vpcList, fetchData: fetchVpcList } = useFetchNeededData<VPC[]>(fixtures.mockVPCs);

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
            ...awsBilling,
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
    onCancel: onWizardCancel,
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
  const { state: awsInfrastructureAccounts, fetchData: fetchAwsInfrastructureAccounts } =
    useFetchNeededData<AWSInfrastructureAccounts[]>(fixtures.mockUpdatedAwsInfrastructureAccounts);
  const { state: awsBillingAccounts, fetchData: fetchAwsBillingAccounts } = useFetchNeededData<
    SelectDropdownType[]
  >(fixtures.mockUpdatedAwsBillingAccounts);
  const { state: versions, fetchData: fetchVersions } = useFetchNeededData<OpenShiftVersionsData>(
    fixtures.mockUpdatedOpenShiftVersions
  );
  const { state: oidcConfig, fetchData: fetchOidcConfig } = useFetchNeededData<OIDCConfig[]>(
    fixtures.mockUpdatedOIDCConfig
  );
  const { state: vpcList, fetchData: fetchVpcList } = useFetchNeededData<VPC[]>(
    fixtures.mockUpdatedVPCList
  );
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
    onCancel: onWizardCancel,
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
  const { state: awsInfrastructureAccounts, fetchData: fetchAwsInfrastructureAccounts } =
    useFetchNeededData<AWSInfrastructureAccounts[]>(fixtures.mockAwsInfrastructureAccounts);
  const { state: awsBillingAccounts, fetchData: fetchAwsBillingAccounts } = useFetchNeededData<
    SelectDropdownType[]
  >(fixtures.mockAwsBillingAccounts);
  const { state: versions, fetchData: fetchVersions } = useFetchNeededData<OpenShiftVersionsData>(
    fixtures.mockVersionsData
  );
  const { state: oidcConfig, fetchData: fetchOidcConfig } = useFetchNeededData<OIDCConfig[]>(
    fixtures.mockOicdConfig
  );
  const { state: vpcList, fetchData: fetchVpcList } = useFetchNeededData<VPC[]>(fixtures.mockVPCs);

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
    onCancel: onWizardCancel,
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
  const { mockStateData: validationState, setMockStateData: setValidationState } =
    useSetMockState<ClusterWithNonUniqueName>([]);

  const checkClusterNameUniqueness = React.useCallback(
    (name: string, region?: string) => {
      setValidationState({ data: [], error: null, isFetching: true });

      // simulate API call with 800ms latency
      const timer = setTimeout(() => {
        const takenNames = fixtures.mockClusterNonUniqueNames.map((el) => el.name);
        const takenRegion = ['us-west-1'];
        const isTaken = takenNames.includes(name);
        const takenRegionData = takenRegion.includes(region ? region : '');
        setValidationState({
          data: fixtures.mockClusterNonUniqueNames,
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
    },
    [setValidationState]
  );

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
    onSubmit: (data: unknown) => onWizardSubmit(data),
    onCancel: onWizardCancel,
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

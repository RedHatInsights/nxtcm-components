import React from 'react';

import fixtures, { sleep, STORY_API_ERROR_MESSAGE } from './ROSAHCPWizard.fixtures';
import type { OpenShiftVersionsData, ROSAHCPWizardData, Subnet, ValidationResource } from './types';
/** Simulated async cluster name validation delay for Storybook demos. */
export const STORY_CLUSTER_NAME_VALIDATION_DELAY_MS = 800;

const storyTakenClusterNames = new Set(fixtures.mockClusterNonUniqueNames.map(({ name }) => name));

/** Private subnets from the first HCP wizard fixture VPC (names include `private`, matching `subnetsFilter`). */
export function getMockStoryPrivateSubnets(): Subnet[] {
  return (fixtures.mockVPCs?.[0]?.aws_subnets ?? [])
    .filter((s) => s.public === false)
    .map(({ subnet_id, name, availability_zone, public: isPublic }) => ({
      subnet_id,
      name,
      availability_zone,
      public: isPublic,
    }));
}

const noopFetch = async (): Promise<void> => {
  /* story stub */
};

/** Storybook-only: mock async cluster name uniqueness check with console logging. */
export function createStoryCheckClusterNameUniqueness(
  onValidationStateChange?: (state: ValidationResource) => void
): (name: string, region?: string) => Promise<string | null> {
  return async (name: string, region?: string) => {
    // eslint-disable-next-line no-console
    console.log('ROSA HCP Wizard cluster name validation:', { name, region });
    onValidationStateChange?.({ isFetching: true, error: null });

    await sleep(STORY_CLUSTER_NAME_VALIDATION_DELAY_MS);

    const isTaken = storyTakenClusterNames.has(name);
    const error = isTaken
      ? `Cluster name "${name}" already exists. Choose a different name.`
      : null;

    onValidationStateChange?.({ isFetching: false, error });
    // eslint-disable-next-line no-console
    console.log('ROSA HCP Wizard cluster name validation result:', {
      name,
      region,
      available: !isTaken,
    });

    return error;
  };
}

/** Storybook hook: logged mock uniqueness check and `clusterNameValidation` fetch state. */
export function useStoryClusterNameValidation(): Pick<
  ROSAHCPWizardData,
  'clusterNameValidation' | 'checkClusterNameUniqueness'
> {
  const [clusterNameValidation, setClusterNameValidation] = React.useState<ValidationResource>({
    error: null,
    isFetching: false,
  });

  const checkClusterNameUniqueness = React.useMemo(
    () => createStoryCheckClusterNameUniqueness(setClusterNameValidation),
    []
  );

  return {
    clusterNameValidation,
    checkClusterNameUniqueness,
  };
}

/** Storybook-only: logs which resource was refreshed and fetch arguments. */
export function storyFetchWithLogging<TArgs extends unknown[]>(
  resource: string
): (...args: TArgs) => Promise<void> {
  return async (...args: TArgs) => {
    // eslint-disable-next-line no-console
    console.log('ROSA HCP Wizard refetch:', {
      resource,
      attributes: args.length > 0 ? args.toString() : undefined,
    });
    await noopFetch();
  };
}

/** {@link createMockRosaHcpWizardData} with `fetch` stubs that log refetch calls (Default story). */
export function createMockRosaHcpWizardDataWithFetchLogging(
  overrides?: Partial<ROSAHCPWizardData>
): ROSAHCPWizardData {
  const base = createMockRosaHcpWizardData(overrides);
  return {
    ...base,
    awsInfrastructureAccounts: {
      ...base.awsInfrastructureAccounts,
      fetch: storyFetchWithLogging('awsInfrastructureAccounts'),
    },
    awsBillingAccounts: {
      ...base.awsBillingAccounts,
      fetch: storyFetchWithLogging('awsBillingAccounts'),
    },
    regions: {
      ...base.regions,
      fetch: storyFetchWithLogging<[awsAccount: string]>('regions'),
    },
    versions: {
      ...base.versions,
      fetch: storyFetchWithLogging('versions'),
    },
    machineTypes: {
      ...base.machineTypes,
      fetch: storyFetchWithLogging<[region: string]>('machineTypes'),
    },
    roles: {
      ...base.roles,
      fetch: storyFetchWithLogging<[awsAccount: string]>('roles'),
    },
    oidcConfig: {
      ...base.oidcConfig,
      fetch: storyFetchWithLogging('oidcConfig'),
    },
    vpcList: {
      ...base.vpcList,
      fetch: storyFetchWithLogging('vpcList'),
    },
    subnets: {
      ...base.subnets,
      fetch: storyFetchWithLogging('subnets'),
    },
    securityGroups: {
      ...base.securityGroups,
      fetch: storyFetchWithLogging('securityGroups'),
    },
  };
}

/** Minimal {@link ROSAHCPWizardData} for Storybook and local demos. */
export function createMockRosaHcpWizardData(
  overrides?: Partial<ROSAHCPWizardData>
): ROSAHCPWizardData {
  const base: ROSAHCPWizardData = {
    awsInfrastructureAccounts: {
      data: [{ label: 'Example AWS account (123456789012)', value: '123456789012' }],
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    awsBillingAccounts: {
      data: [{ label: 'Example billing account', value: '123456789123' }],
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    regions: {
      data: [
        { label: 'US East (N. Virginia) us-east-1', value: 'us-east-1' },
        { label: 'US East (Ohio) us-east-2', value: 'us-east-2' },
      ],
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    versions: {
      data: {
        latest: { label: '4.15.5', value: '4.15.5' },
        default: { label: '4.14.12', value: '4.14.12' },
        releases: [
          { label: '4.13.21', value: '4.13.21' },
          { label: '4.12.40', value: '4.12.40' },
        ],
      },
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    machineTypes: {
      data: fixtures.mockMachineTypes,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    roles: {
      data: fixtures.mockRoles,
      error: null,
      isFetching: false,
      fetch: async () => {
        /* story stub */
      },
    },
    oidcConfig: {
      data: fixtures.mockOicdConfig,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    vpcList: {
      data: fixtures.mockVPCs,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    subnets: {
      data: getMockStoryPrivateSubnets(),
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    securityGroups: {
      data: fixtures.mockSecurityGroups,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    clusterNameValidation: {
      error: null,
      isFetching: false,
    },
  };
  return { ...base, ...overrides };
}

const emptyVersionsOnApiFailure: OpenShiftVersionsData = { releases: [] };

export const rosaHcpWizardDetailsFieldsAllApiErrorsData: ROSAHCPWizardData = {
  ...createMockRosaHcpWizardData(),
  awsInfrastructureAccounts: {
    data: [],
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
    fetch: async () => {},
  },
  awsBillingAccounts: {
    data: [],
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
    fetch: async () => {},
  },
  regions: {
    data: [],
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
    fetch: async () => {},
  },
  versions: {
    data: emptyVersionsOnApiFailure,
    error: STORY_API_ERROR_MESSAGE,
    isFetching: false,
    fetch: async () => {},
  },
};

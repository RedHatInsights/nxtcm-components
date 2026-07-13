import React from 'react';

import fixtures, { sleep, STORY_API_ERROR_MESSAGE } from './ROSAHCPWizard.fixtures';
import type {
  AWSInfrastructureAccounts,
  OpenShiftVersionsData,
  Region,
  ROSAHCPWizardData,
  Subnet,
  ValidationResource,
} from './types';
/** Storybook refetch delay (matches {@link fixtures} `REFETCH_ALL_DELAY_MS`). */
export const STORY_REFETCH_DELAY_MS = 2000;
/** Simulated async cluster name validation delay for Storybook demos. */
export const STORY_CLUSTER_NAME_VALIDATION_DELAY_MS = 800;

const storyTakenClusterNames = new Set(fixtures.mockClusterNonUniqueNames.map(({ name }) => name));

/** AWS infrastructure account option sets cycled on each refresh in the reconcile demo story. */
export const storyAwsInfrastructureAccountRefetchCycle: readonly AWSInfrastructureAccounts[][] = [
  fixtures.mockAwsInfrastructureAccounts,
  fixtures.mockUpdatedAwsInfrastructureAccounts,
  [
    {
      label: 'AWS Account — Demo East (111111111111)',
      value: 'aws-demo-east-111111111111',
    },
    {
      label: 'AWS Account — Demo West (222222222222)',
      value: 'aws-demo-west-222222222222',
    },
  ],
];

/** Region list returned after each region refresh in the reconcile demo story. */
export const storyRegionsAfterRefetch: Region[] = [
  { label: 'US East 1 (us-east-1)', value: 'us-east-1' },
];

type RefetchResourceState<T> = {
  data: T;
  isFetching: boolean;
  error: string | null;
};

/**
 * Simulates an async refetch that replaces `data` with `refetchData` after a delay.
 * Used by Storybook to demo WizSelect option reconciliation on refetch.
 */
export function useRefetchReplacingData<T>(
  initialData: T,
  refetchData: T,
  delayMs: number = STORY_REFETCH_DELAY_MS
): RefetchResourceState<T> & { fetch: () => Promise<void> } {
  const [state, setState] = React.useState<RefetchResourceState<T>>({
    data: initialData,
    isFetching: false,
    error: null,
  });

  const fetch = React.useCallback(async () => {
    setState((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(delayMs);
    setState({
      data: refetchData,
      isFetching: false,
      error: null,
    });
  }, [delayMs, refetchData]);

  return { ...state, fetch };
}

/**
 * Simulates an async refetch that cycles through `dataSets` on each refresh.
 */
export function useCyclingRefetchResource<T>(
  dataSets: readonly T[],
  delayMs: number = STORY_REFETCH_DELAY_MS
): RefetchResourceState<T> & { fetch: () => Promise<void> } {
  const cycleIndexRef = React.useRef(0);
  const [state, setState] = React.useState<RefetchResourceState<T>>({
    data: dataSets[0],
    isFetching: false,
    error: null,
  });

  const fetch = React.useCallback(async () => {
    setState((prev) => ({ ...prev, isFetching: true, error: null }));
    await sleep(delayMs);
    cycleIndexRef.current = (cycleIndexRef.current + 1) % dataSets.length;
    setState({
      data: dataSets[cycleIndexRef.current],
      isFetching: false,
      error: null,
    });
  }, [dataSets, delayMs]);

  return { ...state, fetch };
}

/** {@link ROSAHCPWizardData} for the select-options reconcile Storybook demo. */
export function createSelectOptionsReconcileDemoWizardData(): ROSAHCPWizardData {
  const base = createMockRosaHcpWizardDataWithFetchLogging();
  return {
    ...base,
    awsInfrastructureAccounts: {
      ...base.awsInfrastructureAccounts,
      data: storyAwsInfrastructureAccountRefetchCycle[0],
    },
    regions: {
      ...base.regions,
      data: fixtures.mockRegions,
    },
  };
}

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
  resource: string,
  fetchFn?: (...args: TArgs) => Promise<void>
): (...args: TArgs) => Promise<void> {
  return async (...args: TArgs) => {
    // eslint-disable-next-line no-console
    console.log('ROSA HCP Wizard refetch:', {
      resource,
      attributes: args.length > 0 ? args.toString() : undefined,
    });
    if (fetchFn) {
      await fetchFn(...args);
    } else {
      await noopFetch();
    }
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
      fetch: storyFetchWithLogging<[args: import('./types').MachineTypesArgs]>('machineTypes'),
    },
    roles: {
      ...base.roles,
      fetch: storyFetchWithLogging<[awsAccount: string]>('roles'),
    },
    oidcConfig: {
      ...base.oidcConfig,
      fetch: storyFetchWithLogging<[awsAccount: string]>('oidcConfig'),
    },
    vpcList: {
      ...base.vpcList,
      fetch: storyFetchWithLogging<[args: import('./types').VPCRefetchArgs]>('vpcList'),
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
      data: fixtures.mockAwsInfrastructureAccounts,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    awsBillingAccounts: {
      data: fixtures.mockAwsBillingAccounts,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    regions: {
      data: fixtures.mockRegions,
      error: null,
      isFetching: false,
      fetch: noopFetch,
    },
    versions: {
      data: fixtures.mockVersionsData,
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
      ocmRoleError: null,
      ocmRoleARN: null,
      userRoleError: null,
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

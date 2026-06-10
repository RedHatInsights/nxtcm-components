import fixtures, { STORY_API_ERROR_MESSAGE } from './ROSAHCPWizard.fixtures';
import type { OpenShiftVersionsData, ROSAHCPWizardData, Subnet } from './types';

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
      data: [{ label: 'Example billing account', value: 'billing-1' }],
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

import React from 'react';
import { Resource, ValidationResource, OpenShiftVersionsData } from '../types';

const REFETCH_ALL_DELAY_MS = 2000;
/** Shared API error string for the `AllApiErrors` story (popover/detail body). */
export const STORY_API_ERROR_MESSAGE = 'This is the error returned from the API call';
// wraps static mock data in the Resource shape for stories
const mockResource = <TData>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

const mockValidationResource = (): ValidationResource => ({
  error: null,
  isFetching: false,
});

// Mock data to check cluster name uniquiness
const mockClusterNonUniqueNames = [
  {
    name: 'taken',
  },
  {
    name: 'existing',
  },
  {
    name: 'my-cluster',
  },
];

// Mock data for the wizard
const mockVersionsData: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [
    { label: 'OpenShift 4.11.5', value: '4.11.5' },
    { label: 'OpenShift 4.10.8', value: '4.10.8' },
  ],
};

/** When default and latest share the same value, wizard shows a single "Default (Recommended)" group. */
const mockOpenShiftVersionsDataDefaultEqualsLatest = {
  latest: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  default: { label: 'OpenShift 4.21.8', value: '4.21.8' },
  releases: [
    { label: 'OpenShift 4.21.6', value: '4.21.6' },
    { label: 'OpenShift 4.21.5', value: '4.21.5' },
    { label: 'OpenShift 4.20.8', value: '4.20.8' },
  ],
};

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
    label: 'AWS Account - change in region(345678901234)',
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
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
  { label: 'EU (Ireland)', value: 'eu-west-1' },
  { label: 'EU (Frankfurt)', value: 'eu-central-1' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  { label: 'Region for machine types (us-east-1)', value: 'us-east-1' },
];

const mockRegionsLimited = [
  { label: 'US West (Oregon) - Limited', value: 'us-west-2' },
  { label: 'EU (Frankfurt)', value: 'eu-west-4' },
  { label: 'EU (Rome)', value: 'eu-west-5' },
];

const mockRoles = [
  {
    installerRole: {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      roleVersion: '4.21.6',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
      },
    ],
  },
  {
    installerRole: {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Installer-Role',
      roleVersion: '4.21.8',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Support-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Worker-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-MY-OTHER-HCP-ROSA-Worker-Role',
      },
    ],
  },
  {
    // No roleVersion: this role is always shown regardless of selected cluster version
    installerRole: {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Installer-Role',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Support-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Worker-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-UNVERSIONED-Worker-Role',
      },
    ],
  },
];

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
const mockAdditionalMachineTypes = [
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
    id: 'c6i.8xlarge',
    label: 'c6i.8xlarge',
    description: '32 vCPU 64 GiB RAM',
    value: 'c6i.8xlarge',
  },
];

const mockMachineTypesLimited = [
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

const mockAdditionalVPCs = [
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
    ],
    aws_security_groups: mockSecurityGroups,
  },
];

const mockUpdatedAwsInfrastructureAccounts = [
  {
    label: 'AWS Account - US Sandbox (555000555666)',
    value: 'aws-us-sandbox-555000555666',
  },
  {
    label: 'AWS Account - GovCloud (555000777888)',
    value: 'aws-govcloud-555000777888',
  },
];

const mockUpdatedAwsBillingAccounts = [
  {
    label: 'Billing - EMEA Cost Center (600111222333)',
    value: 'billing-emea-600111222333',
  },
  {
    label: 'Billing - Global Operations (600444555666)',
    value: 'billing-global-ops-600444555666',
  },
];

const mockUpdatedOpenShiftVersions = {
  latest: { label: 'OpenShift 4.22.1', value: '4.22.1' },
  default: { label: 'OpenShift 4.21.10', value: '4.21.10' },
  releases: [
    { label: 'OpenShift 4.21.9', value: '4.21.9' },
    { label: 'OpenShift 4.21.8', value: '4.21.8' },
    { label: 'OpenShift 4.20.12', value: '4.20.12' },
    { label: 'OpenShift 4.19.6', value: '4.19.6' },
  ],
};

const mockUpdatedOIDCConfig = [
  {
    label: '7xk9m3bc4dp1qw2ef6ghjt5nrs8uv0ya',
    value: '7xk9m3bc4dp1qw2ef6ghjt5nrs8uv0ya',
    issuer_url: 'https://oidc.os1.devshift.org/7xk9m3bc4dp1qw2ef6ghjt5nrs8uv0ya',
  },
  {
    label: '1ab2cd3ef4gh5ij6kl7mn8op9qr0st1uv',
    value: '1ab2cd3ef4gh5ij6kl7mn8op9qr0st1uv',
    issuer_url: 'https://oidc.os1.devshift.org/1ab2cd3ef4gh5ij6kl7mn8op9qr0st1uv',
  },
];

const mockUpdatedVPCList = [
  {
    name: 'refreshed-prod-vpc',
    id: 'vpc-refreshed-prod-001',
    aws_subnets: [
      {
        subnet_id: 'subnet-ref-priv-1a',
        name: 'refreshed-prod-subnet-private1-us-west-2a',
        availability_zone: 'us-west-2a',
      },
      {
        subnet_id: 'subnet-ref-pub-1a',
        name: 'refreshed-prod-subnet-public1-us-west-2a',
        availability_zone: 'us-west-2a',
      },
      {
        subnet_id: 'subnet-ref-priv-1b',
        name: 'refreshed-prod-subnet-private1-us-west-2b',
        availability_zone: 'us-west-2b',
      },
      {
        subnet_id: 'subnet-ref-pub-1b',
        name: 'refreshed-prod-subnet-public1-us-west-2b',
        availability_zone: 'us-west-2b',
      },
    ],
    aws_security_groups: [
      { id: 'sg-ref-00001', name: 'refreshed-default' },
      { id: 'sg-ref-00002', name: 'refreshed-app-traffic' },
    ],
  },
  {
    name: 'refreshed-staging-vpc',
    id: 'vpc-refreshed-staging-002',
    aws_subnets: [
      {
        subnet_id: 'subnet-ref-stg-priv-1a',
        name: 'refreshed-staging-subnet-private1-eu-west-1a',
        availability_zone: 'eu-west-1a',
      },
      {
        subnet_id: 'subnet-ref-stg-pub-1a',
        name: 'refreshed-staging-subnet-public1-eu-west-1a',
        availability_zone: 'eu-west-1a',
      },
    ],
  },
  {
    name: 'refreshed-dev-vpc',
    id: 'vpc-refreshed-dev-003',
    aws_subnets: [
      {
        subnet_id: 'subnet-ref-dev-priv-1a',
        name: 'refreshed-dev-subnet-private1-ap-southeast-1a',
        availability_zone: 'ap-southeast-1a',
      },
      {
        subnet_id: 'subnet-ref-dev-pub-1a',
        name: 'refreshed-dev-subnet-public1-ap-southeast-1a',
        availability_zone: 'ap-southeast-1a',
      },
    ],
  },
];

const mockLimitedOpenShiftVersions = {
  latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [],
};

const mockLimitedAwsInfrastructureAccounts = [
  {
    label: 'AWS Account - Production (123456789012)',
    value: 'aws-prod-123456789012',
  },
];

const mockLimitedAwsBillingAccounts = [
  {
    label: 'Billing Account - Main (123456789012)',
    value: 'billing-main-123456789012',
  },
];

const mockExtensiveNumOpenShiftVersions = {
  latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  default: { label: 'OpenShift 4.11.4', value: '4.11.4' },
  releases: Array.from({ length: 18 }, (_, i) => ({
    label: `OpenShift 4.${11 - Math.floor(i / 5)}.${i % 5}`,
    value: `4.${11 - Math.floor(i / 5)}.${i % 5}`,
  })),
};

const mockExtensiveNumAWsInfrastructureAccounts = Array.from({ length: 15 }, (_, i) => ({
  label: `AWS Account - Environment ${i + 1} (${100000000000 + i})`,
  value: `aws-env-${i + 1}-${100000000000 + i}`,
}));

const mockExtensiveNumAwsBillingAccounts = Array.from({ length: 10 }, (_, i) => ({
  label: `Billing Account ${i + 1} (${100000000000 + i})`,
  value: `billing-${i + 1}-${100000000000 + i}`,
}));

const mockExtensiveNumVPCs = Array.from({ length: 5 }, (_, i) => ({
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
}));

const mockExtensiveNumMachineTypes = Array.from({ length: 10 }, (_, i) => ({
  id: `ext-instance-${i + 1}`,
  label: `ext-instance-${i + 1}.xlarge`,
  description: `${(i + 2) * 2} vCPU ${(i + 2) * 8} GiB RAM`,
  value: `ext-instance-${i + 1}.xlarge`,
}));

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useSetMockState = <T>(mockData: T[]) => {
  const [mockStateData, setMockStateData] = React.useState<Resource<T[]>>({
    data: mockData,
    error: null,
    isFetching: false,
  });

  return {
    mockStateData,
    setMockStateData,
  };
};

export const useFetchNeededData = <T>(mockData: T) => {
  const [state, setState] = React.useState<{
    data: T;
    isFetching: boolean;
    error: string | null;
  }>({
    data: mockData,
    isFetching: false,
    error: null,
  });

  const fetchData = React.useCallback(async () => {
    setState((prev) => ({ ...prev, isFetching: true, error: null }));

    await sleep(REFETCH_ALL_DELAY_MS);

    setState({
      data: mockData,
      error: null,
      isFetching: false,
    });
  }, [mockData]);

  return {
    state,
    fetchData,
  };
};

const fixtures = {
  mockResource,
  mockFetchResource,
  mockValidationResource,
  mockVersionsData,
  mockOpenShiftVersionsDataDefaultEqualsLatest,
  mockAwsInfrastructureAccounts,
  mockAwsBillingAccounts,
  mockRegions,
  mockRegionsLimited,
  mockRoles,
  mockOicdConfig,
  mockMachineTypes,
  mockAdditionalMachineTypes,
  mockMachineTypesLimited,
  mockSecurityGroups,
  mockVPCs,
  mockAdditionalVPCs,
  mockClusterNonUniqueNames,
  mockUpdatedAwsInfrastructureAccounts,
  mockUpdatedAwsBillingAccounts,
  mockUpdatedOIDCConfig,
  mockUpdatedOpenShiftVersions,
  mockUpdatedVPCList,
  mockLimitedOpenShiftVersions,
  mockLimitedAwsInfrastructureAccounts,
  mockLimitedAwsBillingAccounts,
  mockExtensiveNumAWsInfrastructureAccounts,
  mockExtensiveNumAwsBillingAccounts,
  mockExtensiveNumMachineTypes,
  mockExtensiveNumOpenShiftVersions,
  mockExtensiveNumVPCs,
};

export default fixtures;

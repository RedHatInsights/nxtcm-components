/**
 * Minimal mock data for RosaWizard component tests.
 * Keeps test-only data aligned with the current wizard props contract.
 */
import type {
  OpenShiftVersionsData,
  OIDCConfig,
  Resource,
  Role,
  ValidationResource,
  VPC,
} from '../types';
import type { WizardStepsData } from './RosaWizard';

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

const mockVersionsData: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.12.1', value: '4.12.1' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  others: [{ label: 'OpenShift 4.11.5', value: '4.11.5' }],
};

const mockRoles: Role[] = [
  {
    installerRole: {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      roleVersion: '4.12.0',
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
];

const mockOidcConfig: OIDCConfig[] = [
  {
    label: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    value: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    issuer_url: 'https://oidc.os1.devshift.org/2kl4t2st8eg2u5jppv8kjeemkvimfm99',
  },
];

const mockMachineTypes = [
  { id: 'm5a.xlarge', label: 'm5a.xlarge', description: '4 vCPU 16 GiB RAM', value: 'm5a.xlarge' },
];

const mockVpcs: VPC[] = [
  {
    name: 'test-vpc-1',
    id: 'vpc-01496860a4b0475a3',
    aws_subnets: [
      {
        subnet_id: 'subnet-0cd89766e94deb008',
        name: 'test-1-subnet-public1-us-east-1b',
        availability_zone: 'us-east-1b',
      },
    ],
    aws_security_groups: [],
  },
];

export const rosaWizardMockStepsData: WizardStepsData = {
  basicSetupStep: {
    clusterNameValidation: mockValidationResource(),
    userRole: mockValidationResource(),
    versions: mockFetchResource(mockVersionsData),
    awsInfrastructureAccounts: mockResource([
      { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
    ]),
    awsBillingAccounts: mockResource([
      { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
    ]),
    regions: mockFetchResource([
      { label: 'US East (N. Virginia)', value: 'us-east-1' },
      { label: 'US West (Oregon)', value: 'us-west-2' },
    ]),
    roles: mockFetchResource<Role[], [awsAccount: string]>(mockRoles),
    oidcConfig: mockResource(mockOidcConfig),
    machineTypes: mockResource(mockMachineTypes),
    vpcList: mockResource(mockVpcs),
    subnets: mockResource([]),
    securityGroups: mockResource([]),
  },
};

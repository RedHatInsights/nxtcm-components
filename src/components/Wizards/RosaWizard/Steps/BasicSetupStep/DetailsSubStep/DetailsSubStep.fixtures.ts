import {
  SelectDropdownType,
  Resource,
  Role,
  MachineTypesDropdownType,
  Region,
  AWSInfrastructureAccounts,
  OpenShiftVersionsData,
} from '../../../../types';

export const mockOpenShiftVersionsData: OpenShiftVersionsData = {
  releases: [
    { label: 'OpenShift 4.12.0', value: '4.12.0' },
    { label: 'OpenShift 4.11.5', value: '4.11.5' },
  ],
};

export const mockAwsInfrastructureAccounts: SelectDropdownType[] = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

export const mockAwsBillingAccounts: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
  { label: 'Billing Account - Secondary (234567890123)', value: 'billing-secondary-234567890123' },
];

export const mockSingleBillingAccount: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

export const mockRegions: SelectDropdownType[] = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
];

export const mockMachineTypes: MachineTypesDropdownType[] = [
  { id: '1', label: 'm5.xlarge', value: 'm5.xlarge', description: 'm5.xlarge' },
  { id: '2', label: 'm5.2xlarge', value: 'm5.2xlarge', description: 'm5.2xlarge' },
];

export const mockRoles: Role[] = [
  {
    installerRole: { label: 'Installer Role', value: 'arn:aws:iam::role/installer' },
    supportRole: [{ label: 'Support Role', value: 'arn:aws:iam::role/support' }],
    workerRole: [{ label: 'Worker Role', value: 'arn:aws:iam::role/worker' }],
  },
];

export const createMockClusterData = (overrides: Record<string, unknown> = {}) => ({
  cluster: {
    name: '',
    cluster_version: '',
    associated_aws_id: '',
    billing_account_id: '',
    region: '',
    machine_type: '',
    ...overrides,
  },
});

export interface DetailsSubStepStoryProps {
  versions?: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  awsInfrastructureAccounts?: Resource<AWSInfrastructureAccounts[]>;
  awsBillingAccounts?: Resource<SelectDropdownType[]>;
  regions?: Resource<Region[], [awsAccount: string]> & {
    fetch: (awsAccount?: string) => Promise<void>;
  };
  machineTypes?: Resource<MachineTypesDropdownType[]>;
  roles?: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  clusterOverrides?: Record<string, unknown>;
}

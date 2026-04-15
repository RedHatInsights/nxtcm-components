import {
  SelectDropdownType,
  Resource,
  Role,
  MachineTypesDropdownType,
  Region,
  AWSInfrastructureAccounts,
  OpenShiftVersionsData,
  ValidationResource,
} from '../../../../types';

export const mockOpenShiftVersionsData: OpenShiftVersionsData = {
  releases: [
    { label: 'OpenShift 4.16.2', value: '4.16.2' },
    { label: 'OpenShift 4.16.0', value: '4.16.0' },
    { label: 'OpenShift 4.15.8', value: '4.15.8' },
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
    installerRole: {
      label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      roleVersion: '4.16.0',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
      },
    ],
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
    installer_role_arn: '',
    worker_role_arn: '',
    support_role_arn: '',
    ...overrides,
  },
});

export interface DetailsSubStepStoryProps {
  clusterNameValidation?: ValidationResource;
  checkClusterNameUniqueness?: (name: string, region?: string) => void;
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

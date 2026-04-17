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

/** Default OpenShift version list for Details CT: several patch lines without explicit latest/default keys. */
export const mockOpenShiftVersionsData: OpenShiftVersionsData = {
  releases: [
    { label: 'OpenShift 4.16.2', value: '4.16.2' },
    { label: 'OpenShift 4.16.0', value: '4.16.0' },
    { label: 'OpenShift 4.15.8', value: '4.15.8' },
  ],
};

/** Two infrastructure AWS accounts for the associated account combobox scenarios. */
export const mockAwsInfrastructureAccounts: SelectDropdownType[] = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

/** Two billing accounts to exercise manual selection vs single-account auto-select. */
export const mockAwsBillingAccounts: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
  { label: 'Billing Account - Secondary (234567890123)', value: 'billing-secondary-234567890123' },
];

/** Single billing account fixture: UI should auto-pick the lone option. */
export const mockSingleBillingAccount: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

/** Region dropdown options spanning multiple US zones for combobox visibility tests. */
export const mockRegions: SelectDropdownType[] = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
];

/** Sample compute instance types passed through to Details-adjacent wiring in the mount helper. */
export const mockMachineTypes: MachineTypesDropdownType[] = [
  { id: '1', label: 'm5.xlarge', value: 'm5.xlarge', description: 'm5.xlarge' },
  { id: '2', label: 'm5.2xlarge', value: 'm5.2xlarge', description: 'm5.2xlarge' },
];

/** Default account roles for version vs installer-role compatibility tests (installer at 4.16.0). */
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

/** Factory for `cluster` defaultValues; spreads `overrides` onto empty-string baseline fields. */
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

/** Props accepted by `DetailsSubStepMount` to override resources, validation, and form defaults. */
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

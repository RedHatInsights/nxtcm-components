import type { OpenShiftVersionsData, Role } from '../../../types';

export const mockOpenShiftVersionsData: OpenShiftVersionsData = {
  releases: [
    { label: 'OpenShift 4.16.2', value: '4.16.2' },
    { label: 'OpenShift 4.16.0', value: '4.16.0' },
    { label: 'OpenShift 4.15.8', value: '4.15.8' },
  ],
};

export const mockAwsInfrastructureAccounts = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

export const mockAwsBillingAccounts = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
  { label: 'Billing Account - Secondary (234567890123)', value: 'billing-secondary-234567890123' },
];

export const mockRegions = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
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

/** latest, default, and previous releases differ so grouping yields three labeled sections. */
export const mockVersionsLatestDefaultPrevious: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.14.0', value: '4.14.0' },
  default: { label: 'OpenShift 4.13.1', value: '4.13.1' },
  releases: [
    { label: 'OpenShift 4.12.0', value: '4.12.0' },
    { label: 'OpenShift 4.11.5', value: '4.11.5' },
  ],
};

export const mockVersionsDefaultEqualsLatest: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [{ label: 'OpenShift 4.11.5', value: '4.11.5' }],
};

export const INSTALLER_ARN_412 = 'arn:aws:iam::123456789012:role/rosa-installer';

export const rolesWithInstallerVersion412: Role[] = [
  {
    installerRole: {
      label: 'Installer role A',
      value: INSTALLER_ARN_412,
      roleVersion: '4.12.0',
    },
    supportRole: [{ label: 'Support Role', value: 'arn:aws:iam::123456789012:role/support' }],
    workerRole: [{ label: 'Worker Role', value: 'arn:aws:iam::123456789012:role/worker' }],
  },
];

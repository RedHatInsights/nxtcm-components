/**
 * Minimal mock data for RosaWizard validation tests.
 * Only includes fields needed for the Details step and wizard structure.
 */
export const mockOpenShiftVersions = [
  { label: 'OpenShift 4.12.0', value: '4.12.0' },
  { label: 'OpenShift 4.11.5', value: '4.11.5' },
];

export const mockAwsInfrastructureAccounts = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
];

export const mockAwsBillingAccounts = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

export const mockRegions = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
];

export const mockRoles = {
  installerRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
    },
  ],
  supportRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
    },
  ],
  workerRoles: [
    {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
    },
  ],
};

export const mockOicdConfig = [
  {
    label: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    value: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
    issuer_url: 'https://oidc.os1.devshift.org/2kl4t2st8eg2u5jppv8kjeemkvimfm99',
  },
];

export const mockMachineTypes = [
  { id: 'm5a.xlarge', label: 'm5a.xlarge', description: '4 vCPU 16 GiB RAM', value: 'm5a.xlarge' },
];

export const mockVPCs = [
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
    ],
    aws_security_groups: [],
  },
];

export const rosaWizardMockStepsData = {
  basicSetupStep: {
    openShiftVersions: mockOpenShiftVersions,
    awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
    awsBillingAccounts: mockAwsBillingAccounts,
    regions: mockRegions,
    roles: mockRoles,
    oicdConfig: mockOicdConfig,
    machineTypes: mockMachineTypes,
    vpcList: mockVPCs,
  },
  callbackFunctions: {
    onAWSAccountChange: () => {},
    refreshAwsBillingAccountCallback: () => {},
    refreshAwsAccountDataCallback: () => {},
  },
};

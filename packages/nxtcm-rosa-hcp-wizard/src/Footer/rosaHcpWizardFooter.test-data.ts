import fixtures from '../ROSAHCPWizard.fixtures';
import { mockRoles } from '../Steps/BasicSetup/Details/Details.fixtures';
import type { ROSAHCPCluster } from '../types';

const mockRoleSet = mockRoles[0];
const mockVpc = fixtures.mockVPCs[0];
const privateSubnet = mockVpc.aws_subnets.find((subnet) => subnet.name.includes('private'));
if (!privateSubnet?.subnet_id) {
  throw new Error(
    `Expected mock VPC "${mockVpc.id}" to include a private subnet in aws_subnets for footer test data`
  );
}
const mockMachinePoolSubnet = privateSubnet.subnet_id;

/** Values that pass Details-step validation in CT and unit tests. */
export const VALID_DETAILS_FORM_VALUES: Partial<ROSAHCPCluster> = {
  name: 'mycluster',
  cluster_version: '4.16.2',
  associated_aws_id: 'aws-prod-123456789012',
  billing_account_id: 'billing-main-123456789012',
  region: 'us-east-1',
};

/** Values that pass full-form validation for footer Review Submit CT (wizard subset of fields). */
export const VALID_REVIEW_SUBMIT_FORM_VALUES: Partial<ROSAHCPCluster> = {
  ...VALID_DETAILS_FORM_VALUES,
  installer_role_arn: mockRoleSet.installerRole.value,
  support_role_arn: mockRoleSet.supportRole[0].value,
  worker_role_arn: mockRoleSet.workerRole[0].value,
  byo_oidc_config_id: fixtures.mockOicdConfig[0].value,
  custom_operator_roles_prefix: 'mycluster-a1b2',
  selected_vpc: mockVpc.id,
  machine_pools_subnets: [{ machine_pool_subnet: mockMachinePoolSubnet }],
  machine_type: fixtures.mockMachineTypes[0].value,
};

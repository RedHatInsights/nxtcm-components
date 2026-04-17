import { defaultRosaWizardStrings } from '../../../rosaWizardStrings.defaults';
import type {
  MachineTypesDropdownType,
  Resource,
  SecurityGroup,
  Subnet,
  VPC,
} from '../../../../types';

/** Security groups returned for the production VPC in machine pool advanced networking tests. */
export const mockSecurityGroups: SecurityGroup[] = [
  { id: 'sg-0a1b2c3d4e5f00001', name: 'default' },
  { id: 'sg-0a1b2c3d4e5f00002', name: 'k8s-traffic-rules' },
  { id: 'sg-0a1b2c3d4e5f00003', name: 'web-server-sg' },
  { id: 'sg-0a1b2c3d4e5f00004', name: 'database-access-sg' },
  { id: 'sg-0a1b2c3d4e5f00005', name: '' },
];

/** Private and public subnets attached to the primary mock VPC for subnet picker scenarios. */
export const mockSubnets: Subnet[] = [
  {
    subnet_id: 'subnet-private-1',
    name: 'my-vpc-private-us-east-1a',
    availability_zone: 'us-east-1a',
  },
  {
    subnet_id: 'subnet-private-2',
    name: 'my-vpc-private-us-east-1b',
    availability_zone: 'us-east-1b',
  },
  {
    subnet_id: 'subnet-public-1',
    name: 'my-vpc-public-us-east-1a',
    availability_zone: 'us-east-1a',
  },
  {
    subnet_id: 'subnet-public-2',
    name: 'my-vpc-public-us-east-1b',
    availability_zone: 'us-east-1b',
  },
];

/** Two VPCs: production with subnets+security groups, staging with subnets only (no security groups). */
export const mockVpcList: Resource<VPC[]> = {
  data: [
    {
      id: 'vpc-123',
      name: 'my-production-vpc',
      aws_subnets: mockSubnets,
      aws_security_groups: mockSecurityGroups,
    },
    {
      id: 'vpc-456',
      name: 'my-staging-vpc',
      aws_subnets: [
        {
          subnet_id: 'subnet-staging-private',
          name: 'staging-private-subnet',
          availability_zone: 'us-west-2a',
        },
        {
          subnet_id: 'subnet-staging-public',
          name: 'staging-public-subnet',
          availability_zone: 'us-west-2a',
        },
      ],
      aws_security_groups: [],
    },
  ],
  error: null,
  isFetching: false,
  fetch: async () => {},
};

/** Loaded machine type options for the compute instance type select in machine pools. */
export const mockMachineTypesData: Resource<MachineTypesDropdownType[]> = {
  data: [
    {
      id: 'm5.xlarge',
      label: 'm5.xlarge',
      description: '4 vCPU, 16 GiB Memory',
      value: 'm5.xlarge',
    },
    {
      id: 'm5.2xlarge',
      label: 'm5.2xlarge',
      description: '8 vCPU, 32 GiB Memory',
      value: 'm5.2xlarge',
    },
    { id: 'r5.large', label: 'r5.large', description: '2 vCPU, 16 GiB Memory', value: 'r5.large' },
  ],
  error: null,
  isFetching: false,
};

/** Default machine-pools step cluster slice merged with `overrides` for form defaultValues in CT. */
export const createMockClusterData = (overrides: Record<string, unknown> = {}) => ({
  cluster: {
    region: 'us-east-1',
    selected_vpc: '',
    cluster_privacy: 'external',
    cluster_privacy_public_subnet_id: '',
    cluster_version: '4.16.0',
    machine_type: '',
    autoscaling: false,
    min_replicas: 2,
    max_replicas: 4,
    nodes_compute: 2,
    machine_pools_subnets: [],
    security_groups_worker: [],
    ...overrides,
  },
});

const sgStrings = defaultRosaWizardStrings.securityGroups;
const { common: commonStrings } = defaultRosaWizardStrings;

/**
 * String bundle for CT: machine pool labels, security group copy, and VPC list error title pattern.
 * Keeps assertions aligned with `defaultRosaWizardStrings` without hardcoding long literals everywhere.
 */
export const machinePoolsSubstepCtStrings = {
  mp: defaultRosaWizardStrings.machinePools,
  sg: sgStrings,
  securityGroupsListErrorTitle: `${commonStrings.errorLoadingPrefix} ${sgStrings.formLabel} ${commonStrings.listSuffix}`,
};

/** Optional overrides for `MachinePoolsSubstepMount`: VPC list, machine types resource, cluster defaults. */
export interface MachinePoolsSubstepStoryProps {
  vpcList?: Resource<VPC[]>;
  machineTypes?: Resource<MachineTypesDropdownType[]>;
  clusterOverrides?: Record<string, unknown>;
}

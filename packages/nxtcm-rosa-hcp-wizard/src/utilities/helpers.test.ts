import type { VPC } from '../types';
import {
  buildMachinePoolsReviewSelectOptions,
  getAvailabilityZonesForSubnetIds,
  getMachinePoolSubnetIds,
  getNestedValue,
  isSelectedVpcValue,
  resolveSelectedVpc,
} from './helpers';

describe('getNestedValue', () => {
  interface Cluster {
    metadata?: { name: string };
    pools: { replicas: number }[];
    enabled: boolean;
  }

  const cluster: Cluster = {
    metadata: { name: 'example' },
    pools: [{ replicas: 0 }],
    enabled: false,
  };

  it('reads domain interfaces, optional nested objects, and array indices', () => {
    expect(getNestedValue(cluster, 'metadata.name')).toBe('example');
    expect(getNestedValue(cluster, 'pools.0.replicas')).toBe(0);
    expect(getNestedValue(cluster, 'enabled')).toBe(false);
  });

  it('returns undefined for missing paths and stops at non-object values', () => {
    expect(getNestedValue(cluster, 'missing')).toBeUndefined();
    expect(getNestedValue(cluster, 'pools.1.replicas')).toBeUndefined();
    expect(getNestedValue(cluster, 'metadata.name.length')).toBeUndefined();
    expect(getNestedValue(cluster, '')).toBeUndefined();
    expect(getNestedValue({ metadata: null }, 'metadata.name')).toBeUndefined();
    expect(getNestedValue(undefined, 'metadata.name')).toBeUndefined();
  });
});

const mockVpc: VPC = {
  id: 'vpc-1',
  name: 'test-vpc',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-a',
      name: 'private-a',
      availability_zone: 'us-east-1a',
      public: false,
      cidr_block: '10.0.128.0/20',
    },
    {
      subnet_id: 'subnet-public-a',
      name: 'public-a',
      availability_zone: 'us-east-1a',
      public: true,
      cidr_block: '10.0.0.0/20',
    },
    {
      subnet_id: 'subnet-private-b',
      name: 'private-b',
      availability_zone: 'us-east-1b',
      public: false,
      cidr_block: '10.0.144.0/20',
    },
    {
      subnet_id: 'subnet-public-b',
      name: 'public-b',
      availability_zone: 'us-east-1b',
      public: true,
      cidr_block: '10.0.16.0/20',
    },
  ],
};

describe('isSelectedVpcValue', () => {
  const { cidr_block: _cidrBlock, ...subnetWithoutCidr } = mockVpc.aws_subnets[0];

  it.each([
    { description: 'undefined', value: undefined },
    { description: 'an empty selection string', value: '' },
    { description: 'a VPC ID', value: mockVpc.id },
    { description: 'a VPC without security groups', value: mockVpc },
    {
      description: 'a VPC with an empty security group list',
      value: { ...mockVpc, aws_security_groups: [] },
    },
    {
      description: 'a VPC with security groups and optional managed flags',
      value: {
        ...mockVpc,
        aws_security_groups: [
          { id: 'sg-default', name: 'default' },
          { id: 'sg-managed', name: 'managed', red_hat_managed: true },
          { id: 'sg-custom', name: 'custom', red_hat_managed: false },
        ],
      },
    },
  ])('accepts $description', ({ value }) => {
    expect(isSelectedVpcValue(value)).toBe(true);
  });

  it.each([
    { description: 'null', value: null },
    { description: 'a number', value: 123 },
    { description: 'an array', value: [mockVpc] },
    { description: 'an ID-only object', value: { id: mockVpc.id } },
    { description: 'a numeric VPC ID', value: { ...mockVpc, id: 123 } },
    { description: 'a non-array subnet list', value: { ...mockVpc, aws_subnets: {} } },
    { description: 'a null subnet entry', value: { ...mockVpc, aws_subnets: [null] } },
    {
      description: 'a subnet missing its CIDR block',
      value: { ...mockVpc, aws_subnets: [subnetWithoutCidr] },
    },
    {
      description: 'a subnet with a non-string CIDR block',
      value: { ...mockVpc, aws_subnets: [{ ...subnetWithoutCidr, cidr_block: 123 }] },
    },
    {
      description: 'a non-array security group list',
      value: { ...mockVpc, aws_security_groups: {} },
    },
    {
      description: 'a null security group entry',
      value: { ...mockVpc, aws_security_groups: [null] },
    },
    {
      description: 'a numeric security group ID',
      value: { ...mockVpc, aws_security_groups: [{ id: 123, name: 'default' }] },
    },
    {
      description: 'a non-boolean managed flag',
      value: {
        ...mockVpc,
        aws_security_groups: [{ id: 'sg-default', name: 'default', red_hat_managed: 'false' }],
      },
    },
  ])('rejects $description', ({ value }) => {
    expect(isSelectedVpcValue(value)).toBe(false);
  });
});

describe('resolveSelectedVpc', () => {
  it.each([
    { description: 'a VPC ID', value: mockVpc.id },
    { description: 'an ID-only object', value: { id: mockVpc.id } },
    {
      description: 'an incomplete subnet',
      value: { ...mockVpc, aws_subnets: [{ availability_zone: 'old-zone' }] },
    },
    {
      description: 'an incomplete security group',
      value: { ...mockVpc, aws_security_groups: [{ id: 'sg-stale' }] },
    },
    {
      description: 'a complete retained object',
      value: { ...mockVpc, aws_security_groups: [{ id: 'sg-stale', name: 'stale' }] },
    },
  ])('resolves $description using fresh list data', ({ value }) => {
    expect(resolveSelectedVpc(value, [mockVpc])).toBe(mockVpc);
  });

  it('falls back to a complete retained object when its ID is absent from the list', () => {
    expect(resolveSelectedVpc(mockVpc, [{ ...mockVpc, id: 'vpc-other' }])).toBe(mockVpc);
  });

  it.each([
    undefined,
    null,
    '',
    'vpc-missing',
    [mockVpc],
    { id: 123 },
    { id: mockVpc.id },
    { ...mockVpc, aws_subnets: [null] },
    { ...mockVpc, aws_security_groups: {} },
  ])('returns undefined for an unresolved incomplete or invalid selection: %p', (value) => {
    expect(resolveSelectedVpc(value, [])).toBeUndefined();
  });
});

describe('getMachinePoolSubnetIds', () => {
  it('returns non-empty subnet ids', () => {
    expect(
      getMachinePoolSubnetIds([
        { machine_pool_subnet: 'subnet-private-a' },
        { machine_pool_subnet: '' },
        { machine_pool_subnet: '  subnet-private-b  ' },
      ])
    ).toEqual(['subnet-private-a', 'subnet-private-b']);
  });

  it('returns an empty array when no rows are selected', () => {
    expect(getMachinePoolSubnetIds(undefined)).toEqual([]);
    expect(getMachinePoolSubnetIds([{ machine_pool_subnet: '' }])).toEqual([]);
  });
});

describe('getAvailabilityZonesForSubnetIds', () => {
  it('returns unique AZs for matching subnet ids', () => {
    expect(
      getAvailabilityZonesForSubnetIds(mockVpc, ['subnet-private-a', 'subnet-public-a'])
    ).toEqual(['us-east-1a']);
  });

  it('returns an empty array when ids do not match the VPC', () => {
    expect(getAvailabilityZonesForSubnetIds(mockVpc, ['subnet-missing'])).toEqual([]);
  });
});

describe('buildMachinePoolsReviewSelectOptions public subnet AZ filter', () => {
  it('lists every public subnet when machine pool subnet ids are omitted', () => {
    const { publicSubnet, subnet } = buildMachinePoolsReviewSelectOptions(mockVpc, [mockVpc]);

    expect(subnet.map((option) => option.value)).toEqual(['subnet-private-a', 'subnet-private-b']);
    expect(publicSubnet.map((option) => option.value)).toEqual([
      'subnet-public-a',
      'subnet-public-b',
    ]);
  });

  it('limits public subnets to the machine pool subnet AZ', () => {
    const { publicSubnet, subnet } = buildMachinePoolsReviewSelectOptions(
      mockVpc,
      [mockVpc],
      ['subnet-private-a']
    );

    expect(subnet.map((option) => option.value)).toEqual(['subnet-private-a', 'subnet-private-b']);
    expect(publicSubnet.map((option) => option.value)).toEqual(['subnet-public-a']);
  });

  it('returns no public subnets when selected ids do not match the VPC', () => {
    const { publicSubnet } = buildMachinePoolsReviewSelectOptions(
      mockVpc,
      [mockVpc],
      ['subnet-missing']
    );

    expect(publicSubnet).toEqual([]);
  });
});

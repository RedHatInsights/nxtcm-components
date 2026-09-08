import type { VPC } from '../types';
import {
  buildMachinePoolsReviewSelectOptions,
  getAvailabilityZonesForSubnetIds,
  getMachinePoolSubnetIds,
} from './helpers';

const mockVpc: VPC = {
  id: 'vpc-1',
  name: 'test-vpc',
  aws_subnets: [
    {
      subnet_id: 'subnet-private-a',
      name: 'private-a',
      availability_zone: 'us-east-1a',
      public: false,
    },
    {
      subnet_id: 'subnet-public-a',
      name: 'public-a',
      availability_zone: 'us-east-1a',
      public: true,
    },
    {
      subnet_id: 'subnet-private-b',
      name: 'private-b',
      availability_zone: 'us-east-1b',
      public: false,
    },
    {
      subnet_id: 'subnet-public-b',
      name: 'public-b',
      availability_zone: 'us-east-1b',
      public: true,
    },
  ],
};

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

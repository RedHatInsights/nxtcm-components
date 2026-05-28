import type { Subnet, VPC } from '../../../types';

export const mockSubnets: Subnet[] = [
  { subnet_id: 'subnet-001', name: 'Public Subnet A', availability_zone: 'us-east-1a' },
  { subnet_id: 'subnet-002', name: 'Private Subnet A', availability_zone: 'us-east-1a' },
  { subnet_id: 'subnet-003', name: 'Public Subnet B', availability_zone: 'us-east-1b' },
];

export const mockVpcList: VPC[] = [
  {
    id: 'vpc-12345',
    name: 'Production VPC',
    aws_subnets: mockSubnets,
  },
  {
    id: 'vpc-67890',
    name: 'Staging VPC',
    aws_subnets: [
      { subnet_id: 'subnet-004', name: 'Staging Subnet A', availability_zone: 'us-west-2a' },
    ],
  },
];

import type { Subnet, VPC } from '../../../types';

export const mockSubnets: Subnet[] = [
  {
    subnet_id: 'subnet-001',
    name: 'public-subnet-a',
    availability_zone: 'us-east-1a',
    public: true,
  },
  {
    subnet_id: 'subnet-002',
    name: 'private-subnet-a',
    availability_zone: 'us-east-1a',
    public: false,
  },
  {
    subnet_id: 'subnet-003',
    name: 'public-subnet-b',
    availability_zone: 'us-east-1b',
    public: true,
  },
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
      {
        subnet_id: 'subnet-004',
        name: 'staging-subnet-a',
        availability_zone: 'us-west-2a',
        public: false,
      },
    ],
  },
];

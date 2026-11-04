import type { Subnet, VPC } from '../../../types';

const mockSubnets: Subnet[] = [
  {
    subnet_id: 'subnet-001',
    cidr_block: '10.0.0.0/20',
    name: 'public-subnet-a',
    availability_zone: 'us-east-1a',
    public: true,
  },
  {
    subnet_id: 'subnet-002',
    cidr_block: '10.0.128.0/20',
    name: 'private-subnet-a',
    availability_zone: 'us-east-1a',
    public: false,
  },
  {
    subnet_id: 'subnet-003',
    cidr_block: '10.0.16.0/20',
    name: 'public-subnet-b',
    availability_zone: 'us-east-1b',
    public: true,
  },
  {
    subnet_id: 'subnet-005',
    cidr_block: '10.0.144.0/20',
    name: 'private-subnet-b',
    availability_zone: 'us-east-1b',
    public: false,
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
        cidr_block: '10.0.128.0/20',
        name: 'staging-subnet-a',
        availability_zone: 'us-west-2a',
        public: false,
      },
    ],
  },
];

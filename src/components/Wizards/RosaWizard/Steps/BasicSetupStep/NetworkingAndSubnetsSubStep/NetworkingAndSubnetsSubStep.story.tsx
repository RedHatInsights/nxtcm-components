import React, { useCallback } from 'react';
import { NetworkingAndSubnetsSubStep } from './NetworkingAndSubnetsSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { useAppForm } from '../../../RosaFormContext';
import { VPC, Subnet, Resource, MachineTypesDropdownType } from '../../../../types';
import type { RosaWizardFormData } from '../../../../types';

/**
 * Isolated Networking and Subnets substep with Rosa form and strings providers for demos and component tests.
 */

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

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

export const mockVpcList: VPC[] = [
  {
    id: 'vpc-123',
    name: 'my-production-vpc',
    aws_subnets: mockSubnets,
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
  },
];

export const mockMachineTypes: MachineTypesDropdownType[] = [
  { id: 'm5.xlarge', label: 'm5.xlarge', description: '4 vCPU, 16 GiB Memory', value: 'm5.xlarge' },
  {
    id: 'm5.2xlarge',
    label: 'm5.2xlarge',
    description: '8 vCPU, 32 GiB Memory',
    value: 'm5.2xlarge',
  },
  { id: 'r5.large', label: 'r5.large', description: '2 vCPU, 16 GiB Memory', value: 'r5.large' },
];

export const createMockClusterData = (overrides: Record<string, unknown> = {}) => ({
  cluster: {
    region: 'us-east-1',
    selected_vpc: '',
    cluster_privacy: 'external',
    cluster_privacy_public_subnet_id: '',
    machine_type: '',
    autoscaling: false,
    min_replicas: 2,
    max_replicas: 4,
    nodes_compute: 2,
    machine_pools_subnets: [],
    configure_proxy: false,
    cidr_default: true,
    network_machine_cidr: '10.0.0.0/16',
    network_service_cidr: '172.30.0.0/16',
    network_pod_cidr: '10.128.0.0/14',
    network_host_prefix: '/23',
    ...overrides,
  },
});

export interface NetworkingSubStepStoryProps {
  vpcList?: Resource<VPC[]>;
  clusterOverrides?: Record<string, unknown>;
  onClusterWideProxySelected?: (selected: boolean) => void;
}

const NetworkingFormWrapper: React.FC<{
  clusterOverrides?: Record<string, unknown>;
  children: React.ReactNode;
}> = ({ clusterOverrides = {}, children }) => {
  const form = useAppForm({
    defaultValues: createMockClusterData(clusterOverrides) as unknown as RosaWizardFormData,
    onSubmit: async () => {},
  });

  return <form.AppForm>{children}</form.AppForm>;
};

/**
 * Renders VPC and subnet controls with optional loading or cluster overrides and optional proxy-selection callback.
 */
export const NetworkingSubStepStory: React.FC<NetworkingSubStepStoryProps> = ({
  vpcList = mockResource(mockVpcList),
  clusterOverrides = {},
  onClusterWideProxySelected,
}) => {
  const setIsClusterWideProxySelected = useCallback(
    (selected: boolean) => {
      onClusterWideProxySelected?.(selected);
    },
    [onClusterWideProxySelected]
  );

  return (
    <RosaWizardStringsProvider>
      <NetworkingFormWrapper clusterOverrides={clusterOverrides}>
        <NetworkingAndSubnetsSubStep
          vpcList={vpcList}
          setIsClusterWideProxySelected={setIsClusterWideProxySelected}
        />
      </NetworkingFormWrapper>
    </RosaWizardStringsProvider>
  );
};

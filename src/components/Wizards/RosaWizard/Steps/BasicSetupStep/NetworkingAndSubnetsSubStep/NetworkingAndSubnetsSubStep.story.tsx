import React, { useState, useCallback } from 'react';
import { NetworkingAndSubnetsSubStep } from './NetworkingAndSubnetsSubStep';
import { TranslationProvider } from '../../../../../../context/TranslationContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { VPC, Subnet, MachineTypesDropdownType } from '../../../../types';

// Mock VPC data with subnets
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

// Default cluster data factory
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

// Props interface for the wrapped component
export interface NetworkingSubStepStoryProps {
  vpcList?: VPC[];
  machineTypes?: MachineTypesDropdownType[];
  clusterOverrides?: Record<string, unknown>;
  onClusterWideProxySelected?: (selected: boolean) => void;
}

// Wrapped component that can be mounted in tests
export const NetworkingSubStepStory: React.FC<NetworkingSubStepStoryProps> = ({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypes,
  clusterOverrides = {},
  onClusterWideProxySelected,
}) => {
  const [data, setData] = useState(() => createMockClusterData(clusterOverrides));

  const update = useCallback(() => {
    setData((currentData) => ({ ...currentData }));
  }, []);

  const setIsClusterWideProxySelected = useCallback(
    (selected: boolean) => {
      onClusterWideProxySelected?.(selected);
    },
    [onClusterWideProxySelected]
  );

  return (
    <TranslationProvider>
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <ShowValidationProvider>
              <ValidationProvider>
                <NetworkingAndSubnetsSubStep
                  vpcList={vpcList}
                  machineTypes={machineTypes}
                  setIsClusterWideProxySelected={setIsClusterWideProxySelected}
                />
              </ValidationProvider>
            </ShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </TranslationProvider>
  );
};

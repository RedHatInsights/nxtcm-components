import React, { useState, useCallback } from 'react';
import { MachinePoolsSubstep } from './MachinePoolsSubstep';
import { TranslationProvider } from '../../../../../../context/TranslationContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { VPC, Subnet, SecurityGroup, MachineTypesDropdownType } from '../../../../types';

// Mock security groups
export const mockSecurityGroups: SecurityGroup[] = [
  { id: 'sg-0a1b2c3d4e5f00001', name: 'default' },
  { id: 'sg-0a1b2c3d4e5f00002', name: 'k8s-traffic-rules' },
  { id: 'sg-0a1b2c3d4e5f00003', name: 'web-server-sg' },
  { id: 'sg-0a1b2c3d4e5f00004', name: 'database-access-sg' },
  { id: 'sg-0a1b2c3d4e5f00005', name: '' },
];

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
    security_groups_worker: [],
    ...overrides,
  },
});

// Props interface for the wrapped component
export interface MachinePoolsSubstepStoryProps {
  vpcList?: VPC[];
  machineTypes?: MachineTypesDropdownType[];
  clusterOverrides?: Record<string, unknown>;
}

// Wrapped component that can be mounted in tests
export const MachinePoolsSubstepStory: React.FC<MachinePoolsSubstepStoryProps> = ({
  vpcList = mockVpcList,
  machineTypes = mockMachineTypes,
  clusterOverrides = {},
}) => {
  const [data, setData] = useState(() => createMockClusterData(clusterOverrides));

  const update = useCallback(() => {
    // Force re-render by creating a new object reference
    setData((currentData) => ({ ...currentData }));
  }, []);

  return (
    <TranslationProvider>
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <ShowValidationProvider>
              <ValidationProvider>
                <MachinePoolsSubstep vpcList={vpcList} machineTypes={machineTypes} />
              </ValidationProvider>
            </ShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </TranslationProvider>
  );
};

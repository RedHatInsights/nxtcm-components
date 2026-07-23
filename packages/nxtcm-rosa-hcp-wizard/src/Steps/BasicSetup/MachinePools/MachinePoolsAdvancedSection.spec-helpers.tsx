import React from 'react';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import type { VPC, ROSAHCPCluster, VpcListResource } from '../../../types';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { getClusterValidationSchemaDefaultValues } from '../../../yupSchemas';
import { MachinePoolsAdvancedSection } from './MachinePoolsAdvancedSection';
import type { SecurityGroup } from '../../../types';

export const mockSecurityGroupsForAdvanced: SecurityGroup[] = [
  { id: 'sg-111', name: 'default' },
  { id: 'sg-222', name: 'app-sg' },
];

export const mockVPCForAdvanced: VPC = {
  id: 'vpc-advanced',
  name: 'advanced-test-vpc',
  aws_subnets: [],
  aws_security_groups: mockSecurityGroupsForAdvanced,
};

export const mockVpcListResource: VpcListResource = {
  data: [mockVPCForAdvanced],
  error: null,
  isFetching: false,
  fetch: async () => {},
};

export const mockVpcListResourceWithError: VpcListResource = {
  data: [],
  error: 'VPC load error',
  isFetching: false,
  fetch: async () => {},
};

export interface MachinePoolsAdvancedSectionMountProps {
  defaultValues?: Partial<ROSAHCPCluster>;
  wrongVersionForIMDS?: boolean;
  maxRootDiskSize?: number;
  clusterVersion?: string;
  selectedVPC?: VPC | undefined;
  vpcList?: VpcListResource;
  refreshVPCs?: () => void;
}

export const MachinePoolsAdvancedSectionMount: React.FC<MachinePoolsAdvancedSectionMountProps> = ({
  defaultValues = {},
  wrongVersionForIMDS = false,
  maxRootDiskSize = 16384,
  clusterVersion = '4.16.2',
  selectedVPC = mockVPCForAdvanced,
  vpcList = mockVpcListResource,
  refreshVPCs,
}) => {
  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      imds: 'imdsv1andimdsv2',
      compute_root_volume: 300,
      security_groups_worker: [],
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <MachinePoolsAdvancedSection
          wrongVersionForIMDS={wrongVersionForIMDS}
          maxRootDiskSize={maxRootDiskSize}
          clusterVersion={clusterVersion}
          selectedVPC={selectedVPC}
          vpcList={vpcList}
          refreshVPCs={refreshVPCs}
        />
      </Form>
    </FormProvider>
  );
};

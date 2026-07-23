import React from 'react';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { CloudVpc, ROSAHCPCluster } from '../../../../types';
import { withRosaCt } from '../../../../components/WizFields/wizFieldCtSpecHelpers';
import { getClusterValidationSchemaDefaultValues } from '../../../../yupSchemas';
import EditSecurityGroups from './EditSecurityGroups';
import type { SecurityGroup } from '../../../../types';

export const mockSecurityGroupsForVpc: SecurityGroup[] = [
  { id: 'sg-0a1b2c3d4e5f00001', name: 'default' },
  { id: 'sg-0a1b2c3d4e5f00002', name: 'k8s-traffic-rules' },
  { id: 'sg-0a1b2c3d4e5f00003', name: 'web-server-sg' },
];

export const mockSelectedVPC: CloudVpc = {
  id: 'vpc-12345',
  name: 'test-vpc',
  aws_subnets: [],
  aws_security_groups: mockSecurityGroupsForVpc,
};

export const mockEmptyVPC: CloudVpc = {
  id: 'vpc-empty',
  name: 'empty-vpc',
  aws_subnets: [],
  aws_security_groups: [],
};

export interface EditSecurityGroupsMountProps {
  defaultValues?: Partial<ROSAHCPCluster>;
  selectedVPC?: CloudVpc | undefined;
  isReadOnly?: boolean;
  apiError?: ReactNode;
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
  clusterVersion?: string;
  label?: string;
}

export const EditSecurityGroupsMount: React.FC<EditSecurityGroupsMountProps> = ({
  defaultValues = {},
  selectedVPC = mockSelectedVPC,
  isReadOnly = false,
  apiError,
  refreshVPCCallback,
  isVPCLoading = false,
  clusterVersion = '4.16.2',
  label,
}) => {
  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      security_groups_worker: [],
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <EditSecurityGroups
          selectedVPC={selectedVPC}
          isReadOnly={isReadOnly}
          apiError={apiError}
          refreshVPCCallback={refreshVPCCallback}
          isVPCLoading={isVPCLoading}
          clusterVersion={clusterVersion}
          label={label}
        />
      </Form>
    </FormProvider>
  );
};

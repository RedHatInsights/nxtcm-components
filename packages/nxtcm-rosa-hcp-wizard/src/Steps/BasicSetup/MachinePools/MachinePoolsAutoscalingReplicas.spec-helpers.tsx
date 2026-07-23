import React from 'react';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster } from '../../../types';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { getClusterValidationSchemaDefaultValues } from '../../../yupSchemas';
import { MachinePoolsAutoscalingReplicas } from './MachinePoolsAutoscalingReplicas';

export interface MachinePoolsAutoscalingReplicasMountProps {
  defaultValues?: Partial<ROSAHCPCluster>;
  maxAutoscalingNodes?: number;
}

export const MachinePoolsAutoscalingReplicasMount: React.FC<
  MachinePoolsAutoscalingReplicasMountProps
> = ({ defaultValues = {}, maxAutoscalingNodes = 180 }) => {
  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      min_replicas: 2,
      max_replicas: 4,
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <MachinePoolsAutoscalingReplicas maxAutoscalingNodes={maxAutoscalingNodes} />
      </Form>
    </FormProvider>
  );
};

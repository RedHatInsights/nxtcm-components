/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import type { ClusterFormData } from '../../../../types';
import rosaWizardFixtures from '../../../../RosaWizard/RosaWizard.fixtures';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { makeVpcListResource } from '../../../rosaHcpWizardCtSpecHelpers';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import type { MachineTypesResource, VpcListResource } from '../../../types';
import {
  clusterValidationSchema,
  getClusterValidationSchemaDefaultValues,
} from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';

import { MachinePools } from './MachinePools';

export type MachinePoolsMountProps = {
  vpcList?: VpcListResource;
  machineTypes?: MachineTypesResource;
  defaultValues?: Partial<ClusterFormData>;
};

export const MachinePoolsMount: React.FC<MachinePoolsMountProps> = ({
  vpcList,
  machineTypes,
  defaultValues = {},
}) => {
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    }),
    []
  );

  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ClusterFormData>>({
    defaultValues: {
      ...schemaDefaults,
      region: 'us-east-1',
      cluster_version: '4.16.2',
      ...defaultValues,
    },
    resolver: yupResolver(clusterValidationSchema) as Resolver<Partial<ClusterFormData>>,
    context: validationContext,
    mode: 'onTouched',
  });

  const vpcListProps = makeVpcListResource(vpcList);

  const machineTypesProps: MachineTypesResource = {
    data: machineTypes?.data ?? rosaWizardFixtures.mockMachineTypes,
    isFetching: machineTypes?.isFetching ?? false,
    error: machineTypes?.error ?? null,
    fetch: machineTypes?.fetch ?? (async (_region: string) => {}),
  };

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <MachinePools vpcList={vpcListProps} machineTypes={machineTypesProps} />
      </Form>
    </FormProvider>
  );
};

/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';

import type { MachineTypesResource, ROSAHCPCluster, VpcListResource } from '../../../types';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import {
  makeDefaultRosaHcpCtWizardData,
  makeMachineTypesResource,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { createClusterValidationResolver } from '../../../utilities/clusterValidationResolver';
import { getClusterValidationSchemaDefaultValues } from '../../../yupSchemas';

import { MachinePools } from './MachinePools';

export type MachinePoolsMountProps = {
  vpcList?: VpcListResource;
  machineTypes?: MachineTypesResource;
  defaultValues?: Partial<ROSAHCPCluster>;
};

export const MachinePoolsMount: React.FC<MachinePoolsMountProps> = ({
  vpcList,
  machineTypes,
  defaultValues = {},
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      region: 'us-east-1',
      cluster_version: '4.16.2',
      ...defaultValues,
    },
    resolver,
    mode: 'onTouched',
  });

  const vpcListProps = makeVpcListResource(vpcList);
  const machineTypesProps = makeMachineTypesResource(machineTypes);

  const wizardData = useMemo(
    () =>
      makeDefaultRosaHcpCtWizardData({
        machineTypes: machineTypesProps,
        vpcList: vpcListProps,
      }),
    [machineTypesProps, vpcListProps]
  );

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizardFieldMetaChangeEffectsCtHarness wizardData={wizardData} />
        <MachinePools vpcList={vpcListProps} machineTypes={machineTypesProps} />
      </Form>
    </FormProvider>
  );
};

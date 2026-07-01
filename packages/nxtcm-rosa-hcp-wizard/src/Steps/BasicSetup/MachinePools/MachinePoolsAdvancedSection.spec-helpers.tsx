/**
 * Playwright CT mount target for MachinePoolsAdvancedSection.
 * Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  makeDefaultRosaHcpCtWizardData,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import type { CloudVpc, ROSAHCPCluster, VpcListResource } from '../../../types';
import {
  clusterValidationSchema,
  getClusterValidationSchemaDefaultValues,
} from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';

import { MachinePoolsAdvancedSection } from './MachinePoolsAdvancedSection';

export type MachinePoolsAdvancedSectionMountProps = {
  wrongVersionForIMDS?: boolean;
  maxRootDiskSize?: number;
  clusterVersion?: string;
  selectedVPC?: CloudVpc;
  vpcList?: VpcListResource;
  refreshVPCs?: () => void;
  defaultValues?: Partial<ROSAHCPCluster>;
};

export const MachinePoolsAdvancedSectionMount: React.FC<MachinePoolsAdvancedSectionMountProps> = ({
  wrongVersionForIMDS = false,
  maxRootDiskSize = 16384,
  clusterVersion = '4.16.2',
  selectedVPC,
  vpcList,
  refreshVPCs,
  defaultValues = {},
}) => {
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    }),
    [maxRootDiskSize]
  );

  const schemaDefaults = getClusterValidationSchemaDefaultValues();
  const vpcListProps = makeVpcListResource(vpcList);

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      cluster_version: clusterVersion,
      ...defaultValues,
    },
    resolver: yupResolver(clusterValidationSchema) as Resolver<Partial<ROSAHCPCluster>>,
    context: validationContext,
    mode: 'onTouched',
  });

  const wizardData = useMemo(
    () => makeDefaultRosaHcpCtWizardData({ vpcList: vpcListProps }),
    [vpcListProps]
  );

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizardFieldMetaChangeEffectsCtHarness wizardData={wizardData} />
        <MachinePoolsAdvancedSection
          wrongVersionForIMDS={wrongVersionForIMDS}
          maxRootDiskSize={maxRootDiskSize}
          clusterVersion={clusterVersion}
          selectedVPC={selectedVPC}
          vpcList={vpcListProps}
          refreshVPCs={refreshVPCs}
        />
      </Form>
    </FormProvider>
  );
};

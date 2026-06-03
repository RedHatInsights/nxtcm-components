/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useEffect, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, Wizard, WizardStep } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import type { MachineTypesResource, ROSAHCPCluster, VpcListResource } from '../../../types';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { STEP_IDS } from '../../../constants';
import {
  makeDefaultRosaHcpCtWizardData,
  makeMachineTypesResource,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import { buildRosaHcpWizardStepLayout } from '../../../rosaHcpWizardStepLayout';
import { useRosaHcpWizardStepNavDisabledLookup } from '../../../useRosaHcpWizardStepNavDisabledLookup';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaHcpWizardValidationProvider,
  useRosaHcpWizardStepStatusLookup,
  useRosaHcpWizardValidation,
} from '../../../rosaHcpWizardValidationContext';
import {
  clusterValidationSchema,
  getClusterValidationSchemaDefaultValues,
} from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';

import { MachinePools } from './MachinePools';
import { Networking } from '../Networking/Networking';

const machinePoolsChildStepIdsByParent = buildRosaHcpWizardStepLayout({
  includeClusterWideProxy: false,
}).childStepIdsByParent;

const machinePoolsForwardNavChildStepIdsByParent = {
  [STEP_IDS.BASIC_SETUP]: [STEP_IDS.MACHINE_POOLS, STEP_IDS.NETWORKING],
} as const;

function useMachinePoolsCtForm(defaultValues: Partial<ROSAHCPCluster> = {}) {
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

  return useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      region: 'us-east-1',
      cluster_version: '4.16.2',
      ...defaultValues,
    },
    resolver: yupResolver(clusterValidationSchema) as Resolver<Partial<ROSAHCPCluster>>,
    context: validationContext,
    mode: 'onTouched',
  });
}

function MachinePoolsWizardNavShell({
  vpcListProps,
  machineTypesProps,
  wizardData,
  includeNetworkingStep = false,
  childStepIdsByParent = machinePoolsChildStepIdsByParent,
  startIndex = 1,
}: {
  vpcListProps: ReturnType<typeof makeVpcListResource>;
  machineTypesProps: ReturnType<typeof makeMachineTypesResource>;
  wizardData: ReturnType<typeof makeDefaultRosaHcpCtWizardData>;
  includeNetworkingStep?: boolean;
  childStepIdsByParent?: typeof machinePoolsChildStepIdsByParent;
  startIndex?: number;
}) {
  const sl = defaultRosaHcpWizardStrings.wizard.stepLabels;
  const statusForStep = useRosaHcpWizardStepStatusLookup(childStepIdsByParent);
  const isNavDisabledForStep = useRosaHcpWizardStepNavDisabledLookup({
    includeClusterWideProxy: false,
    childStepIdsByParent,
  });
  const { onWizardStepChange } = useRosaHcpWizardValidation();

  useEffect(() => {
    onWizardStepChange(STEP_IDS.MACHINE_POOLS);
  }, [onWizardStepChange]);

  const machinePoolsStep = (
    <WizardStep
      key={STEP_IDS.MACHINE_POOLS}
      name={sl.machinePools}
      id={STEP_IDS.MACHINE_POOLS}
      status={statusForStep(STEP_IDS.MACHINE_POOLS)}
      isDisabled={isNavDisabledForStep(STEP_IDS.MACHINE_POOLS)}
    >
      <WizardFieldMetaChangeEffectsCtHarness wizardData={wizardData} />
      <MachinePools vpcList={vpcListProps} machineTypes={machineTypesProps} />
    </WizardStep>
  );

  const networkingStep = includeNetworkingStep ? (
    <WizardStep
      key={STEP_IDS.NETWORKING}
      name={sl.networking}
      id={STEP_IDS.NETWORKING}
      status={statusForStep(STEP_IDS.NETWORKING)}
      isDisabled={isNavDisabledForStep(STEP_IDS.NETWORKING)}
    >
      <Networking vpcList={vpcListProps} subnets={wizardData.subnets} />
    </WizardStep>
  ) : null;

  return (
    <Wizard
      height={720}
      startIndex={startIndex}
      onStepChange={(_event, currentStep) => {
        onWizardStepChange(String(currentStep.id));
      }}
    >
      <WizardStep
        isExpandable
        name={sl.basicSetup}
        id={STEP_IDS.BASIC_SETUP}
        status={statusForStep(STEP_IDS.BASIC_SETUP)}
        isDisabled={isNavDisabledForStep(STEP_IDS.BASIC_SETUP)}
        steps={[machinePoolsStep, ...(networkingStep ? [networkingStep] : [])]}
      />
    </Wizard>
  );
}

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
  const methods = useMachinePoolsCtForm(defaultValues);

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

/** Wizard left nav + Machine pools step for nav status CT tests. */
export const MachinePoolsWizardNavMount: React.FC<MachinePoolsMountProps> = ({
  vpcList,
  machineTypes,
  defaultValues = {},
}) => {
  const methods = useMachinePoolsCtForm(defaultValues);
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
      <RosaHcpWizardValidationProvider
        initialActiveStepId={STEP_IDS.MACHINE_POOLS}
        initialVisitedStepIds={[STEP_IDS.MACHINE_POOLS]}
      >
        <Form>
          <MachinePoolsWizardNavShell
            vpcListProps={vpcListProps}
            machineTypesProps={machineTypesProps}
            wizardData={wizardData}
          />
        </Form>
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
};

/** Wizard left nav with Machine pools + Networking for reset-source forward nav CT tests. */
export const MachinePoolsForwardNavMount: React.FC<MachinePoolsMountProps> = ({
  vpcList,
  machineTypes,
  defaultValues = {},
}) => {
  const methods = useMachinePoolsCtForm(defaultValues);
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
      <RosaHcpWizardValidationProvider
        initialActiveStepId={STEP_IDS.MACHINE_POOLS}
        initialVisitedStepIds={[STEP_IDS.MACHINE_POOLS, STEP_IDS.NETWORKING]}
      >
        <Form>
          <MachinePoolsWizardNavShell
            vpcListProps={vpcListProps}
            machineTypesProps={machineTypesProps}
            wizardData={wizardData}
            includeNetworkingStep
            childStepIdsByParent={machinePoolsForwardNavChildStepIdsByParent}
          />
        </Form>
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
};

/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { DetailsSubStep } from './DetailsSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import type { DetailsSubStepStoryProps } from './DetailsSubStep.fixtures';
import type { RosaWizardFormData } from '../../../../types';
import {
  createMockClusterData,
  mockAwsInfrastructureAccounts,
  mockAwsBillingAccounts,
  mockMachineTypes,
  mockOpenShiftVersionsData,
  mockRegions,
  mockRoles,
} from './DetailsSubStep.fixtures';

export const DetailsSubStepMount: React.FC<DetailsSubStepStoryProps> = ({
  clusterNameValidation = { error: null, isFetching: false },
  checkClusterNameUniqueness,
  versions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  machineTypes,
  roles,
  clusterOverrides = {},
}) => {
  const defaultValues = useMemo(
    () => createMockClusterData(clusterOverrides) as RosaWizardFormData,
    [clusterOverrides]
  );
  const methods = useForm<RosaWizardFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const awsInfraProps = {
    data: awsInfrastructureAccounts?.data ?? mockAwsInfrastructureAccounts,
    isFetching: awsInfrastructureAccounts?.isFetching ?? false,
    fetch: awsInfrastructureAccounts?.fetch ?? (async () => {}),
    error: null,
  };

  const awsBillingProps = {
    data: awsBillingAccounts?.data ?? mockAwsBillingAccounts,
    isFetching: awsBillingAccounts?.isFetching ?? false,
    fetch: awsBillingAccounts?.fetch ?? (async () => {}),
    error: null,
  };

  const regionsProps = {
    data: regions?.data ?? mockRegions,
    isFetching: regions?.isFetching ?? false,
    fetch: regions?.fetch ?? (async () => {}),
    error: null,
  };

  const machineTypesProps = {
    data: machineTypes?.data ?? mockMachineTypes,
    isFetching: machineTypes?.isFetching ?? false,
    fetch: machineTypes?.fetch ?? (async () => {}),
    error: null,
  };

  const versionsProps = {
    data: versions?.data ?? mockOpenShiftVersionsData,
    isFetching: versions?.isFetching ?? false,
    fetch: versions?.fetch ?? (async () => {}),
    error: versions?.error ?? null,
  };

  const rolesProps = {
    data: roles?.data ?? mockRoles,
    isFetching: roles?.isFetching ?? false,
    fetch: roles?.fetch ?? (async (_awsAccount: string) => {}),
    error: null,
  };

  return (
    <RosaWizardStringsProvider>
      <FormProvider {...methods}>
        <DetailsSubStep
          clusterNameValidation={clusterNameValidation}
          checkClusterNameUniqueness={checkClusterNameUniqueness}
          roles={rolesProps}
          versions={versionsProps}
          awsInfrastructureAccounts={awsInfraProps}
          awsBillingAccounts={awsBillingProps}
          regions={regionsProps}
          machineTypes={machineTypesProps}
        />
      </FormProvider>
    </RosaWizardStringsProvider>
  );
};

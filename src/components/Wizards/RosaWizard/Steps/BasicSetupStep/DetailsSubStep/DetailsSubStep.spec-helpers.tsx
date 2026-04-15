/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React from 'react';
import { DetailsSubStep } from './DetailsSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { useAppForm } from '../../../RosaFormContext';
import type { RosaWizardFormData } from '../../../../types';
import type { DetailsSubStepStoryProps } from './DetailsSubStep.fixtures';
import {
  createMockClusterData,
  mockAwsInfrastructureAccounts,
  mockAwsBillingAccounts,
  mockMachineTypes,
  mockOpenShiftVersionsData,
  mockRegions,
  mockRoles,
} from './DetailsSubStep.fixtures';

/** Inner form shell: `useAppForm` with `createMockClusterData` defaults, wrapping children in `AppForm`. */
const DetailsSubStepFormWrapper: React.FC<{
  clusterOverrides?: Record<string, unknown>;
  children: React.ReactNode;
}> = ({ clusterOverrides = {}, children }) => {
  const form = useAppForm({
    defaultValues: createMockClusterData(clusterOverrides) as unknown as RosaWizardFormData,
    onSubmit: async () => {},
  });

  return <form.AppForm>{children}</form.AppForm>;
};

/**
 * Mounts `DetailsSubStep` under wizard strings + mocked resources (defaults from fixtures, overridable).
 * Wires fetchable props with no-op `fetch` and null errors unless the story props supply them.
 */
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
      <DetailsSubStepFormWrapper clusterOverrides={clusterOverrides}>
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
      </DetailsSubStepFormWrapper>
    </RosaWizardStringsProvider>
  );
};

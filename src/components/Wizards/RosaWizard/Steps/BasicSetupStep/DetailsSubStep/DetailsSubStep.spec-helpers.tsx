/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useCallback, useState } from 'react';
import { DetailsSubStep } from './DetailsSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { StepShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/StepShowValidationProvider';
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

export const DetailsSubStepMount: React.FC<DetailsSubStepStoryProps> = ({
  versions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  machineTypes,
  roles,
  clusterOverrides = {},
}) => {
  const [data, setData] = useState(() => createMockClusterData(clusterOverrides));

  const update = useCallback(() => {
    setData((currentData) => ({ ...currentData }));
  }, []);

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
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <StepShowValidationProvider>
              <ShowValidationProvider>
                <ValidationProvider>
                  <DetailsSubStep
                    clusterNameValidation={{ error: null, isFetching: false }}
                    roles={rolesProps}
                    versions={versionsProps}
                    awsInfrastructureAccounts={awsInfraProps}
                    awsBillingAccounts={awsBillingProps}
                    regions={regionsProps}
                    machineTypes={machineTypesProps}
                  />
                </ValidationProvider>
              </ShowValidationProvider>
            </StepShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </RosaWizardStringsProvider>
  );
};

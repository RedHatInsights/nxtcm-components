import React, { useState, useCallback } from 'react';
import { DetailsSubStep } from './DetailsSubStep';
import { TranslationProvider } from '../../../../../../context/TranslationContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { StepShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/StepShowValidationProvider';
import { SelectDropdownType, Resource, Role } from '../../../../types';

export const mockOpenShiftVersions: SelectDropdownType[] = [
  { label: 'OpenShift 4.12.0', value: '4.12.0' },
  { label: 'OpenShift 4.11.5', value: '4.11.5' },
];

export const mockAwsInfrastructureAccounts: SelectDropdownType[] = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

export const mockAwsBillingAccounts: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
  { label: 'Billing Account - Secondary (234567890123)', value: 'billing-secondary-234567890123' },
];

export const mockSingleBillingAccount: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

export const mockRegions: SelectDropdownType[] = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
];

export const mockMachineTypes: SelectDropdownType[] = [
  { label: 'm5.xlarge', value: 'm5.xlarge' },
  { label: 'm5.2xlarge', value: 'm5.2xlarge' },
];

export const mockRoles: Role[] = [
  {
    installerRole: { label: 'Installer Role', value: 'arn:aws:iam::role/installer' },
    supportRole: [{ label: 'Support Role', value: 'arn:aws:iam::role/support' }],
    workerRole: [{ label: 'Worker Role', value: 'arn:aws:iam::role/worker' }],
  },
];

export const createMockClusterData = (overrides: Record<string, unknown> = {}) => ({
  cluster: {
    name: '',
    cluster_version: '',
    associated_aws_id: '',
    billing_account_id: '',
    region: '',
    machine_type: '',
    ...overrides,
  },
});

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

export interface DetailsSubStepStoryProps {
  openShiftVersions?: Resource<SelectDropdownType[]>;
  awsInfrastructureAccounts?: Resource<SelectDropdownType[]>;
  awsBillingAccounts?: Resource<SelectDropdownType[]>;
  regions?: Resource<SelectDropdownType[]>;
  machineTypes?: Resource<SelectDropdownType[]>;
  roles?: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  clusterOverrides?: Record<string, unknown>;
}

export const DetailsSubStepStory: React.FC<DetailsSubStepStoryProps> = ({
  openShiftVersions,
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
    error: null
  };

  const awsBillingProps = {
    data: awsBillingAccounts?.data ?? mockAwsBillingAccounts,
    isFetching: awsBillingAccounts?.isFetching ?? false,
    fetch: awsBillingAccounts?.fetch ?? (async () => {}),
    error: null
  };

  const regionsProps = {
    data: regions?.data ?? mockRegions,
    isFetching: regions?.isFetching ?? false,
    fetch: regions?.fetch ?? (async () => {}),
    error: null
  };

  const machineTypesProps = {
    data: machineTypes?.data ?? mockMachineTypes,
    isFetching: machineTypes?.isFetching ?? false,
    fetch: machineTypes?.fetch ?? (async () => {}),
    error: null
  };

  const openShiftVersionsProps = {
    data: openShiftVersions?.data ?? mockOpenShiftVersions,
    isFetching: openShiftVersions?.isFetching ?? false,
    fetch: openShiftVersions?.fetch ?? (async () => {}),
    error: null
  };

  const rolesProps = {
    data: roles?.data ?? mockRoles,
    isFetching: roles?.isFetching ?? false,
    fetch: roles?.fetch ?? (async (_awsAccount: string) => {}),
    error: null
  };

  return (
    <TranslationProvider>
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <StepShowValidationProvider>
              <ShowValidationProvider>
                <ValidationProvider>
                  <DetailsSubStep
                    clusterNameValidation={{error: null, isFetching: false}}
                    roles={rolesProps}
                    openShiftVersions={openShiftVersionsProps}
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
    </TranslationProvider>
  );
};

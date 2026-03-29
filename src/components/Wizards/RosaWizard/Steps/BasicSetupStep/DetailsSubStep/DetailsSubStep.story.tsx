import React, { useState, useCallback } from 'react';
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
import {
  SelectDropdownType,
  Resource,
  Role,
  MachineTypesDropdownType,
  Region,
  AWSInfrastructureAccounts,
  OpenShiftVersionsData,
  ValidationResource,
} from '../../../../types';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

const mockValidationResource = (): ValidationResource => ({
  error: null,
  isFetching: false,
});

export const mockOpenShiftVersionsData: OpenShiftVersionsData = {
  releases: [
    { label: 'OpenShift 4.16.2', value: '4.16.2' },
    { label: 'OpenShift 4.16.0', value: '4.16.0' },
    { label: 'OpenShift 4.15.8', value: '4.15.8' },
  ],
};

export const mockAwsInfrastructureAccounts: AWSInfrastructureAccounts[] = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

export const mockAwsBillingAccounts: AWSInfrastructureAccounts[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
  { label: 'Billing Account - Secondary (234567890123)', value: 'billing-secondary-234567890123' },
];

export const mockSingleBillingAccount: AWSInfrastructureAccounts[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

export const mockRegions: Region[] = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US East (Ohio)', value: 'us-east-2' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'EU (Ireland)', value: 'eu-west-1' },
];

export const mockMachineTypes: MachineTypesDropdownType[] = [
  { id: '1', label: 'm5.xlarge', value: 'm5.xlarge', description: 'm5.xlarge' },
  { id: '2', label: 'm5.2xlarge', value: 'm5.2xlarge', description: 'm5.2xlarge' },
];

export const mockRoles: Role[] = [
  {
    installerRole: {
      label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
      roleVersion: '4.16.0',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
      },
    ],
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
    installer_role_arn: '',
    worker_role_arn: '',
    support_role_arn: '',
    ...overrides,
  },
});

export interface DetailsSubStepStoryProps {
  clusterNameValidation?: ValidationResource;
  checkClusterNameUniqueness?: (name: string, region?: string) => void;
  versions?: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  awsInfrastructureAccounts?: Resource<AWSInfrastructureAccounts[]>;
  awsBillingAccounts?: Resource<SelectDropdownType[]>;
  regions?: Resource<Region[], [awsAccount: string]> & {
    fetch: (awsAccount?: string) => Promise<void>;
  };
  machineTypes?: Resource<MachineTypesDropdownType[]>;
  roles?: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  clusterOverrides?: Record<string, unknown>;
}

export const DetailsSubStepStory: React.FC<DetailsSubStepStoryProps> = ({
  clusterNameValidation = mockValidationResource(),
  checkClusterNameUniqueness,
  versions,
  awsInfrastructureAccounts = mockResource(mockAwsInfrastructureAccounts),
  awsBillingAccounts = mockResource(mockAwsBillingAccounts),
  regions = mockFetchResource(mockRegions),
  machineTypes = mockFetchResource(mockMachineTypes),
  roles = mockResource(mockRoles),
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
                    clusterNameValidation={clusterNameValidation}
                    checkClusterNameUniqueness={checkClusterNameUniqueness}
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

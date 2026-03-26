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
import { Resource, Role, SelectDropdownType, ValidationResource } from '../../../../types';

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

export const mockOpenShiftVersions: SelectDropdownType[] = [
  { label: 'OpenShift 4.16.2', value: '4.16.2' },
  { label: 'OpenShift 4.16.0', value: '4.16.0' },
  { label: 'OpenShift 4.15.8', value: '4.15.8' },
];

export const mockAwsInfrastructureAccounts: SelectDropdownType[] = [
  { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
  { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
];

export const mockAwsBillingAccounts: SelectDropdownType[] = [
  { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
];

export const mockRegions: SelectDropdownType[] = [
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US West (N. California)', value: 'us-west-1' },
  { label: 'EU (Ireland)', value: 'eu-west-1' },
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
    installer_role_arn: '',
    worker_role_arn: '',
    support_role_arn: '',
    ...overrides,
  },
});

export interface DetailsSubStepStoryProps {
  clusterNameValidation?: ValidationResource;
  checkClusterNameUniqueness?: (name: string, region: string) => void;
  openShiftVersions?: SelectDropdownType[];
  versionsIsPending?: boolean;
  regions?: Resource<SelectDropdownType[]>;
  awsInfrastructureAccounts?: Resource<SelectDropdownType[]>;
  awsBillingAccounts?: Resource<SelectDropdownType[]>;
  clusterOverrides?: Record<string, unknown>;
}

export const DetailsSubStepStory: React.FC<DetailsSubStepStoryProps> = ({
  clusterNameValidation = mockValidationResource(),
  checkClusterNameUniqueness,
  openShiftVersions = mockOpenShiftVersions,
  versionsIsPending = false,
  regions = mockResource(mockRegions),
  awsInfrastructureAccounts = mockResource(mockAwsInfrastructureAccounts),
  awsBillingAccounts = mockResource(mockAwsBillingAccounts),
  clusterOverrides = {},
}) => {
  const [data, setData] = useState(() => createMockClusterData(clusterOverrides));

  const update = useCallback(() => {
    setData((currentData) => ({ ...currentData }));
  }, []);

  return (
    <RosaWizardStringsProvider>
      <DataContext.Provider value={{ update }}>
        <DisplayModeContext.Provider value={DisplayMode.Step}>
          <ItemContext.Provider value={data}>
            <ShowValidationProvider>
              <ValidationProvider>
                <DetailsSubStep
                  clusterNameValidation={clusterNameValidation}
                  checkClusterNameUniqueness={checkClusterNameUniqueness}
                  openShiftVersions={openShiftVersions}
                  versionsIsPending={versionsIsPending}
                  roles={mockFetchResource<Role[], [awsAccount: string]>(mockRoles)}
                  awsInfrastructureAccounts={awsInfrastructureAccounts}
                  awsBillingAccounts={awsBillingAccounts}
                  regions={regions}
                />
              </ValidationProvider>
            </ShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </RosaWizardStringsProvider>
  );
};

import React, { useState, useCallback } from 'react';
import { RolesAndPoliciesSubStep } from './RolesAndPoliciesSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayModeContext,
  DisplayMode,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { OIDCConfig, Resource, Role, SelectDropdownType } from '../../../../types';

export const mockInstallerRoles: SelectDropdownType[] = [
  {
    label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
    value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
  },
  {
    label: 'arn:aws:iam::123456789012:role/Custom-Installer-Role',
    value: 'arn:aws:iam::123456789012:role/Custom-Installer-Role',
  },
];

export const mockSupportRoles: SelectDropdownType[] = [
  {
    label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
    value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role',
  },
];

export const mockWorkerRoles: SelectDropdownType[] = [
  {
    label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
    value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role',
  },
];

export const mockOIDCConfig: OIDCConfig[] = [
  {
    label: 'oidc-config-123',
    value: 'oidc-config-123',
    issuer_url: 'https://oidc.example.com/123',
  },
];

export const createMockClusterData = (overrides: Record<string, unknown> = {}) => ({
  cluster: {
    name: 'my-rosa-cluster',
    associated_aws_id: '123456789012',
    installer_role_arn: '',
    support_role_arn: '',
    worker_role_arn: '',
    byo_oidc_config_id: '',
    custom_operator_roles_prefix: '',
    ...overrides,
  },
});

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

export interface RolesAndPoliciesSubStepStoryProps {
  roles?: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig?: Resource<OIDCConfig[]>;
  clusterOverrides?: Record<string, unknown>;
}

export const RolesAndPoliciesSubStepStory: React.FC<RolesAndPoliciesSubStepStoryProps> = ({
  roles = mockFetchResource<Role[], [awsAccount: string]>([
    {
      installerRole: mockInstallerRoles[0],
      supportRole: mockSupportRoles,
      workerRole: mockWorkerRoles,
    },
  ]),
  oidcConfig = mockResource(mockOIDCConfig),
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
                <RolesAndPoliciesSubStep roles={roles} oidcConfig={oidcConfig} />
              </ValidationProvider>
            </ShowValidationProvider>
          </ItemContext.Provider>
        </DisplayModeContext.Provider>
      </DataContext.Provider>
    </RosaWizardStringsProvider>
  );
};

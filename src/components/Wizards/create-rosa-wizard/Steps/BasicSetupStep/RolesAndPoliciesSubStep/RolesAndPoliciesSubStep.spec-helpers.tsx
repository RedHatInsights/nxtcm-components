import React, { useCallback, useState } from 'react';
import { DataContext } from '@patternfly-labs/react-form-wizard/contexts/DataContext';
import {
  DisplayMode,
  DisplayModeContext,
} from '@patternfly-labs/react-form-wizard/contexts/DisplayModeContext';
import { ItemContext } from '@patternfly-labs/react-form-wizard/contexts/ItemContext';
import { ShowValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import { ValidationProvider } from '@patternfly-labs/react-form-wizard/contexts/ValidationProvider';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { OIDCConfig, Resource, Role } from '../../../../types';
import { RolesAndPoliciesSubStep } from './RolesAndPoliciesSubStep';
import {
  createMockClusterData,
  mockInstallerRoles,
  mockOIDCConfig,
  mockSupportRoles,
  mockWorkerRoles,
} from './RolesAndPoliciesSubStep.story';

type Props = {
  roles?: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig?: Resource<OIDCConfig[]>;
  clusterOverrides?: Record<string, unknown>;
};

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

export const RolesAndPoliciesSubStepMount = ({
  roles = mockFetchResource<Role[], [awsAccount: string]>([
    {
      installerRole: mockInstallerRoles[0],
      supportRole: mockSupportRoles,
      workerRole: mockWorkerRoles,
    },
  ]),
  oidcConfig = mockResource(mockOIDCConfig),
  clusterOverrides = {},
}: Props) => {
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

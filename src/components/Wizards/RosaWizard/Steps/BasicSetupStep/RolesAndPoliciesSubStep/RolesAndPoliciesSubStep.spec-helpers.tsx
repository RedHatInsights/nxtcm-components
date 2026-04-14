import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { OIDCConfig, Resource, Role, type RosaWizardFormData } from '../../../../types';
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
  const defaultValues = useMemo(
    () => createMockClusterData(clusterOverrides) as RosaWizardFormData,
    [clusterOverrides]
  );
  const methods = useForm<RosaWizardFormData>({
    defaultValues,
    mode: 'onChange',
  });

  return (
    <RosaWizardStringsProvider>
      <FormProvider {...methods}>
        <RolesAndPoliciesSubStep roles={roles} oidcConfig={oidcConfig} />
      </FormProvider>
    </RosaWizardStringsProvider>
  );
};

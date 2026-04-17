import React from 'react';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { useAppForm } from '../../../RosaFormContext';
import { OIDCConfig, Resource, Role } from '../../../../types';
import type { RosaWizardFormData } from '../../../../types';
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

/** Static `Resource` with noop `fetch` for OIDC config and similar CT props. */
const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

/** `Resource` whose `fetch` is a no-op, used for roles lists keyed by AWS account in CT. */
const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

/** Provides `AppForm` + `useAppForm` defaults from `createMockClusterData` for roles substep tests. */
const RolesFormWrapper: React.FC<{
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
 * Mounts `RolesAndPoliciesSubStep` with wizard strings and story fixtures for roles/OIDC resources.
 * Defaults mirror `RolesAndPoliciesSubStep.story` data; override `roles`, `oidcConfig`, or cluster values.
 */
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
}: Props) => (
  <RosaWizardStringsProvider>
    <RolesFormWrapper clusterOverrides={clusterOverrides}>
      <RolesAndPoliciesSubStep roles={roles} oidcConfig={oidcConfig} />
    </RolesFormWrapper>
  </RosaWizardStringsProvider>
);

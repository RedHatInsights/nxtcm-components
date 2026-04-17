import React from 'react';
import { RolesAndPoliciesSubStep } from './RolesAndPoliciesSubStep';
import { RosaWizardStringsProvider } from '../../../RosaWizardStringsContext';
import { useAppForm } from '../../../RosaFormContext';
import { OIDCConfig, Resource, Role, SelectDropdownType } from '../../../../types';
import type { RosaWizardFormData } from '../../../../types';

/**
 * Roles and Policies substep with shared mock roles, OIDC config, and a form wrapper for Storybook or CT usage.
 */

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
 * Renders installer, support, worker, and OIDC fields with mock resources and overridable cluster defaults.
 */
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
}) => (
  <RosaWizardStringsProvider>
    <RolesFormWrapper clusterOverrides={clusterOverrides}>
      <RolesAndPoliciesSubStep roles={roles} oidcConfig={oidcConfig} />
    </RolesFormWrapper>
  </RosaWizardStringsProvider>
);

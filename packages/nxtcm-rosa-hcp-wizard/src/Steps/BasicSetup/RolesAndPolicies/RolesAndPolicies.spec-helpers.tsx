/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';

import { Form } from '@patternfly/react-core';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';

import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import fixtures from '../../../ROSAHCPWizard.fixtures';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  makeDefaultRosaHcpCtWizardData,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type OidcConfigResource,
  type RolesResource,
  type ROSAHCPCluster,
  type SelectedSecret,
} from '../../../types';
import { createClusterValidationResolver } from '../../../utilities/clusterValidationResolver';
import { RolesAndPolicies } from './RolesAndPolicies';

/** Defaults aligned with {@link ROSAHCPWizardBody} so the composed Yup schema resolves consistently in CT. */
const DEFAULT_ROSA_HCP_CT_FORM_VALUES: Partial<ROSAHCPCluster> = {
  associated_aws_id: '',
  byo_oidc_config_id: '',
  custom_operator_roles_prefix: '',
  encryption_keys: ClusterEncryptionKeys.default,
  etcd_encryption: false,
  configure_proxy: false,
  cidr_default: true,
  network_machine_cidr: '10.0.0.0/16',
  network_service_cidr: '172.30.0.0/16',
  network_pod_cidr: '10.128.0.0/14',
  network_host_prefix: '/23',
  autoscaling: false,
  nodes_compute: 2,
  upgrade_policy: ClusterUpgrade.manual,
  cluster_privacy: ClusterNetwork.external,
  compute_root_volume: 300,
  billing_account_id: '',
  region: '',
  name: '',
  cluster_version: '',
  installer_role_arn: '',
  support_role_arn: '',
  worker_role_arn: '',
};

export type RolesAndPoliciesMountProps = {
  roles?: Partial<RolesResource>;
  oidcConfig?: Partial<OidcConfigResource>;
  defaultValues?: Partial<ROSAHCPCluster>;
  product?: 'acm' | 'ocm' | 'oem';
  selectedSecret?: SelectedSecret;
};

export const RolesAndPoliciesMount: React.FC<RolesAndPoliciesMountProps> = ({
  roles,
  oidcConfig,
  defaultValues = {},
  product,
  selectedSecret,
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: resolver as Resolver<ROSAHCPCluster>,
    mode: 'onTouched',
  });

  const rolesProps = useMemo<RolesResource>(
    () => ({
      data: roles?.data ?? fixtures.mockRoles,
      isFetching: roles?.isFetching ?? false,
      fetch: roles?.fetch ?? (async (_awsAccount: string) => {}),
      error: roles?.error ?? null,
      ocmRoleError: roles?.ocmRoleError ?? null,
      userRoleError: roles?.userRoleError ?? null,
      ocmRoleARN: roles?.ocmRoleARN ?? null,
    }),
    [roles]
  );

  const oidcProps = useMemo<OidcConfigResource>(
    () => ({
      data: oidcConfig?.data ?? fixtures.mockOicdConfig,
      isFetching: oidcConfig?.isFetching ?? false,
      fetch: oidcConfig?.fetch ?? (async () => {}),
      error: oidcConfig?.error ?? null,
    }),
    [oidcConfig]
  );

  const wizardData = useMemo(
    () =>
      makeDefaultRosaHcpCtWizardData({
        roles: rolesProps,
        oidcConfig: oidcProps,
      }),
    [oidcProps, rolesProps]
  );

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizardFieldMetaChangeEffectsCtHarness wizardData={wizardData} />
        <RolesAndPolicies
          roles={rolesProps}
          oidcConfig={oidcProps}
          product={product}
          selectedSecret={selectedSecret}
        />
      </Form>
    </FormProvider>
  );
};

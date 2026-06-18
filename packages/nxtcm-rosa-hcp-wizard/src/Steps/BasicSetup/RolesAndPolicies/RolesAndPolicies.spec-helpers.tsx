/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type OidcConfigResource,
  type ROSAHCPCluster,
  type RolesResource,
} from '../../../types';
import { RolesAndPolicies } from './RolesAndPolicies';
import fixtures from '../../../ROSAHCPWizard.fixtures';
import { clusterValidationSchema } from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import {
  WizardFieldMetaChangeEffectsCtHarness,
  makeDefaultRosaHcpCtWizardData,
} from '../../../test/rosaHcpWizardCtSpecHelpers';

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
};

export const RolesAndPoliciesMount: React.FC<RolesAndPoliciesMountProps> = ({
  roles,
  oidcConfig,
  defaultValues = {},
}) => {
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    }),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ROSAHCPCluster>,
    context: validationContext,
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
        <RolesAndPolicies roles={rolesProps} oidcConfig={oidcProps} />
      </Form>
    </FormProvider>
  );
};

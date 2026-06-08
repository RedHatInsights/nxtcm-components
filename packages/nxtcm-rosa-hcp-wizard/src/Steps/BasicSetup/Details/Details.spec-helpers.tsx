/**
 * Playwright CT mount target. Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form';

import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type ROSAHCPCluster,
} from '../../../types';
import { Details } from './Details';
import {
  mockAwsBillingAccounts,
  mockAwsInfrastructureAccounts,
  mockOpenShiftVersionsData,
  mockRegions,
  mockRoles,
} from './Details.fixtures';
import { clusterValidationSchema } from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { makeVpcListResource } from '../../../rosaHcpWizardCtSpecHelpers';
import type {
  AwsBillingAccountsResource,
  AwsInfrastructureAccountsResource,
  RegionsResource,
  RolesResource,
  VersionsResource,
  VpcListResource,
} from '../../../types';

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

export type DetailsMountProps = {
  versions?: VersionsResource;
  awsInfrastructureAccounts?: AwsInfrastructureAccountsResource;
  awsBillingAccounts?: AwsBillingAccountsResource;
  regions?: RegionsResource;
  roles?: RolesResource;
  vpcList?: VpcListResource;
  defaultValues?: Partial<ROSAHCPCluster>;
  checkClusterNameUniqueness?: ValidationSchemaContext['checkClusterNameUniqueness'];
};

/** Hidden probe for Playwright CT assertions on cross-step form fields. */
const DetailsFormValuesProbe: React.FC = () => {
  const selectedVpc = useWatch({ name: 'selected_vpc' });
  return (
    <span data-testid="ct-selected-vpc" hidden aria-hidden>
      {typeof selectedVpc === 'string' ? selectedVpc : (selectedVpc?.id ?? '')}
    </span>
  );
};

export const DetailsMount: React.FC<DetailsMountProps> = ({
  versions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  roles,
  vpcList,
  defaultValues = {},
  checkClusterNameUniqueness,
}) => {
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
      checkClusterNameUniqueness,
    }),
    [checkClusterNameUniqueness]
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ROSAHCPCluster>,
    context: validationContext,
    mode: 'onTouched',
  });

  const awsInfra: AwsInfrastructureAccountsResource = {
    data: awsInfrastructureAccounts?.data ?? mockAwsInfrastructureAccounts,
    isFetching: awsInfrastructureAccounts?.isFetching ?? false,
    fetch: awsInfrastructureAccounts?.fetch ?? (async () => {}),
    error: awsInfrastructureAccounts?.error ?? null,
  };

  const awsBilling: AwsBillingAccountsResource = {
    data: awsBillingAccounts?.data ?? mockAwsBillingAccounts,
    isFetching: awsBillingAccounts?.isFetching ?? false,
    fetch: awsBillingAccounts?.fetch ?? (async () => {}),
    error: awsBillingAccounts?.error ?? null,
  };

  const regionsProps: RegionsResource = {
    data: regions?.data ?? mockRegions,
    isFetching: regions?.isFetching ?? false,
    fetch: regions?.fetch ?? (async (_awsAccount: string) => {}),
    error: regions?.error ?? null,
  };

  const versionsProps: VersionsResource = {
    data: versions?.data ?? mockOpenShiftVersionsData,
    isFetching: versions?.isFetching ?? false,
    fetch: versions?.fetch ?? (async () => {}),
    error: versions?.error ?? null,
  };

  const rolesProps: RolesResource = {
    data: roles?.data ?? mockRoles,
    isFetching: roles?.isFetching ?? false,
    fetch: roles?.fetch ?? (async (_awsAccount: string) => {}),
    error: roles?.error ?? null,
  };

  const vpcListProps = makeVpcListResource(vpcList);

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <Details
          awsInfrastructureAccounts={awsInfra}
          awsBillingAccounts={awsBilling}
          regions={regionsProps}
          versions={versionsProps}
          roles={rolesProps}
          vpcList={vpcListProps}
        />
        <DetailsFormValuesProbe />
      </Form>
    </FormProvider>
  );
};

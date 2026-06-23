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
import type { CheckClusterNameUniqueness } from '../../../types';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { RosaHcpWizardValidationProvider } from '../../../rosaHcpWizardValidationContext';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import {
  makeDefaultRosaHcpCtWizardData,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsRunner,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
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
  roles?: Partial<RolesResource>;
  vpcList?: VpcListResource;
  defaultValues?: Partial<ROSAHCPCluster>;
  checkClusterNameUniqueness?: CheckClusterNameUniqueness;
  /**
   * CT-only: when set, DetailsMount wires a stable async check that returns this value.
   * Prefer over inline JSX callbacks — Playwright CT may not forward callback return values.
   */
  clusterNameUniquenessError?: string | null;
  /** CT-only: invoked when the resolved uniqueness check runs (for call-count assertions). */
  onClusterNameUniquenessCheck?: (name: string, region?: string) => void;
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
  clusterNameUniquenessError,
  onClusterNameUniquenessCheck,
}) => {
  const resolvedCheckClusterNameUniqueness = useMemo((): CheckClusterNameUniqueness | undefined => {
    if (checkClusterNameUniqueness) {
      return async (name, region) => {
        onClusterNameUniquenessCheck?.(name, region);
        return checkClusterNameUniqueness(name, region);
      };
    }

    if (clusterNameUniquenessError !== undefined) {
      return (name, region) => {
        onClusterNameUniquenessCheck?.(name, region);
        return Promise.resolve(clusterNameUniquenessError);
      };
    }

    return undefined;
  }, [checkClusterNameUniqueness, clusterNameUniquenessError, onClusterNameUniquenessCheck]);

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ROSAHCPCluster>,
    context: {
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    },
    mode: 'onTouched',
  });

  const awsInfra = useMemo<AwsInfrastructureAccountsResource>(
    () => ({
      data: awsInfrastructureAccounts?.data ?? mockAwsInfrastructureAccounts,
      isFetching: awsInfrastructureAccounts?.isFetching ?? false,
      fetch: awsInfrastructureAccounts?.fetch ?? (async () => {}),
      error: awsInfrastructureAccounts?.error ?? null,
    }),
    [awsInfrastructureAccounts]
  );

  const awsBilling = useMemo<AwsBillingAccountsResource>(
    () => ({
      data: awsBillingAccounts?.data ?? mockAwsBillingAccounts,
      isFetching: awsBillingAccounts?.isFetching ?? false,
      fetch: awsBillingAccounts?.fetch ?? (async () => {}),
      error: awsBillingAccounts?.error ?? null,
    }),
    [awsBillingAccounts]
  );

  const regionsProps = useMemo<RegionsResource>(
    () => ({
      data: regions?.data ?? mockRegions,
      isFetching: regions?.isFetching ?? false,
      fetch: regions?.fetch ?? (async (_awsAccount: string) => {}),
      error: regions?.error ?? null,
    }),
    [regions]
  );

  const versionsProps = useMemo<VersionsResource>(
    () => ({
      data: versions?.data ?? mockOpenShiftVersionsData,
      isFetching: versions?.isFetching ?? false,
      fetch: versions?.fetch ?? (async () => {}),
      error: versions?.error ?? null,
    }),
    [versions]
  );

  const rolesProps = useMemo<RolesResource>(
    () => ({
      data: roles?.data ?? mockRoles,
      isFetching: roles?.isFetching ?? false,
      fetch: roles?.fetch ?? (async (_awsAccount: string) => {}),
      error: roles?.error ?? null,
      ocmRoleError: roles?.ocmRoleError ?? null,
      userRoleError: roles?.userRoleError ?? null,
      ocmRoleARN: roles?.ocmRoleARN ?? null,
    }),
    [roles]
  );

  const vpcListProps = useMemo(() => makeVpcListResource(vpcList), [vpcList]);

  const wizardData = useMemo(
    () =>
      makeDefaultRosaHcpCtWizardData({
        awsInfrastructureAccounts: awsInfra,
        awsBillingAccounts: awsBilling,
        regions: regionsProps,
        versions: versionsProps,
        roles: rolesProps,
        vpcList: vpcListProps,
      }),
    [awsBilling, awsInfra, regionsProps, rolesProps, versionsProps, vpcListProps]
  );

  return withRosaCt(
    <RosaHcpWizardValidationProvider>
      <FormProvider {...methods}>
        <Form>
          <WizardFieldMetaChangeEffectsRunner wizardData={wizardData} />
          <Details
            awsInfrastructureAccounts={awsInfra}
            awsBillingAccounts={awsBilling}
            regions={regionsProps}
            versions={versionsProps}
            roles={rolesProps}
            checkClusterNameUniqueness={resolvedCheckClusterNameUniqueness}
          />
          <DetailsFormValuesProbe />
        </Form>
      </FormProvider>
    </RosaHcpWizardValidationProvider>
  );
};

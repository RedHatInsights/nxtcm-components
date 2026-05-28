/**
 * Playwright CT mount target for Networking step.
 * Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '@/components/Wizards/types';
import { Networking } from './Networking';
import { mockSubnets, mockVpcList } from './Networking.fixtures';
import { clusterValidationSchema } from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import type { SubnetsResource, VpcListResource } from '../../../types';

/** Defaults aligned with {@link ROSAHCPWizardBody} so the composed Yup schema resolves consistently in CT. */
const DEFAULT_ROSA_HCP_CT_FORM_VALUES: Partial<ClusterFormData> = {
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

export type NetworkingMountProps = {
  vpcList?: VpcListResource;
  subnets?: SubnetsResource;
  defaultValues?: Partial<ClusterFormData>;
};

export const NetworkingMount: React.FC<NetworkingMountProps> = ({
  vpcList,
  subnets,
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

  const methods = useForm<ClusterFormData>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ClusterFormData>,
    context: validationContext,
    mode: 'onTouched',
  });

  const vpcListProps: VpcListResource = {
    data: vpcList?.data ?? mockVpcList,
    isFetching: vpcList?.isFetching ?? false,
    fetch: vpcList?.fetch ?? (async () => {}),
    error: vpcList?.error ?? null,
  };

  const subnetsProps: SubnetsResource = {
    data: subnets?.data ?? mockSubnets,
    isFetching: subnets?.isFetching ?? false,
    fetch: subnets?.fetch ?? (async () => {}),
    error: subnets?.error ?? null,
  };

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <Networking vpcList={vpcListProps} subnets={subnetsProps} />
      </Form>
    </FormProvider>
  );
};

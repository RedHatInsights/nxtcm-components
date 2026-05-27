import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '@/components/Wizards/types';

import { clusterValidationSchema } from '../../../yupSchemas';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { ClusterUpdates } from './ClusterUpdates';

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
  cluster_version: '4.16.2',
  installer_role_arn: '',
  support_role_arn: '',
  worker_role_arn: '',
};

export type ClusterUpdatesMountProps = {
  defaultValues?: Partial<ClusterFormData>;
};

export const ClusterUpdatesMount: React.FC<ClusterUpdatesMountProps> = ({ defaultValues = {} }) => {
  const methods = useForm<ClusterFormData>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ClusterFormData>,
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <ClusterUpdates />
      </Form>
    </FormProvider>
  );
};

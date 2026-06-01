import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver, useFormContext } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '@/components/Wizards/types';

import { STEP_IDS } from '../../../constants';
import { clusterValidationSchema } from '../../../yupSchemas';
import type { ValidationSchemaContext } from '../../../yupSchemas/types';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaHcpWizardValidationProvider,
  useRosaHcpWizardValidation,
} from '../../../rosaHcpWizardValidationContext';
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
  upgrade_policy: ClusterUpgrade.automatic,
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

function ClusterUpdatesValidateButton() {
  const { trigger } = useFormContext<ClusterFormData>();
  const { markValidationAttempted } = useRosaHcpWizardValidation();

  return (
    <Button
      type="button"
      onClick={() => {
        markValidationAttempted(STEP_IDS.CLUSTER_UPDATES);
        void trigger(['upgrade_policy', 'upgrade_schedule']);
      }}
    >
      Validate
    </Button>
  );
}

export const ClusterUpdatesMount: React.FC<ClusterUpdatesMountProps> = ({ defaultValues = {} }) => {
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

  return withRosaCt(
    <RosaHcpWizardValidationProvider>
      <FormProvider {...methods}>
        <Form>
          <ClusterUpdates />
          <ClusterUpdatesValidateButton />
        </Form>
      </FormProvider>
    </RosaHcpWizardValidationProvider>
  );
};

import React, { useMemo } from 'react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, type Resolver, useForm, useFormContext } from 'react-hook-form';
import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type ROSAHCPCluster,
} from '../../../types';
import { STEP_IDS } from '../../../constants';
import { createClusterValidationResolver } from '../../../utilities/clusterValidationResolver';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaHcpWizardValidationProvider,
  useRosaHcpWizardValidation,
} from '../../../rosaHcpWizardValidationContext';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { ClusterUpdates } from './ClusterUpdates';

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
  defaultValues?: Partial<ROSAHCPCluster>;
};

function ClusterUpdatesValidateButton() {
  const { trigger } = useFormContext<ROSAHCPCluster>();
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
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: resolver as Resolver<ROSAHCPCluster>,
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

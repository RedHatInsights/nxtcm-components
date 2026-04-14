import { klona } from 'klona/json';
import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type RosaWizardFormData,
} from '../types';

/** Deep-cloned defaults aligned with the former `WizardPage` `defaultData` prop. */
export function createDefaultRosaWizardFormValues(): RosaWizardFormData {
  return klona({
    cluster: {
      associated_aws_id: '',
      billing_account_id: undefined,
      byo_oidc_config_id: '',
      custom_operator_roles_prefix: '',
      name: undefined,
      cluster_version: undefined,
      region: undefined,
      installer_role_arn: undefined,
      support_role_arn: undefined,
      worker_role_arn: undefined,
      machine_pools_subnets: undefined,
      security_groups_worker: [],
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
    },
  });
}

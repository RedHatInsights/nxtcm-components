import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade, ROSAHCPCluster } from './types';

export function getDefaultRosaHcpWizardFormValues(): Partial<ROSAHCPCluster> {
  return {
    name: '',
    cluster_version: '',
    associated_aws_id: '',
    billing_account_id: '',
    region: '',
    installer_role_arn: '',
    support_role_arn: '',
    worker_role_arn: '',
    byo_oidc_config_id: '',
    custom_operator_roles_prefix: '',
    machine_pools_subnets: [],
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
  };
}

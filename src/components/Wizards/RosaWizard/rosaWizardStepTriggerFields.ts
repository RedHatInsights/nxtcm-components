import type { FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../types';

/** Field paths validated when leaving a step (PatternFly wizard sub-step id → RHF paths). */
export const ROSA_WIZARD_STEP_TRIGGER_FIELDS: Record<string, FieldPath<RosaWizardFormData>[]> = {
  'basic-setup-step-details': [
    'cluster.associated_aws_id',
    'cluster.billing_account_id',
    'cluster.name',
    'cluster.cluster_version',
    'cluster.region',
  ],
  'roles-and-policies-sub-step': [
    'cluster.installer_role_arn',
    'cluster.support_role_arn',
    'cluster.worker_role_arn',
    'cluster.byo_oidc_config_id',
    'cluster.custom_operator_roles_prefix',
  ],
  'machinepools-sub-step': [
    'cluster.selected_vpc',
    'cluster.machine_pools_subnets',
    'cluster.machine_type',
    'cluster.autoscaling',
    'cluster.nodes_compute',
    'cluster.min_replicas',
    'cluster.max_replicas',
    'cluster.compute_root_volume',
    'cluster.imds',
  ],
  'networking-sub-step': [
    'cluster.cluster_privacy',
    'cluster.cluster_privacy_public_subnet_id',
    'cluster.configure_proxy',
    'cluster.cidr_default',
    'cluster.network_machine_cidr',
    'cluster.network_service_cidr',
    'cluster.network_pod_cidr',
    'cluster.network_host_prefix',
  ],
  'additional-setup-cluster-wide-proxy': [
    'cluster.http_proxy_url',
    'cluster.https_proxy_url',
    'cluster.no_proxy_domains',
    'cluster.additional_trust_bundle',
  ],
  'additional-setup-encryption': [
    'cluster.encryption_keys',
    'cluster.kms_key_arn',
    'cluster.etcd_encryption',
    'cluster.etcd_key_arn',
  ],
  'additional-setup-cluster-updates': ['cluster.upgrade_policy', 'cluster.upgrade_schedule'],
};

export function getTriggerFieldsForStepId(stepId: string): FieldPath<RosaWizardFormData>[] | undefined {
  return ROSA_WIZARD_STEP_TRIGGER_FIELDS[stepId];
}

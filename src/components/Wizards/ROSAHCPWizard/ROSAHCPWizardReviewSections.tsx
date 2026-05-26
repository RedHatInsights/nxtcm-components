/**
 * Review-step sections: PatternFly step ids, labels, and form field paths for the Review step.
 * Step ids align with PatternFly `WizardStep` ids in {@link STEP_IDS}.
 */

import { useMemo } from 'react';

import { STEP_IDS } from './constants';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';

export interface RosaHcpWizardReviewSection {
  /** PatternFly `WizardStep` id (e.g. `expand-steps-sub-a`) */
  id: string;
  label: string;
  /** When true, omit the review section if every listed field matches defaults */
  hideIfUnchanged?: boolean;
  fieldPaths: string[];
}

export const useRosaHcpWizardReviewSections = (): RosaHcpWizardReviewSection[] => {
  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard } = rosaStrings;
  const stepLabels = wizard.stepLabels;

  return useMemo(
    () => [
      {
        id: STEP_IDS.DETAILS,
        label: stepLabels.details,
        fieldPaths: [
          'name',
          'cluster_version',
          'associated_aws_id',
          'billing_account_id',
          'region',
        ],
      },
      {
        id: STEP_IDS.ROLES_AND_POLICIES,
        label: stepLabels.rolesAndPolicies,
        fieldPaths: [
          'installer_role_arn',
          'support_role_arn',
          'worker_role_arn',
          'byo_oidc_config_id',
          'custom_operator_roles_prefix',
        ],
      },
      {
        id: STEP_IDS.MACHINE_POOLS,
        label: stepLabels.machinePools,
        fieldPaths: [
          'selected_vpc',
          'machine_pools_subnets',
          'machine_type',
          'autoscaling',
          'nodes_compute',
          'min_replicas',
          'max_replicas',
          'compute_root_volume',
          'imds',
          'security_groups_worker',
        ],
      },
      {
        id: STEP_IDS.NETWORKING,
        label: stepLabels.networking,
        fieldPaths: [
          'cluster_privacy',
          'cluster_privacy_public_subnet_id',
          'cidr_default',
          'network_machine_cidr',
          'network_service_cidr',
          'network_pod_cidr',
          'network_host_prefix',
        ],
      },
      {
        id: STEP_IDS.CLUSTER_WIDE_PROXY,
        label: stepLabels.clusterWideProxy,
        hideIfUnchanged: true,
        fieldPaths: [
          'http_proxy_url',
          'https_proxy_url',
          'no_proxy_domains',
          'additional_trust_bundle',
        ],
      },
      {
        id: STEP_IDS.ENCRYPTION,
        label: stepLabels.encryptionOptional,
        fieldPaths: ['encryption_keys', 'kms_key_arn', 'etcd_encryption', 'etcd_key_arn'],
      },
      {
        id: STEP_IDS.CLUSTER_UPDATES,
        label: stepLabels.clusterUpdatesOptional,
        fieldPaths: ['upgrade_policy', 'upgrade_schedule'],
      },
    ],
    [
      stepLabels.details,
      stepLabels.rolesAndPolicies,
      stepLabels.machinePools,
      stepLabels.networking,
      stepLabels.clusterWideProxy,
      stepLabels.encryptionOptional,
      stepLabels.clusterUpdatesOptional,
    ]
  );
};

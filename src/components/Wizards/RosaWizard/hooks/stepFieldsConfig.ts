import * as yup from 'yup';

import { rosaWizardSchema } from '../rosaWizardSchema';
import type { RosaWizardFormData } from '../../types';

/**
 * Stable PatternFly Wizard step IDs used for navigation and
 * the step-to-fields validation mapping.
 */
export const STEP_IDS = {
  BASIC_SETUP: 'basic-setup-step-id-expandable-section',
  DETAILS: 'basic-setup-step-details',
  ROLES_AND_POLICIES: 'roles-and-policies-sub-step',
  MACHINE_POOLS: 'machinepools-sub-step',
  NETWORKING: 'networking-sub-step',
  ADDITIONAL_SETUP: 'additional-setup-step-id-expandable-section',
  CLUSTER_WIDE_PROXY: 'additional-setup-cluster-wide-proxy',
  ENCRYPTION: 'additional-setup-encryption',
  CLUSTER_UPDATES: 'additional-setup-cluster-updates',
  REVIEW: 'review-step',
} as const;

/** Maps each wizard substep ID to the form field paths that belong to it. */
export const STEP_FIELDS: Readonly<Record<string, readonly string[]>> = {
  [STEP_IDS.DETAILS]: [
    'cluster.name',
    'cluster.cluster_version',
    'cluster.associated_aws_id',
    'cluster.billing_account_id',
    'cluster.region',
  ],
  [STEP_IDS.ROLES_AND_POLICIES]: [
    'cluster.installer_role_arn',
    'cluster.support_role_arn',
    'cluster.worker_role_arn',
    'cluster.byo_oidc_config_id',
    'cluster.custom_operator_roles_prefix',
  ],
  [STEP_IDS.MACHINE_POOLS]: [
    'cluster.selected_vpc',
    'cluster.machine_pools_subnets',
    'cluster.machine_type',
    'cluster.autoscaling',
    'cluster.nodes_compute',
    'cluster.min_replicas',
    'cluster.max_replicas',
    'cluster.compute_root_volume',
    'cluster.security_groups_worker',
    'cluster.imds',
  ],
  [STEP_IDS.NETWORKING]: [
    'cluster.cluster_privacy',
    'cluster.cluster_privacy_public_subnet_id',
    'cluster.cidr_default',
    'cluster.network_machine_cidr',
    'cluster.network_service_cidr',
    'cluster.network_pod_cidr',
    'cluster.network_host_prefix',
    'cluster.configure_proxy',
  ],
  [STEP_IDS.CLUSTER_WIDE_PROXY]: [
    'cluster.http_proxy_url',
    'cluster.https_proxy_url',
    'cluster.no_proxy_domains',
    'cluster.additional_trust_bundle',
  ],
  [STEP_IDS.ENCRYPTION]: [
    'cluster.encryption_keys',
    'cluster.kms_key_arn',
    'cluster.etcd_encryption',
    'cluster.etcd_key_arn',
  ],
  [STEP_IDS.CLUSTER_UPDATES]: [
    'cluster.upgrade_policy',
    'cluster.upgrade_schedule',
  ],
};

/** Reverse map: field path → step ID. */
const FIELD_TO_STEP = new Map<string, string>();
for (const [stepId, fields] of Object.entries(STEP_FIELDS)) {
  for (const field of fields) {
    FIELD_TO_STEP.set(field, stepId);
  }
}

/** Parent (expandable) step → child substep IDs. */
export const PARENT_STEP_CHILDREN: Readonly<Record<string, readonly string[]>> = {
  [STEP_IDS.BASIC_SETUP]: [
    STEP_IDS.DETAILS,
    STEP_IDS.ROLES_AND_POLICIES,
    STEP_IDS.MACHINE_POOLS,
    STEP_IDS.NETWORKING,
    STEP_IDS.CLUSTER_WIDE_PROXY,
  ],
  [STEP_IDS.ADDITIONAL_SETUP]: [
    STEP_IDS.ENCRYPTION,
    STEP_IDS.CLUSTER_UPDATES,
  ],
};

export type FieldMetaLike = Partial<Record<string, { errors?: unknown[]; isTouched?: boolean }>>;

/**
 * Returns true when at least one **touched** field in the given step
 * carries validation errors. Untouched fields are ignored so that
 * errors only surface after user interaction or an explicit "Next" click.
 */
export function stepHasErrors(fieldMeta: FieldMetaLike, stepId: string): boolean {
  const fields = STEP_FIELDS[stepId];
  if (!fields) return false;
  return fields.some((f) => {
    const meta = fieldMeta[f];
    return meta?.isTouched && meta?.errors != null && (meta.errors as unknown[]).length > 0;
  });
}

/**
 * Runs the full Yup schema against form values and returns the set of
 * step IDs whose fields have validation errors.
 */
export function computeStepErrorsFromYup(values: RosaWizardFormData): Set<string> {
  const result = new Set<string>();
  try {
    rosaWizardSchema.validateSync(values, { abortEarly: false });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      for (const inner of err.inner) {
        if (!inner.path) continue;
        const stepId = FIELD_TO_STEP.get(inner.path);
        if (stepId) result.add(stepId);
      }
    }
  }
  return result;
}

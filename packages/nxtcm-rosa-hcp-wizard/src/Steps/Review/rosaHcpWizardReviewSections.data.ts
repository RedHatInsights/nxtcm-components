/**
 * Review-step sections and per-step field paths (no React). Shared by Review and Next validation.
 * Field paths are derived from Yup `.meta({ stepId })` via {@link getFieldPathsByStepId}
 * in {@link wizardFieldMetaChangeRegistry}.
 *
 * Named `.data.ts` so imports of `ROSAHCPWizardReviewSections` resolve to the React hook module
 * on case-insensitive filesystems (macOS).
 */

import { STEP_IDS } from '../../constants';
import { getFieldPathsByStepId } from '../../yupSchemas/wizardFieldMetaChangeRegistry';

export interface RosaHcpWizardReviewSection {
  /** PatternFly `WizardStep` id (e.g. `expand-steps-sub-a`) */
  id: string;
  label: string;
  /** When true, omit the review section if every listed field matches defaults */
  hideIfUnchanged?: boolean;
  fieldPaths: readonly string[];
}

export type RosaHcpWizardReviewStepLabels = {
  details: string;
  rolesAndPolicies: string;
  machinePools: string;
  networking: string;
  clusterWideProxy: string;
  encryptionOptional: string;
  clusterUpdatesOptional: string;
};

export function buildRosaHcpWizardReviewSections(
  stepLabels: RosaHcpWizardReviewStepLabels
): RosaHcpWizardReviewSection[] {
  const fieldPathsByStepId = getFieldPathsByStepId();

  return [
    {
      id: STEP_IDS.DETAILS,
      label: stepLabels.details,
      fieldPaths: fieldPathsByStepId[STEP_IDS.DETAILS] ?? [],
    },
    {
      id: STEP_IDS.ROLES_AND_POLICIES,
      label: stepLabels.rolesAndPolicies,
      fieldPaths: fieldPathsByStepId[STEP_IDS.ROLES_AND_POLICIES] ?? [],
    },
    {
      id: STEP_IDS.MACHINE_POOLS,
      label: stepLabels.machinePools,
      fieldPaths: fieldPathsByStepId[STEP_IDS.MACHINE_POOLS] ?? [],
    },
    {
      id: STEP_IDS.NETWORKING,
      label: stepLabels.networking,
      fieldPaths: fieldPathsByStepId[STEP_IDS.NETWORKING] ?? [],
    },
    {
      id: STEP_IDS.CLUSTER_WIDE_PROXY,
      label: stepLabels.clusterWideProxy,
      hideIfUnchanged: true,
      fieldPaths: fieldPathsByStepId[STEP_IDS.CLUSTER_WIDE_PROXY] ?? [],
    },
    {
      id: STEP_IDS.ENCRYPTION,
      label: stepLabels.encryptionOptional,
      fieldPaths: fieldPathsByStepId[STEP_IDS.ENCRYPTION] ?? [],
    },
    {
      id: STEP_IDS.CLUSTER_UPDATES,
      label: stepLabels.clusterUpdatesOptional,
      fieldPaths: fieldPathsByStepId[STEP_IDS.CLUSTER_UPDATES] ?? [],
    },
  ];
}

/** Field paths for a wizard step, used when validating on Next. */
export function getFieldPathsForWizardStepId(
  sections: readonly RosaHcpWizardReviewSection[],
  stepId: string
): readonly string[] {
  return sections.find((section) => section.id === stepId)?.fieldPaths ?? [];
}

/**
 * Review-step sections and per-step field paths (no React). Shared by Review and Next validation.
 * Leaf step ids and review metadata come from {@link buildRosaHcpWizardStepLayout}; field paths
 * come from Yup `.meta({ stepId })` via {@link getFieldPathsByStepId}.
 *
 * Named `.data.ts` so imports of `ROSAHCPWizardReviewSections` resolve to the React hook module
 * on case-insensitive filesystems (macOS).
 */

import { buildRosaHcpWizardStepLayout } from '../../rosaHcpWizardStepLayout';
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

export type BuildRosaHcpWizardReviewSectionsOptions = {
  includeClusterWideProxy?: boolean;
};

export function buildRosaHcpWizardReviewSections(
  stepLabels: RosaHcpWizardReviewStepLabels,
  options: BuildRosaHcpWizardReviewSectionsOptions = {}
): RosaHcpWizardReviewSection[] {
  const fieldPathsByStepId = getFieldPathsByStepId();
  const { leafSteps } = buildRosaHcpWizardStepLayout({
    includeClusterWideProxy: options.includeClusterWideProxy ?? true,
  });

  return leafSteps.map((step) => ({
    id: step.id,
    label: stepLabels[step.labelKey],
    ...(step.hideInReviewIfUnchanged ? { hideIfUnchanged: true } : {}),
    fieldPaths: fieldPathsByStepId[step.id] ?? [],
  }));
}

/** Field paths for a wizard step, used when validating on Next. */
export function getFieldPathsForWizardStepId(
  sections: readonly RosaHcpWizardReviewSection[],
  stepId: string
): readonly string[] {
  return sections.find((section) => section.id === stepId)?.fieldPaths ?? [];
}

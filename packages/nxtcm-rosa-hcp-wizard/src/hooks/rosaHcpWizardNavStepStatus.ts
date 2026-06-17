import type { FieldPath, FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { wizFieldShowsError } from '../components/WizFields/wizFieldRhf';
import { STEP_IDS } from '../constants';
import type { RosaHcpWizardReviewSection } from '../Steps/Review/rosaHcpWizardReviewSections.data';

export type RosaHcpWizardNavStepStatus = 'default' | 'error';

const BASIC_SETUP_CHILD_STEP_IDS = [
  STEP_IDS.DETAILS,
  STEP_IDS.ROLES_AND_POLICIES,
  STEP_IDS.MACHINE_POOLS,
  STEP_IDS.NETWORKING,
  STEP_IDS.CLUSTER_WIDE_PROXY,
] as const;

const ADDITIONAL_SETUP_CHILD_STEP_IDS = [STEP_IDS.ENCRYPTION, STEP_IDS.CLUSTER_UPDATES] as const;

/** Wizard steps that participate in nav status (cluster-wide proxy only when enabled). */
export function buildVisibleWizardStepIds(includeClusterWideProxy: boolean): ReadonlySet<string> {
  const basicSetupStepIds = BASIC_SETUP_CHILD_STEP_IDS.filter(
    (id) => includeClusterWideProxy || id !== STEP_IDS.CLUSTER_WIDE_PROXY
  );

  return new Set([...basicSetupStepIds, ...ADDITIONAL_SETUP_CHILD_STEP_IDS]);
}

/** True when any field on the step shows a validation error in the form UI. */
export function stepHasVisibleValidationErrors<TFieldValues extends FieldValues>(
  fieldPaths: readonly string[],
  stepId: string,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  validationAttemptedStepIds: ReadonlySet<string>
): boolean {
  const validationRevealed = validationAttemptedStepIds.has(stepId);

  return fieldPaths.some((path) => {
    const fieldPath = path as FieldPath<TFieldValues>;
    const { invalid, isTouched } = getFieldState(fieldPath);
    return wizFieldShowsError(invalid, isTouched, validationRevealed);
  });
}

function parentStepHasChildErrors(
  childStepIds: readonly string[],
  statuses: Readonly<Record<string, RosaHcpWizardNavStepStatus>>
): RosaHcpWizardNavStepStatus {
  return childStepIds.some((id) => statuses[id] === 'error') ? 'error' : 'default';
}

/** Maps wizard step ids to PatternFly nav status for visible validation errors. */
export function buildRosaHcpWizardNavStepStatuses<TFieldValues extends FieldValues>(params: {
  sections: readonly RosaHcpWizardReviewSection[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  validationAttemptedStepIds: ReadonlySet<string>;
  visibleStepIds: ReadonlySet<string>;
}): Record<string, RosaHcpWizardNavStepStatus> {
  const { sections, getFieldState, validationAttemptedStepIds, visibleStepIds } = params;
  const statuses: Record<string, RosaHcpWizardNavStepStatus> = {};

  for (const section of sections) {
    if (!visibleStepIds.has(section.id)) {
      continue;
    }

    statuses[section.id] = stepHasVisibleValidationErrors(
      section.fieldPaths,
      section.id,
      getFieldState,
      validationAttemptedStepIds
    )
      ? 'error'
      : 'default';
  }

  const basicSetupChildren = BASIC_SETUP_CHILD_STEP_IDS.filter((id) => visibleStepIds.has(id));
  statuses[STEP_IDS.BASIC_SETUP] = parentStepHasChildErrors(basicSetupChildren, statuses);
  statuses[STEP_IDS.OPTIONAL_SETUP] = parentStepHasChildErrors(
    ADDITIONAL_SETUP_CHILD_STEP_IDS,
    statuses
  );

  return statuses;
}

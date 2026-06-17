import type { FieldPath, FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { wizFieldShowsError } from '../components/WizFields/wizFieldRhf';
import { STEP_IDS } from '../constants';
import type { RosaHcpWizardReviewSection } from '../Steps/Review/rosaHcpWizardReviewSections.data';

export type RosaHcpWizardNavStepStatus = 'default' | 'error';

const OPTIONAL_SETUP_CHILD_STEP_IDS = new Set<string>([
  STEP_IDS.ENCRYPTION,
  STEP_IDS.CLUSTER_UPDATES,
]);

function visibleLeafStepIdsFromSections(
  sections: readonly RosaHcpWizardReviewSection[],
  includeClusterWideProxy: boolean
): readonly string[] {
  return sections
    .map((section) => section.id)
    .filter((id) => includeClusterWideProxy || id !== STEP_IDS.CLUSTER_WIDE_PROXY);
}

function groupChildStepIdsFromSections(
  sections: readonly RosaHcpWizardReviewSection[],
  visibleStepIds: ReadonlySet<string>,
  group: 'basic' | 'optional'
): readonly string[] {
  return sections
    .map((section) => section.id)
    .filter((id) => {
      if (!visibleStepIds.has(id)) {
        return false;
      }
      const isOptional = OPTIONAL_SETUP_CHILD_STEP_IDS.has(id);
      return group === 'optional' ? isOptional : !isOptional;
    });
}

/** Linear nav order for leaf wizard steps (cluster-wide proxy only when enabled). */
export function buildOrderedWizardNavStepIds(
  sections: readonly RosaHcpWizardReviewSection[],
  includeClusterWideProxy: boolean
): readonly string[] {
  return [...visibleLeafStepIdsFromSections(sections, includeClusterWideProxy), STEP_IDS.REVIEW];
}

/** Wizard steps that participate in nav status (cluster-wide proxy only when enabled). */
export function buildVisibleWizardStepIds(
  sections: readonly RosaHcpWizardReviewSection[],
  includeClusterWideProxy: boolean
): ReadonlySet<string> {
  return new Set(
    buildOrderedWizardNavStepIds(sections, includeClusterWideProxy).filter(
      (id) => id !== STEP_IDS.REVIEW
    )
  );
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

  statuses[STEP_IDS.BASIC_SETUP] = parentStepHasChildErrors(
    groupChildStepIdsFromSections(sections, visibleStepIds, 'basic'),
    statuses
  );
  statuses[STEP_IDS.OPTIONAL_SETUP] = parentStepHasChildErrors(
    groupChildStepIdsFromSections(sections, visibleStepIds, 'optional'),
    statuses
  );

  return statuses;
}

/** Index of the earliest ordered step with a visible validation error, if any. */
export function findFirstWizardNavStepIndexWithVisibleErrors<
  TFieldValues extends FieldValues,
>(params: {
  orderedStepIds: readonly string[];
  sections: readonly RosaHcpWizardReviewSection[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  validationAttemptedStepIds: ReadonlySet<string>;
}): number | undefined {
  const { orderedStepIds, sections, getFieldState, validationAttemptedStepIds } = params;

  for (const [index, stepId] of orderedStepIds.entries()) {
    const section = sections.find((entry) => entry.id === stepId);
    if (
      section &&
      stepHasVisibleValidationErrors(
        section.fieldPaths,
        section.id,
        getFieldState,
        validationAttemptedStepIds
      )
    ) {
      return index;
    }
  }

  return undefined;
}

/** PatternFly `isDisabled` for leaf nav steps blocked by a visible validation error upstream. */
export function buildRosaHcpWizardNavStepDisabledByValidation<
  TFieldValues extends FieldValues,
>(params: {
  orderedStepIds: readonly string[];
  sections: readonly RosaHcpWizardReviewSection[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  validationAttemptedStepIds: ReadonlySet<string>;
}): Readonly<Record<string, boolean>> {
  const firstErrorIndex = findFirstWizardNavStepIndexWithVisibleErrors(params);
  const disabled: Record<string, boolean> = {};

  for (const [index, stepId] of params.orderedStepIds.entries()) {
    disabled[stepId] = firstErrorIndex !== undefined && index > firstErrorIndex;
  }

  return disabled;
}

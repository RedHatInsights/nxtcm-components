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

/** True when any field on the step has async validation in progress. */
export function stepHasPendingAsyncValidation<TFieldValues extends FieldValues>(
  fieldPaths: readonly string[],
  getFieldState: UseFormGetFieldState<TFieldValues>
): boolean {
  return fieldPaths.some((path) => {
    const fieldPath = path as FieldPath<TFieldValues>;
    return getFieldState(fieldPath).isValidating;
  });
}

/** True when a step has in-flight async validation tracked by RHF or wizard validation context. */
export function stepHasAsyncValidationInProgress<TFieldValues extends FieldValues>(
  stepId: string,
  fieldPaths: readonly string[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  asyncValidatingStepIds?: ReadonlySet<string>
): boolean {
  if (asyncValidatingStepIds?.has(stepId)) {
    return true;
  }

  return stepHasPendingAsyncValidation(fieldPaths, getFieldState);
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

/** Index of the active step when it has async validation in progress, if any. */
export function findActiveWizardNavStepIndexWithPendingValidation<
  TFieldValues extends FieldValues,
>(params: {
  orderedStepIds: readonly string[];
  sections: readonly RosaHcpWizardReviewSection[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  activeStepId?: string;
  asyncValidatingStepIds?: ReadonlySet<string>;
}): number | undefined {
  const { orderedStepIds, sections, getFieldState, activeStepId, asyncValidatingStepIds } = params;
  if (activeStepId === undefined) {
    return undefined;
  }

  const activeIndex = orderedStepIds.indexOf(activeStepId);
  if (activeIndex < 0) {
    return undefined;
  }

  const section = sections.find((entry) => entry.id === activeStepId);
  if (
    section &&
    stepHasAsyncValidationInProgress(
      activeStepId,
      section.fieldPaths,
      getFieldState,
      asyncValidatingStepIds
    )
  ) {
    return activeIndex;
  }

  return undefined;
}

function earliestWizardNavStepIndex(
  ...indices: readonly (number | undefined)[]
): number | undefined {
  const defined = indices.filter((index): index is number => index !== undefined);
  return defined.length > 0 ? Math.min(...defined) : undefined;
}

/** PatternFly `isDisabled` for leaf nav steps blocked by validation upstream or on the active step. */
export function buildRosaHcpWizardNavStepDisabledByValidation<
  TFieldValues extends FieldValues,
>(params: {
  orderedStepIds: readonly string[];
  sections: readonly RosaHcpWizardReviewSection[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  validationAttemptedStepIds: ReadonlySet<string>;
  activeStepId?: string;
  asyncValidatingStepIds?: ReadonlySet<string>;
}): Readonly<Record<string, boolean>> {
  const firstBlockingIndex = earliestWizardNavStepIndex(
    findFirstWizardNavStepIndexWithVisibleErrors(params),
    findActiveWizardNavStepIndexWithPendingValidation(params)
  );
  const disabled: Record<string, boolean> = {};

  for (const [index, stepId] of params.orderedStepIds.entries()) {
    disabled[stepId] = firstBlockingIndex !== undefined && index > firstBlockingIndex;
  }

  return disabled;
}

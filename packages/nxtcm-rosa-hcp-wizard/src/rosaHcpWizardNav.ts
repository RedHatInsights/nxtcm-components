import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormGetFieldState,
  UseFormGetValues,
} from 'react-hook-form';
import type * as yup from 'yup';

import { wizardFormFieldValuesEqual } from './fieldMetaChangeEffects/wizardFormFieldValuesEqual';
import { isYupFieldRequired, type YupFieldDescribeOptions } from './utilities/yupFieldRequired';

import { STEP_IDS } from './constants';
import { buildRosaHcpWizardStepLayout } from './rosaHcpWizardStepLayout';
import { pathsHaveValidationIssues } from './Footer/rosaHcpWizardFooter.utils';
import {
  ROSA_HCP_ASYNC_VALIDATED_FIELD_PATHS,
  ROSA_HCP_NAV_RESET_SOURCE_FIELDS,
} from './rosaHcpWizardNavDependencies';

export type RosaHcpWizardNavReviewSection = {
  id: string;
  fieldPaths: readonly string[];
};

/** Leaf wizard steps in nav order (excludes expandable parent steps). */
export function buildOrderedNavigableStepIds(includeClusterWideProxy: boolean): readonly string[] {
  return buildRosaHcpWizardStepLayout({ includeClusterWideProxy }).orderedNavigableStepIds;
}

/** Next leaf step id after `activeStepId`, used by the footer Next control. */
export function getNextOrderedStepId(
  activeStepId: string,
  orderedStepIds: readonly string[]
): string | undefined {
  const activeIdx = stepOrderIndex(activeStepId, orderedStepIds);
  if (activeIdx === -1 || activeIdx >= orderedStepIds.length - 1) {
    return undefined;
  }
  return orderedStepIds[activeIdx + 1];
}

function stepOrderIndex(stepId: string, orderedStepIds: readonly string[]): number {
  return orderedStepIds.indexOf(stepId);
}

function isEmptyFormValue(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

function formValuesEqual(left: unknown, right: unknown): boolean {
  return wizardFormFieldValuesEqual(left, right);
}

/** Snapshot active-step field values when entering a step. */
export function captureRosaHcpStepFieldValueBaseline<TFieldValues extends FieldValues>(
  activeStepFieldPaths: readonly string[],
  getValues: UseFormGetValues<TFieldValues>
): Record<string, unknown> {
  const baseline: Record<string, unknown> = {};

  for (const path of activeStepFieldPaths) {
    baseline[path] = getValues(path as FieldPath<TFieldValues>);
  }

  return baseline;
}

/** True when the user edited this field on the active step since entry. */
export function isRosaHcpWizardFieldEngagedSinceStepEntry<TFieldValues extends FieldValues>(
  path: string,
  getValues: UseFormGetValues<TFieldValues>,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  baselineValues: Readonly<Record<string, unknown>> | undefined
): boolean {
  if (baselineValues === undefined) {
    return false;
  }

  const fieldPath = path as FieldPath<TFieldValues>;
  if (formValuesEqual(getValues(fieldPath), baselineValues[path])) {
    return false;
  }

  const fieldState = getFieldState(fieldPath);
  return fieldState.isDirty || fieldState.isTouched;
}

/** True when the user changed a reset-source field on the active step since entry. */
export function rosaHcpWizardResetSourceValuesChanged<TFieldValues extends FieldValues>(
  activeStepFieldPaths: readonly string[],
  getValues: UseFormGetValues<TFieldValues>,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  baselineValues: Readonly<Record<string, unknown>> | undefined,
  latchedResetSourceFields?: ReadonlySet<string>
): boolean {
  const activePaths = new Set(activeStepFieldPaths);
  return ROSA_HCP_NAV_RESET_SOURCE_FIELDS.some((path) => {
    if (!activePaths.has(path)) {
      return false;
    }
    if (latchedResetSourceFields?.has(path)) {
      return true;
    }
    return isRosaHcpWizardFieldEngagedSinceStepEntry(
      path,
      getValues,
      getFieldState,
      baselineValues
    );
  });
}

/** Records reset-source fields the user has edited this visit; stays latched if the value is reverted. */
export function latchEngagedRosaHcpResetSourceFields<TFieldValues extends FieldValues>(
  activeStepFieldPaths: readonly string[],
  getValues: UseFormGetValues<TFieldValues>,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  baselineValues: Readonly<Record<string, unknown>> | undefined,
  latchedResetSourceFields: Set<string>
): void {
  const activePaths = new Set(activeStepFieldPaths);
  for (const path of ROSA_HCP_NAV_RESET_SOURCE_FIELDS) {
    if (!activePaths.has(path)) {
      continue;
    }
    if (isRosaHcpWizardFieldEngagedSinceStepEntry(path, getValues, getFieldState, baselineValues)) {
      latchedResetSourceFields.add(path);
    }
  }
}

/** True when async field validation is running on a field the user engaged since step entry. */
export function rosaHcpWizardAsyncValidationInProgress<TFieldValues extends FieldValues>(
  activeStepFieldPaths: readonly string[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  getValues: UseFormGetValues<TFieldValues>,
  baselineValues: Readonly<Record<string, unknown>> | undefined,
  asyncValidatingFieldPaths?: ReadonlySet<string>
): boolean {
  const activePaths = new Set(activeStepFieldPaths);
  return ROSA_HCP_ASYNC_VALIDATED_FIELD_PATHS.some((path) => {
    if (!activePaths.has(path)) {
      return false;
    }
    if (
      !isRosaHcpWizardFieldEngagedSinceStepEntry(path, getValues, getFieldState, baselineValues)
    ) {
      return false;
    }
    return (
      getFieldState(path as FieldPath<TFieldValues>).isValidating ||
      asyncValidatingFieldPaths?.has(path) === true
    );
  });
}

/** Invalid or empty required values on fields the user engaged since step entry. */
export function rosaHcpWizardActiveStepHasValidationIssues<TFieldValues extends FieldValues>(
  activeStepFieldPaths: readonly string[],
  getValues: UseFormGetValues<TFieldValues>,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  schema: yup.AnyObjectSchema,
  describeOptions: YupFieldDescribeOptions | undefined,
  baselineValues: Readonly<Record<string, unknown>> | undefined
): boolean {
  const engagedFieldPaths = activeStepFieldPaths.filter((path) =>
    isRosaHcpWizardFieldEngagedSinceStepEntry(path, getValues, getFieldState, baselineValues)
  );

  if (engagedFieldPaths.length === 0) {
    return false;
  }

  if (
    pathsHaveValidationIssues(engagedFieldPaths, getFieldState, errors, {
      ignoreResolverErrors: true,
    })
  ) {
    return true;
  }

  return engagedFieldPaths.some((path) => {
    if (!isYupFieldRequired(schema, path, describeOptions)) {
      return false;
    }
    return isEmptyFormValue(getValues(path as FieldPath<TFieldValues>));
  });
}

export function rosaHcpWizardBlockForwardNavigation<TFieldValues extends FieldValues>(params: {
  activeStepFieldPaths: readonly string[];
  getValues: UseFormGetValues<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  schema: yup.AnyObjectSchema;
  describeOptions?: YupFieldDescribeOptions;
  stepDependencyBaseline?: Readonly<Record<string, unknown>>;
  latchedResetSourceFields?: ReadonlySet<string>;
  asyncValidatingFieldPaths?: ReadonlySet<string>;
}): boolean {
  const {
    activeStepFieldPaths,
    getValues,
    getFieldState,
    errors,
    schema,
    describeOptions,
    stepDependencyBaseline,
    latchedResetSourceFields,
    asyncValidatingFieldPaths,
  } = params;

  return (
    rosaHcpWizardResetSourceValuesChanged(
      activeStepFieldPaths,
      getValues,
      getFieldState,
      stepDependencyBaseline,
      latchedResetSourceFields
    ) ||
    rosaHcpWizardActiveStepHasValidationIssues(
      activeStepFieldPaths,
      getValues,
      getFieldState,
      errors,
      schema,
      describeOptions,
      stepDependencyBaseline
    ) ||
    rosaHcpWizardAsyncValidationInProgress(
      activeStepFieldPaths,
      getFieldState,
      getValues,
      stepDependencyBaseline,
      asyncValidatingFieldPaths
    )
  );
}

/** Removes leaf steps after `activeStepId` from the visited set (parent step ids are kept). */
export function trimVisitedStepIdsAfter(
  visitedStepIds: ReadonlySet<string>,
  activeStepId: string,
  orderedStepIds: readonly string[]
): Set<string> {
  const activeIdx = stepOrderIndex(activeStepId, orderedStepIds);
  if (activeIdx === -1) {
    return new Set(visitedStepIds);
  }

  const next = new Set<string>();
  for (const stepId of visitedStepIds) {
    const stepIdx = stepOrderIndex(stepId, orderedStepIds);
    if (stepIdx === -1 || stepIdx <= activeIdx) {
      next.add(stepId);
    }
  }
  next.add(activeStepId);
  return next;
}

/** Index in `orderedStepIds` of the earliest step with a validation error, or -1 when none. */
export function findEarliestOrderedStepIndexWithValidationIssues<
  TFieldValues extends FieldValues,
>(params: {
  reviewSections: readonly RosaHcpWizardNavReviewSection[];
  orderedStepIds: readonly string[];
  getFieldState: UseFormGetFieldState<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
}): number {
  const { reviewSections, orderedStepIds, getFieldState, errors } = params;

  for (let index = 0; index < orderedStepIds.length; index++) {
    const stepId = orderedStepIds[index];
    const fieldPaths = reviewSections.find((section) => section.id === stepId)?.fieldPaths ?? [];
    if (fieldPaths.length === 0) {
      continue;
    }
    if (pathsHaveValidationIssues(fieldPaths, getFieldState, errors)) {
      return index;
    }
  }

  return -1;
}

export function isRosaHcpWizardNavStepDisabled(params: {
  targetStepId: string;
  activeStepId: string;
  visitedStepIds: ReadonlySet<string>;
  blockForwardNavigation: boolean;
  orderedStepIds: readonly string[];
  earliestInvalidStepIdx?: number;
  childStepIdsByParent?: Readonly<Record<string, readonly string[] | undefined>>;
}): boolean {
  const {
    targetStepId,
    activeStepId,
    visitedStepIds,
    blockForwardNavigation,
    orderedStepIds,
    earliestInvalidStepIdx = -1,
    childStepIdsByParent,
  } = params;

  if (targetStepId === STEP_IDS.BASIC_SETUP) {
    return false;
  }

  if (targetStepId === STEP_IDS.OPTIONAL_SETUP) {
    const childStepIds = childStepIdsByParent?.[STEP_IDS.OPTIONAL_SETUP] ?? [];
    if (childStepIds.length === 0) {
      return true;
    }
    return childStepIds.every((childId) =>
      isRosaHcpWizardNavStepDisabled({
        targetStepId: childId,
        activeStepId,
        visitedStepIds,
        blockForwardNavigation,
        orderedStepIds,
        earliestInvalidStepIdx,
      })
    );
  }

  const activeIdx = stepOrderIndex(activeStepId, orderedStepIds);
  const targetIdx = stepOrderIndex(targetStepId, orderedStepIds);

  if (activeIdx === -1 || targetIdx === -1) {
    return false;
  }

  if (targetIdx < activeIdx) {
    return false;
  }

  if (targetIdx === activeIdx) {
    return false;
  }

  if (earliestInvalidStepIdx !== -1 && targetIdx > earliestInvalidStepIdx) {
    return true;
  }

  if (!visitedStepIds.has(targetStepId)) {
    return true;
  }

  return blockForwardNavigation;
}

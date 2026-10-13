import type { FieldErrors, FieldValues, Path, UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import { getNestedValue } from '../utilities/helpers';

function hasErrorAtPath<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  path: Path<TFieldValues>
): boolean {
  const current = getNestedValue(errors, path);
  if (current === null || current === undefined) {
    return false;
  }
  if (typeof current === 'object' && 'message' in current) {
    return current.message !== undefined;
  }
  return true;
}

export type PathsHaveValidationIssuesOptions = {
  /**
   * When true, only {@link getFieldState} is consulted. Use after a successful `trigger()` inside
   * async reconcile — the `errors` snapshot from the render that started the effect can be stale.
   */
  ignoreResolverErrors?: boolean;
};

/**
 * Whether any listed path has a validation problem (fieldState and/or resolver errors).
 * Prefer this over {@link getFieldState} alone — `invalid` can lag after `trigger()` in onTouched forms.
 */
export function pathsHaveValidationIssues<TFieldValues extends FieldValues>(
  fieldPaths: readonly Path<TFieldValues>[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  options?: PathsHaveValidationIssuesOptions
): boolean {
  return fieldPaths.some((path) => {
    if (getFieldState(path).invalid) {
      return true;
    }
    if (options?.ignoreResolverErrors) {
      return false;
    }
    return hasErrorAtPath(errors, path);
  });
}

/** Steps under Additional setup that show Skip to review in the footer. */
const ROSA_HCP_SKIP_TO_REVIEW_STEP_IDS: readonly string[] = [
  STEP_IDS.ENCRYPTION,
  STEP_IDS.CLUSTER_UPDATES,
];

/** Whether the wizard Back control should be disabled for the active step. */
export function isRosaHcpWizardBackDisabled(stepId: string): boolean {
  return stepId === STEP_IDS.DETAILS;
}

/** Whether Skip to review should appear in the footer for the active step. */
export function isRosaHcpWizardSkipToReviewVisible(stepId: string): boolean {
  return ROSA_HCP_SKIP_TO_REVIEW_STEP_IDS.includes(stepId);
}

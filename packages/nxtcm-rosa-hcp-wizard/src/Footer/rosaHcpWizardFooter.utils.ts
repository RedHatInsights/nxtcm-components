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

const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]';

/** Focus is a no-op on controls inside a collapsed section, so they cannot be the target. */
function canReceiveFocus(element: HTMLElement): boolean {
  if (element.closest('[hidden], [inert]')) {
    return false;
  }
  return typeof element.checkVisibility !== 'function' || element.checkVisibility();
}

/**
 * First visible control in document order flagged `aria-invalid="true"`, or its first visible
 * focusable descendant when the flag sits on a wrapper. Used to move focus to the first error
 * after a failed Next. Invalid controls in collapsed sections are skipped.
 */
export function findFirstInvalidFocusTarget(container: ParentNode): HTMLElement | null {
  for (const invalid of Array.from(
    container.querySelectorAll<HTMLElement>('[aria-invalid="true"]')
  )) {
    const candidates = invalid.matches(FOCUSABLE_SELECTOR)
      ? [invalid]
      : Array.from(invalid.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const target = candidates.find(canReceiveFocus);
    if (target) {
      return target;
    }
  }
  return null;
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

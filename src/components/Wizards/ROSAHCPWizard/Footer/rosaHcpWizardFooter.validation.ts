import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';

import type { RosaHcpWizardReviewSection } from '../Steps/Review/rosaHcpWizardReviewSections.data';
import { pathsHaveValidationIssues } from './rosaHcpWizardFooter.utils';

export type WizardFieldValidationOutcome = 'valid' | 'invalid' | 'stale';

/** Touches invalid fields so errors show under onTouched validation. */
export function touchInvalidPaths<TFieldValues extends FieldValues>(
  fieldPaths: readonly string[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  getValues: UseFormGetValues<TFieldValues>,
  setValue: UseFormSetValue<TFieldValues>
): void {
  for (const path of fieldPaths) {
    const fieldPath = path as FieldPath<TFieldValues>;
    if (!getFieldState(fieldPath).invalid) {
      continue;
    }
    setValue(fieldPath, getValues(fieldPath), {
      shouldTouch: true,
      shouldValidate: false,
    });
  }
}

/** Marks each review section (and optionally the review step) that still has invalid fields. */
export function markSectionsWithValidationErrors<TFieldValues extends FieldValues>(
  sections: readonly RosaHcpWizardReviewSection[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  markValidationAttempted: (stepId: string) => void,
  options?: { alsoMarkStepId?: string }
): void {
  for (const section of sections) {
    if (pathsHaveValidationIssues(section.fieldPaths, getFieldState, errors)) {
      markValidationAttempted(section.id);
    }
  }
  if (options?.alsoMarkStepId !== undefined) {
    markValidationAttempted(options.alsoMarkStepId);
  }
}

/** Runs trigger for the active step or entire form; returns stale if the user changed steps mid-flight. */
export async function validateWizardStepFields<TFieldValues extends FieldValues>(params: {
  stepIdWhenStarted: string;
  getCurrentStepId: () => string;
  fieldPaths: readonly string[];
  trigger: UseFormTrigger<TFieldValues>;
  validateAllFields?: boolean;
}): Promise<WizardFieldValidationOutcome> {
  const { stepIdWhenStarted, getCurrentStepId, fieldPaths, trigger, validateAllFields } = params;

  if (!validateAllFields && fieldPaths.length === 0) {
    return 'valid';
  }

  const isValid = validateAllFields
    ? await trigger()
    : await trigger(fieldPaths as FieldPath<TFieldValues>[], { shouldFocus: false });

  if (getCurrentStepId() !== stepIdWhenStarted) {
    return 'stale';
  }

  return isValid ? 'valid' : 'invalid';
}

function stepPathsAreValid<TFieldValues extends FieldValues>(
  fieldPaths: readonly string[],
  getFieldState: UseFormGetFieldState<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  options?: { ignoreResolverErrors?: boolean }
): boolean {
  return !pathsHaveValidationIssues(fieldPaths, getFieldState, errors, options);
}

/**
 * After a failed Next/Submit, re-triggers validation when values change and clears attempted flags
 * for steps/sections that become valid.
 */
export async function reconcileValidationAttemptedFlags<TFieldValues extends FieldValues>(params: {
  isReviewStep: boolean;
  stepIdAtStart: string;
  getCurrentStepId: () => string;
  stepFieldPaths: readonly string[];
  reviewSections: readonly RosaHcpWizardReviewSection[];
  trigger: UseFormTrigger<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  clearValidationAttempted: (stepId: string) => void;
}): Promise<boolean> {
  const {
    isReviewStep,
    stepIdAtStart,
    getCurrentStepId,
    stepFieldPaths,
    reviewSections,
    trigger,
    getFieldState,
    errors,
    clearValidationAttempted,
  } = params;

  if (getCurrentStepId() !== stepIdAtStart) {
    return false;
  }

  const triggerPassed = isReviewStep
    ? await trigger()
    : stepFieldPaths.length > 0
      ? await trigger(stepFieldPaths as FieldPath<TFieldValues>[], { shouldFocus: false })
      : false;

  if (getCurrentStepId() !== stepIdAtStart) {
    return false;
  }

  if (isReviewStep) {
    if (triggerPassed) {
      clearValidationAttempted(stepIdAtStart);
      for (const section of reviewSections) {
        if (section.fieldPaths.length > 0) {
          clearValidationAttempted(section.id);
        }
      }
      return true;
    }

    let activeStepBecameValid = false;
    const allPaths = reviewSections.flatMap((section) => section.fieldPaths);
    if (stepPathsAreValid(allPaths, getFieldState, errors)) {
      clearValidationAttempted(stepIdAtStart);
      activeStepBecameValid = true;
    }
    for (const section of reviewSections) {
      const sectionPaths = section.fieldPaths;
      if (sectionPaths.length === 0) {
        continue;
      }
      if (stepPathsAreValid(sectionPaths, getFieldState, errors)) {
        clearValidationAttempted(section.id);
      }
    }
    return activeStepBecameValid;
  }

  if (triggerPassed) {
    clearValidationAttempted(stepIdAtStart);
    return true;
  }

  if (stepPathsAreValid(stepFieldPaths, getFieldState, errors)) {
    clearValidationAttempted(stepIdAtStart);
    return true;
  }

  return false;
}

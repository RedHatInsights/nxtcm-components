import type { FieldErrors, FieldValues, UseFormGetFieldState } from 'react-hook-form';

import type { ROSAHCPCluster } from './types';
import {
  pathsHaveRevealedValidationIssues,
  type PathsHaveRevealedValidationIssuesOptions,
} from './Footer/rosaHcpWizardFooter.utils';
import { shouldHideReviewRow } from './Steps/Review/shouldHideReviewRow';
import { wizardFieldMetaByPath } from './yupSchemas';

import type { RosaHcpWizardChildStepIdsByParent } from './rosaHcpWizardStepLayout';

export type { RosaHcpWizardChildStepIdsByParent } from './rosaHcpWizardStepLayout';

export type RosaHcpWizardStepFieldPathsSource = Readonly<
  Array<{ id: string; fieldPaths: readonly string[] }>
>;

/** Whether a field participates in step nav validation for the current form state. */
export function isWizardFieldActiveForStepValidation(
  path: string,
  formValues: Partial<ROSAHCPCluster>
): boolean {
  return !shouldHideReviewRow({
    path,
    formValues,
    metaShouldHideInReview: wizardFieldMetaByPath(path)?.hideInReview ?? false,
  });
}

function stepIdsToCheckForNavStatus(
  stepId: string,
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent
): readonly string[] {
  const childStepIds = childStepIdsByParent?.[stepId];
  return childStepIds && childStepIds.length > 0 ? childStepIds : [stepId];
}

/** Whether the step or any of its nav children has revealed validation errors. */
export function stepOrChildHasValidationError(
  stepId: string,
  validationAttemptedStepIds: ReadonlySet<string>,
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent
): boolean {
  return stepIdsToCheckForNavStatus(stepId, childStepIdsByParent).some((id) =>
    validationAttemptedStepIds.has(id)
  );
}

/** Whether the step or any nav child has a user-visible validation error. */
export function stepOrChildHasFormValidationIssues<TFieldValues extends FieldValues>(
  stepId: string,
  reviewSections: RosaHcpWizardStepFieldPathsSource,
  getFieldState: UseFormGetFieldState<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
  options: PathsHaveRevealedValidationIssuesOptions = {},
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent
): boolean {
  return stepIdsToCheckForNavStatus(stepId, childStepIdsByParent).some((id) => {
    const fieldPaths = reviewSections.find((section) => section.id === id)?.fieldPaths ?? [];
    return (
      fieldPaths.length > 0 &&
      pathsHaveRevealedValidationIssues(fieldPaths, getFieldState, errors, options)
    );
  });
}

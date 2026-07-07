export type WizardStepWithPfIndex = {
  id: string | number;
  index: number;
};

/**
 * Unvisit PatternFly wizard steps after a source step's 1-based index.
 * Reverse index order avoids PatternFly `hasVisitedNextStep` keeping earlier steps enabled
 * when a later step is still visited (including parent container steps).
 */
export function unvisitWizardNavStepsAfterSourcePfIndex(
  wizardSteps: readonly WizardStepWithPfIndex[],
  sourcePfIndex: number,
  unvisitStep: (stepId: string) => void
): void {
  if (sourcePfIndex < 1) {
    return;
  }

  const stepsToUnvisit = wizardSteps
    .filter((step) => step.index > sourcePfIndex)
    .sort((left, right) => right.index - left.index);

  for (const step of stepsToUnvisit) {
    unvisitStep(String(step.id));
  }
}

/** @deprecated Use {@link unvisitWizardNavStepsAfterSourcePfIndex} with PatternFly step indices. */
export function unvisitWizardNavStepsAfterSourceIndex(
  orderedStepIds: readonly string[],
  sourceStepIndex: number,
  unvisitStep: (stepId: string) => void
): void {
  if (sourceStepIndex < 0) {
    return;
  }

  for (let stepIndex = orderedStepIds.length - 1; stepIndex > sourceStepIndex; stepIndex--) {
    unvisitStep(orderedStepIds[stepIndex]);
  }
}

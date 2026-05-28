/**
 * Review-step sections: PatternFly step ids, labels, and form field paths for the Review step.
 * Step ids align with PatternFly `WizardStep` ids in {@link STEP_IDS}.
 *
 * {@link getFieldPathsForWizardStepId} uses the same field paths when validating on Next.
 */

import { useMemo } from 'react';

import {
  buildRosaHcpWizardReviewSections,
  type RosaHcpWizardReviewSection,
} from './rosaHcpWizardReviewSections.data';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';

export type { RosaHcpWizardReviewSection } from './rosaHcpWizardReviewSections.data';
export {
  buildRosaHcpWizardReviewSections,
  getFieldPathsForWizardStepId,
} from './rosaHcpWizardReviewSections.data';

export const useRosaHcpWizardReviewSections = (): RosaHcpWizardReviewSection[] => {
  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard } = rosaStrings;
  const stepLabels = wizard.stepLabels;

  return useMemo(() => buildRosaHcpWizardReviewSections(stepLabels), [stepLabels]);
};

import { useMemo } from 'react';
import { type FieldPath, useFormContext, useFormState, useWatch } from 'react-hook-form';

import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import { useRosaHcpWizardReviewSections } from '../Steps/Review/ROSAHCPWizardReviewSections';
import type { ROSAHCPCluster } from '../types';

import {
  buildRosaHcpWizardNavStepStatuses,
  buildVisibleWizardStepIds,
  type RosaHcpWizardNavStepStatus,
} from './rosaHcpWizardNavStepStatus';

/** Reactive nav status for wizard steps (error icons in left nav). */
export function useRosaHcpWizardNavStepStatuses(
  includeClusterWideProxy: boolean
): Record<string, RosaHcpWizardNavStepStatus> {
  const reviewSections = useRosaHcpWizardReviewSections();
  const { validationAttemptedStepIds } = useRosaHcpWizardValidation();
  const { getFieldState } = useFormContext<Partial<ROSAHCPCluster>>();
  const formState = useFormState<Partial<ROSAHCPCluster>>();

  // Recompute when field values or touched state change.
  useWatch();

  const visibleStepIds = useMemo(
    () => buildVisibleWizardStepIds(includeClusterWideProxy),
    [includeClusterWideProxy]
  );

  return useMemo(
    () =>
      buildRosaHcpWizardNavStepStatuses({
        sections: reviewSections,
        getFieldState: (path, state) =>
          getFieldState(path as FieldPath<Partial<ROSAHCPCluster>>, state ?? formState),
        validationAttemptedStepIds,
        visibleStepIds,
      }),
    [formState, getFieldState, reviewSections, validationAttemptedStepIds, visibleStepIds]
  );
}

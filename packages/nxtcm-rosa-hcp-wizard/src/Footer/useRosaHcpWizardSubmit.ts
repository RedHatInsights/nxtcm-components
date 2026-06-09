import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';

import { STEP_IDS } from '../constants';
import { useRosaHcpWizardReviewSections } from '../Steps/Review/ROSAHCPWizardReviewSections';
import type { ROSAHCPCluster } from '../types';
import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import {
  markSectionsWithValidationErrors,
  touchInvalidPaths,
  validateWizardStepFields,
} from './rosaHcpWizardFooter.validation';

type UseRosaHcpWizardSubmitOptions = {
  onSubmit: (data: ROSAHCPCluster) => Promise<void>;
};

export function useRosaHcpWizardSubmit({ onSubmit }: UseRosaHcpWizardSubmitOptions) {
  const reviewSections = useRosaHcpWizardReviewSections();
  const {
    markValidationAttempted,
    clearValidationAttempted,
    validationAlertStepId,
    setValidationAlertStepId,
  } = useRosaHcpWizardValidation();
  const {
    trigger,
    getValues,
    setValue,
    getFieldState,
    formState: { errors },
  } = useFormContext<Partial<ClusterFormData>>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const allFormFieldPaths = useMemo(
    () => reviewSections.flatMap((section) => section.fieldPaths),
    [reviewSections]
  );

  const validateEntireForm = useCallback(async (): Promise<boolean> => {
    const stepId = STEP_IDS.REVIEW;

    const outcome = await validateWizardStepFields({
      stepIdWhenStarted: stepId,
      getCurrentStepId: () => stepId,
      fieldPaths: allFormFieldPaths,
      trigger,
      validateAllFields: true,
    });

    if (outcome === 'stale') {
      return false;
    }
    if (outcome === 'valid') {
      clearValidationAttempted(stepId);
      for (const section of reviewSections) {
        if (section.fieldPaths.length > 0) {
          clearValidationAttempted(section.id);
        }
      }
      setValidationAlertStepId((current) => (current === stepId ? null : current));
      return true;
    }

    touchInvalidPaths(allFormFieldPaths, getFieldState, getValues, setValue);
    markSectionsWithValidationErrors(
      reviewSections,
      getFieldState,
      errors,
      markValidationAttempted,
      { alsoMarkStepId: stepId }
    );
    setValidationAlertStepId(stepId);
    return false;
  }, [
    allFormFieldPaths,
    clearValidationAttempted,
    errors,
    getFieldState,
    getValues,
    markValidationAttempted,
    reviewSections,
    setValidationAlertStepId,
    setValue,
    trigger,
  ]);

  const submitWizard = useCallback(async (): Promise<boolean> => {
    if (!(await validateEntireForm())) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(getValues() as ROSAHCPCluster);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [getValues, onSubmit, validateEntireForm]);

  const showValidationAlert = validationAlertStepId === STEP_IDS.REVIEW;

  return {
    isSubmitting,
    showValidationAlert,
    submitWizard,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActionList,
  ActionListGroup,
  ActionListItem,
} from '@patternfly/react-core/dist/dynamic/components/ActionList';
import { Alert, AlertVariant } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  type CustomWizardFooterFunction,
  useWizardContext,
  type WizardFooterProps,
  WizardFooterWrapper,
} from '@patternfly/react-core/dist/dynamic/components/Wizard';
import { useFormContext, useWatch } from 'react-hook-form';

import { FIELD_NAME, STEP_IDS } from '../constants';
import { useRosaHcpWizardNavStatusSync } from '../hooks/useRosaHcpWizardNavStatusSync';
import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import { useRosaHcpWizardReviewSections } from '../Steps/Review/ROSAHCPWizardReviewSections';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster, WizardFieldPath } from '../types';
import {
  findFirstInvalidFocusTarget,
  isRosaHcpWizardBackDisabled,
  isRosaHcpWizardSkipToReviewVisible,
} from './rosaHcpWizardFooter.utils';
import {
  reconcileValidationAttemptedFlags,
  touchInvalidPaths,
  validateWizardStepFields,
} from './rosaHcpWizardFooter.validation';

type RosaHcpWizardFooterProps = Pick<
  WizardFooterProps,
  'activeStep' | 'onNext' | 'onBack' | 'onClose'
> & {
  isSubmitting: boolean;
  submitWizard: () => Promise<boolean>;
  enableAllWizardNavSteps?: boolean;
};

/**
 * PatternFly wizard footer that validates all fields on the active step before Next or Skip to review.
 * Next and Skip to review stay enabled so the user can always retry validation.
 */
function RosaHcpWizardFooter({
  activeStep,
  onNext,
  onBack,
  onClose,
  isSubmitting,
  submitWizard,
  enableAllWizardNavSteps = false,
}: RosaHcpWizardFooterProps) {
  const { getStep, goToStepByIndex, mainWrapperRef, shouldFocusContent } = useWizardContext();
  const [invalidFocusRequest, setInvalidFocusRequest] = useState(0);
  const reviewSections = useRosaHcpWizardReviewSections();
  const { wizard } = useRosaHcpWizardStrings();
  const {
    markValidationAttempted,
    clearValidationAttempted,
    validationAttemptedStepIds,
    validationAlertStepId,
    setValidationAlertStepId,
  } = useRosaHcpWizardValidation();
  const {
    trigger,
    getValues,
    setValue,
    getFieldState,
    formState: { errors },
  } = useFormContext<Partial<ROSAHCPCluster>>();

  const clusterWideProxySelected = useWatch<ROSAHCPCluster, typeof FIELD_NAME.CONFIGURE_PROXY>({
    name: FIELD_NAME.CONFIGURE_PROXY,
  });
  useRosaHcpWizardNavStatusSync(!!clusterWideProxySelected, enableAllWizardNavSteps);

  const activeStepId = String(activeStep.id);

  const getCurrentStepId = useCallback(() => String(activeStep.id), [activeStep.id]);
  const isReviewStep = activeStepId === STEP_IDS.REVIEW;
  const showSkipToReview = isRosaHcpWizardSkipToReviewVisible(activeStepId);

  const stepFieldPaths = useMemo(
    () => reviewSections.find((section) => section.id === activeStepId)?.fieldPaths ?? [],
    [activeStepId, reviewSections]
  );

  const validationWasAttemptedOnActiveStep = validationAttemptedStepIds.has(activeStepId);

  // onTouched forms often keep formState.errors until blur; watch values so we re-trigger after edits.
  const watchedFormValues = useWatch<Partial<ROSAHCPCluster>>({
    disabled: !validationWasAttemptedOnActiveStep,
  });

  const showValidationAlert = validationAlertStepId === activeStepId;

  useEffect(() => {
    if (validationAlertStepId === activeStepId && !validationAttemptedStepIds.has(activeStepId)) {
      setValidationAlertStepId(null);
    }
  }, [activeStepId, setValidationAlertStepId, validationAlertStepId, validationAttemptedStepIds]);

  useEffect(() => {
    setValidationAlertStepId((current) =>
      current !== null && current !== activeStepId ? null : current
    );
  }, [activeStepId, setValidationAlertStepId]);

  const revealInvalidFields = useCallback(
    (fieldPaths: readonly WizardFieldPath[]) => {
      touchInvalidPaths(fieldPaths, getFieldState, getValues, setValue);
    },
    [getFieldState, getValues, setValue]
  );

  const failStepValidation = useCallback(
    (fieldPaths: readonly WizardFieldPath[], stepIdsToMark: readonly string[]) => {
      revealInvalidFields(fieldPaths);
      for (const stepId of stepIdsToMark) {
        markValidationAttempted(stepId);
      }
      setValidationAlertStepId(activeStepId);
      setInvalidFocusRequest((count) => count + 1);
    },
    [activeStepId, markValidationAttempted, revealInvalidFields, setValidationAlertStepId]
  );

  // Runs after the render that reveals field errors, so aria-invalid is already on the controls.
  useEffect(() => {
    if (invalidFocusRequest === 0 || !mainWrapperRef.current) {
      return;
    }
    findFirstInvalidFocusTarget(mainWrapperRef.current)?.focus();
  }, [invalidFocusRequest, mainWrapperRef]);

  // Re-run Yup when the user edits after a failed Next/Submit so derived fields and the alert stay in sync.
  // Depends on watched field values (not the attempted flag) so marking attempted does not clear
  // the alert in the same turn; values changing re-triggers even when errors lag in onTouched mode.
  useEffect(() => {
    if (!validationWasAttemptedOnActiveStep) {
      return;
    }

    const stepIdAtStart = activeStepId;

    void reconcileValidationAttemptedFlags({
      isReviewStep,
      stepIdAtStart,
      getCurrentStepId,
      stepFieldPaths,
      reviewSections,
      trigger,
      getFieldState,
      errors,
      clearValidationAttempted,
    }).then((activeStepBecameValid) => {
      if (activeStepBecameValid) {
        setValidationAlertStepId((current) => (current === stepIdAtStart ? null : current));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- validationWasAttemptedOnActiveStep omitted so marking attempted does not immediately re-trigger and clear the alert
  }, [
    activeStepId,
    clearValidationAttempted,
    getCurrentStepId,
    getFieldState,
    isReviewStep,
    reviewSections,
    setValidationAlertStepId,
    stepFieldPaths,
    trigger,
    watchedFormValues,
  ]);

  const validateActiveStep = useCallback(async (): Promise<boolean> => {
    const stepId = activeStepId;

    if (stepFieldPaths.length === 0) {
      clearValidationAttempted(stepId);
      return true;
    }

    const outcome = await validateWizardStepFields({
      stepIdWhenStarted: stepId,
      getCurrentStepId,
      fieldPaths: stepFieldPaths,
      trigger,
    });

    if (outcome === 'stale') {
      return false;
    }
    if (outcome === 'valid') {
      clearValidationAttempted(stepId);
      return true;
    }

    failStepValidation(stepFieldPaths, [stepId]);
    return false;
  }, [
    activeStepId,
    clearValidationAttempted,
    failStepValidation,
    getCurrentStepId,
    stepFieldPaths,
    trigger,
  ]);

  const handleNext = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      void (async () => {
        if (await validateActiveStep()) {
          await onNext(event);
        }
      })();
    },
    [onNext, validateActiveStep]
  );

  const handleSubmit = useCallback(() => {
    void (async () => {
      try {
        await submitWizard();
      } catch {
        // keep the wizard open so the user can correct and retry
      }
    })();
  }, [submitWizard]);

  const handlePrimaryAction = isReviewStep ? handleSubmit : handleNext;
  const primaryButtonLabel = isReviewStep ? wizard.createCluster : wizard.next;

  const handleSkipToReview = useCallback(() => {
    void (async () => {
      if (await validateActiveStep()) {
        goToStepByIndex(getStep(STEP_IDS.REVIEW).index);
        // Unlike onNext/onBack, goToStepById does not move focus, and this button is gone on Review.
        if (shouldFocusContent) {
          setTimeout(() => mainWrapperRef.current?.focus(), 0);
        }
      }
    })();
  }, [goToStepByIndex, getStep, mainWrapperRef, shouldFocusContent, validateActiveStep]);

  return (
    <WizardFooterWrapper>
      {showValidationAlert ? (
        <Alert
          className="pf-v6-u-mb-md"
          title={wizard.fixValidationErrors}
          isInline
          variant={AlertVariant.danger}
          role="alert"
        />
      ) : null}
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              variant={ButtonVariant.secondary}
              type="button"
              onClick={(event) => {
                void onBack(event);
              }}
              isDisabled={isSubmitting || isRosaHcpWizardBackDisabled(activeStepId)}
            >
              {wizard.back}
            </Button>
          </ActionListItem>

          <ActionListItem>
            <Button
              variant={ButtonVariant.primary}
              type="button"
              isLoading={isReviewStep && isSubmitting}
              isAriaDisabled={isSubmitting}
              onClick={handlePrimaryAction}
            >
              {primaryButtonLabel}
            </Button>
          </ActionListItem>
          {showSkipToReview ? (
            <ActionListItem>
              <Button
                variant={ButtonVariant.secondary}
                type="button"
                isDisabled={isSubmitting}
                onClick={handleSkipToReview}
              >
                {wizard.skipToReview}
              </Button>
            </ActionListItem>
          ) : null}
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              variant={ButtonVariant.link}
              type="button"
              isDisabled={isSubmitting}
              onClick={(event) => {
                void onClose(event);
              }}
            >
              {wizard.cancel}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
}

/** Footer factory wired to the submission state owned by the wizard body. */
export function createRosaHcpWizardFooter(
  isSubmitting: boolean,
  submitWizard: () => Promise<boolean>,
  enableAllWizardNavSteps = false
): CustomWizardFooterFunction {
  return function RosaHcpWizardFooterSlot(activeStep, onNext, onBack, onClose) {
    return (
      <RosaHcpWizardFooter
        activeStep={activeStep}
        isSubmitting={isSubmitting}
        submitWizard={submitWizard}
        enableAllWizardNavSteps={enableAllWizardNavSteps}
        onNext={(event) => {
          void onNext(event);
        }}
        onBack={(event) => {
          void onBack(event);
        }}
        onClose={(event) => {
          void onClose(event);
        }}
      />
    );
  };
}

import { Alert, Form, useWizardContext } from '@patternfly/react-core';
import { useEffect, type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import type { SimpleWizardFormValues } from './simpleWizardForm';
import { hasFieldErrors } from './hasFieldErrors';
import { useSimpleWizardFooterValidation } from './SimpleWizardFooterValidationContext';
import {
  SIMPLE_WIZARD_REVIEW_STEP_ID,
  stepFieldsHaveErrors,
  WIZARD_SUBSTEP_ID_TO_FIELD_PATHS,
} from './wizardStepFieldPaths';

type WizardStepFormProps = {
  children: ReactNode;
};

/**
 * PatternFly `Form` plus a top-level danger alert when validation failed on Save/Submit or after
 * Next was blocked — see https://www.patternfly.org/components/forms/form#invalid-with-form-alert
 */
export const WizardStepForm = ({ children }: WizardStepFormProps) => {
  const { formState } = useFormContext<SimpleWizardFormValues>();
  const { activeStep } = useWizardContext();
  const { footerBlockedStepIndex, setFooterBlockedStepIndex } = useSimpleWizardFooterValidation();

  const stepId = String(activeStep.id);
  const paths = WIZARD_SUBSTEP_ID_TO_FIELD_PATHS[stepId] ?? null;
  const isReview = stepId === SIMPLE_WIZARD_REVIEW_STEP_ID;
  const stepHasErrors =
    paths != null
      ? stepFieldsHaveErrors(formState.errors, paths)
      : isReview
        ? hasFieldErrors(formState.errors)
        : false;

  const showStepNavAlert =
    footerBlockedStepIndex !== null && footerBlockedStepIndex === activeStep.index && stepHasErrors;

  const showSubmitAlert = formState.submitCount > 0 && hasFieldErrors(formState.errors);

  useEffect(() => {
    if (footerBlockedStepIndex !== activeStep.index) {
      return;
    }
    if (!stepHasErrors) {
      setFooterBlockedStepIndex(null);
    }
  }, [footerBlockedStepIndex, activeStep.index, stepHasErrors, setFooterBlockedStepIndex]);

  const showFormAlert = showSubmitAlert || showStepNavAlert;

  return (
    <Form>
      {showFormAlert ? (
        <Alert
          className="pf-v6-u-mb-md"
          isInline
          title="Fill out all required fields before continuing."
          variant="danger"
        />
      ) : null}
      {children}
    </Form>
  );
};

import {
  isCustomWizardFooter,
  isWizardSubStep,
  WizardFooter,
  type WizardStepType,
} from '@patternfly/react-core';
import type { MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { FIELDS_PER_WIZARD_STEP, type SimpleWizardFormValues } from './simpleWizardSchema';

type SimpleWizardFormFooterProps = {
  activeStep: WizardStepType;
  onNext: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onBack: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onClose: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
};

export const SimpleWizardFormFooter = ({
  activeStep,
  onNext,
  onBack,
  onClose,
}: SimpleWizardFormFooterProps) => {
  const { trigger } = useFormContext<SimpleWizardFormValues>();

  const isBackDisabled =
    activeStep?.index === 1 || (isWizardSubStep(activeStep) && activeStep.index === 2);

  const stepFooterProps =
    activeStep?.footer &&
    !isCustomWizardFooter(activeStep.footer) &&
    typeof activeStep.footer === 'object'
      ? activeStep.footer
      : {};

  const onNextWithStepValidation = async (e: MouseEvent<HTMLButtonElement>) => {
    const id = String(activeStep.id);
    const fields = FIELDS_PER_WIZARD_STEP[id];
    if (fields?.length) {
      const valid = await trigger(fields);
      if (!valid) {
        e.preventDefault();
        return;
      }
    }
    await onNext(e);
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      onNext={(e) => {
        void onNextWithStepValidation(e);
      }}
      onBack={(e) => {
        void onBack(e);
      }}
      onClose={(e) => {
        void onClose(e);
      }}
      isBackDisabled={isBackDisabled}
      {...stepFooterProps}
    />
  );
};

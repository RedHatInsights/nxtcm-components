import { Wizard, WizardStep } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import ReviewStep from './Steps/ReviewStep';
import { StepA } from './Steps/Required/StepA';
import { StepB } from './Steps/Required/StepB';
import { StepC } from './Steps/Required/StepC';
import { StepD } from './Steps/Required/StepD';
import { defaultSimpleWizardFormValues, type SimpleWizardFormValues } from './simpleWizardForm';

export type WizardExpandableStepsProps = {
  /** Called when the user clicks Finish on the last step with a valid form. Defaults to logging in the console. */
  onSubmitSuccess?: (data: SimpleWizardFormValues) => void;
};

const logSubmittedWizard = (data: SimpleWizardFormValues) => {
  // eslint-disable-next-line no-console -- default demo behavior; override via onSubmitSuccess in production apps
  console.log('SimpleWizard submitted:', data);
};

export const WizardExpandableSteps = ({
  onSubmitSuccess = logSubmittedWizard,
}: WizardExpandableStepsProps = {}) => {
  const methods = useForm<SimpleWizardFormValues>({
    defaultValues: defaultSimpleWizardFormValues,
    mode: 'onSubmit',
  });

  const onSubmit = (data: SimpleWizardFormValues) => {
    onSubmitSuccess(data);
  };

  return (
    <FormProvider {...methods}>
      <Wizard
        isVisitRequired={true}
        height={400}
        title="Expandable steps wizard"
        nav={{ isExpanded: true }}
        onSave={() => {
          void methods.handleSubmit(onSubmit)();
        }}
      >
        <WizardStep
          name="Required"
          id="required-steps"
          isExpandable
          steps={[
            <WizardStep name="Substep A" id="expand-steps-sub-a" key="expand-steps-sub-a">
              <StepA />
            </WizardStep>,
            <WizardStep name="Substep B" id="expand-steps-sub-b" key="expand-steps-sub-b">
              <StepB />
            </WizardStep>,
            <WizardStep name="Substep C" id="expand-steps-sub-c" key="expand-steps-sub-c">
              <StepC />
            </WizardStep>,
            <WizardStep name="Substep D" id="expand-steps-sub-d" key="expand-steps-sub-d">
              <StepD />
            </WizardStep>,
          ]}
        />

        <WizardStep name="Review" id="review-step" footer={{ nextButtonText: 'Submit' }}>
          <ReviewStep />
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

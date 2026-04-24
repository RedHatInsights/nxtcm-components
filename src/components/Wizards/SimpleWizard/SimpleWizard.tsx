import { zodResolver } from '@hookform/resolvers/zod';
import { Wizard, WizardStep } from '@patternfly/react-core';
import { FormProvider, useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { SimpleWizardFormFooter } from './SimpleWizardFormFooter';
import ReviewStep from './Steps/ReviewStep';
import { StepA } from './Steps/Required/StepA';
import { StepB } from './Steps/Required/StepB';
import { StepC } from './Steps/Required/StepC';
import { StepD } from './Steps/Required/StepD';
import { defaultSimpleWizardFormValues, type SimpleWizardFormValues } from './simpleWizardForm';
import { simpleWizardSchema } from './simpleWizardSchema';
import { StepE } from './Steps/Optional/StepE';
import { StepF } from './Steps/Optional/StepF';

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
    resolver: zodResolver(simpleWizardSchema as never) as Resolver<SimpleWizardFormValues>,
  });

  const onSubmit: SubmitHandler<SimpleWizardFormValues> = (data) => {
    onSubmitSuccess(data);
  };

  return (
    <FormProvider {...methods}>
      <Wizard
        isVisitRequired={true}
        height={400}
        title="Expandable steps wizard"
        nav={{ isExpanded: true }}
        footer={(activeStep, onNext, onBack, onClose) => (
          <SimpleWizardFormFooter
            activeStep={activeStep}
            onNext={(e) => {
              void onNext(e);
            }}
            onBack={(e) => {
              void onBack(e);
            }}
            onClose={(e) => {
              void onClose(e);
            }}
          />
        )}
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
        <WizardStep
          id="optional-steps"
          isExpandable
          name="Optional"
          steps={[
            <WizardStep id="expand-steps-sub-e" key="expand-steps-sub-e" name="Substep E">
              <StepE />
            </WizardStep>,
            <WizardStep id="expand-steps-sub-f" key="expand-steps-sub-f" name="Substep F">
              <StepF />
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

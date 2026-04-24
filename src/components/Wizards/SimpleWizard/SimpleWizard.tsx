import { zodResolver } from '@hookform/resolvers/zod';
import { Wizard, WizardStep } from '@patternfly/react-core';
import type { FC } from 'react';
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';
import { SimpleWizardFormFooter } from './SimpleWizardFormFooter';
import ReviewStep from './Steps/ReviewStep';
import { StepA } from './Steps/Required/StepA';
import { StepB } from './Steps/Required/StepB';
import { StepC } from './Steps/Required/StepC';
import { StepD } from './Steps/Required/StepD';
import { StepE } from './Steps/Optional/StepE';
import { StepF } from './Steps/Optional/StepF';
import {
  defaultSimpleWizardFormValues,
  optionalWizardSubsteps,
  requiredWizardSubsteps,
  simpleWizardSchema,
  WIZARD_GROUP,
  WIZARD_REVIEW,
  type SimpleWizardFormSubkey,
  type SimpleWizardFormValues,
} from './simpleWizardSchema';

/**
 * Wires list-driven substeps from the schema to React components. When you add a substep in
 * `simpleWizardSchema.ts`’s `WIZARD_SUBSTEPS` list, add one entry here.
 */
const SIMPLE_WIZARD_SUBSTEP_VIEWS: Record<SimpleWizardFormSubkey, FC> = {
  stepA: StepA,
  stepB: StepB,
  stepC: StepC,
  stepD: StepD,
  stepE: StepE,
  stepF: StepF,
};

export type WizardExpandableStepsProps = {
  /** Called when the user clicks Finish on the last step with a valid form. Defaults to logging in the console. */
  onSubmitSuccess?: (data: SimpleWizardFormValues) => void;
};

const logSubmittedWizard = (data: SimpleWizardFormValues) => {
  // eslint-disable-next-line no-console -- default demo behavior; override via onSubmitSuccess in production apps
  console.log('SimpleWizard submitted:', data);
};

const wizardStepStatus = (hasError: boolean) =>
  (hasError ? 'error' : 'default') as 'error' | 'default';

const substepHasValidationError = (
  formErrors: FieldErrors<SimpleWizardFormValues> | undefined,
  group: 'required' | 'optional',
  formKey: string
) => {
  if (!formErrors) {
    return false;
  }
  const branch = formErrors[group] as
    | Record<string, Record<string, object | string | undefined> | undefined>
    | undefined;
  const stepErrors = branch?.[formKey];
  if (!stepErrors || typeof stepErrors !== 'object') {
    return false;
  }
  return Object.values(stepErrors).some((e) => e != null && typeof e === 'object');
};

export const WizardExpandableSteps = ({
  onSubmitSuccess = logSubmittedWizard,
}: WizardExpandableStepsProps = {}) => {
  const methods = useForm<SimpleWizardFormValues>({
    defaultValues: defaultSimpleWizardFormValues,
    mode: 'onSubmit',
    resolver: zodResolver(simpleWizardSchema as never) as Resolver<SimpleWizardFormValues>,
  });
  const { errors } = methods.formState;

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
          name={WIZARD_GROUP.required.name}
          id={WIZARD_GROUP.required.id}
          isExpandable
          status={wizardStepStatus(
            requiredWizardSubsteps.some((d) =>
              substepHasValidationError(errors, 'required', d.formKey)
            )
          )}
          steps={requiredWizardSubsteps.map((d) => {
            const Sub = SIMPLE_WIZARD_SUBSTEP_VIEWS[d.formKey];
            return (
              <WizardStep
                name={d.nav.name}
                id={d.nav.id}
                key={d.nav.id}
                status={wizardStepStatus(substepHasValidationError(errors, d.group, d.formKey))}
              >
                <Sub />
              </WizardStep>
            );
          })}
        />
        <WizardStep
          id={WIZARD_GROUP.optional.id}
          isExpandable
          name={WIZARD_GROUP.optional.name}
          status={wizardStepStatus(
            optionalWizardSubsteps.some((d) =>
              substepHasValidationError(errors, 'optional', d.formKey)
            )
          )}
          steps={optionalWizardSubsteps.map((d) => {
            const Sub = SIMPLE_WIZARD_SUBSTEP_VIEWS[d.formKey];
            return (
              <WizardStep
                name={d.nav.name}
                id={d.nav.id}
                key={d.nav.id}
                status={wizardStepStatus(substepHasValidationError(errors, d.group, d.formKey))}
              >
                <Sub />
              </WizardStep>
            );
          })}
        />

        <WizardStep
          name={WIZARD_REVIEW.name}
          id={WIZARD_REVIEW.id}
          status="default"
          footer={{ nextButtonText: 'Submit' }}
        >
          <ReviewStep />
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

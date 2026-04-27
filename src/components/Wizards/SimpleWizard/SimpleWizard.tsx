import { zodResolver } from '@hookform/resolvers/zod';
import { Wizard, WizardStep } from '@patternfly/react-core';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
  type FieldErrors,
  type FieldNamesMarkedBoolean,
  type FieldPath,
  type Resolver,
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
  isWizardStepNavIndexDisabled,
  isWizardSubstepInErrorDisplayRange,
  optionalWizardSubsteps,
  PATTERNFLY_WIZARD_NAV_ID_TO_INDEX,
  PATTERNFLY_WIZARD_FIRST_LEAF_INDEX,
  requiredWizardSubsteps,
  simpleWizardSchema,
  WIZARD_GROUP,
  WIZARD_REVIEW,
  WIZARD_RESET_FURTHEST_ON_FIELD_CHANGE,
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

const substepHasAnyDirtyField = (
  dirtyFields: FieldNamesMarkedBoolean<SimpleWizardFormValues> | undefined,
  group: 'required' | 'optional',
  formKey: string
) => {
  const g = dirtyFields?.[group];
  if (g == null || typeof g !== 'object') {
    return false;
  }
  const step = (g as Record<string, unknown>)[formKey];
  if (step === true) {
    return true;
  }
  if (step == null || typeof step !== 'object') {
    return false;
  }
  return Object.keys(step).length > 0;
};

const shouldShowSubstepNavError = (
  formErrors: FieldErrors<SimpleWizardFormValues> | undefined,
  dirtyFields: FieldNamesMarkedBoolean<SimpleWizardFormValues> | undefined,
  subIndex: number | undefined,
  furthest: number,
  group: 'required' | 'optional',
  formKey: string
) => {
  if (!substepHasValidationError(formErrors, group, formKey)) {
    return false;
  }
  if (isWizardSubstepInErrorDisplayRange(subIndex, furthest)) {
    return true;
  }
  return substepHasAnyDirtyField(dirtyFields, group, formKey);
};

const SimpleWizardWithNav = ({
  onSubmitSuccess,
}: {
  onSubmitSuccess: (data: SimpleWizardFormValues) => void;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useFormContext<SimpleWizardFormValues>();

  const [current, setCurrent] = useState(PATTERNFLY_WIZARD_FIRST_LEAF_INDEX);
  const [furthest, setFurthest] = useState(PATTERNFLY_WIZARD_FIRST_LEAF_INDEX);
  const currentRef = useRef(current);
  currentRef.current = current;

  const watchResetFields = useWatch({
    control,
    name: [
      ...WIZARD_RESET_FURTHEST_ON_FIELD_CHANGE,
    ] as readonly FieldPath<SimpleWizardFormValues>[],
  });
  const watchResetFieldsSig = JSON.stringify(watchResetFields);
  const previousWatchResetFieldsSig = useRef<string | null>(null);
  useEffect(() => {
    if (previousWatchResetFieldsSig.current == null) {
      previousWatchResetFieldsSig.current = watchResetFieldsSig;
      return;
    }
    if (previousWatchResetFieldsSig.current === watchResetFieldsSig) {
      return;
    }
    previousWatchResetFieldsSig.current = watchResetFieldsSig;
    setFurthest((_) => currentRef.current);
  }, [watchResetFieldsSig]);

  const handleSave = () => {
    void handleSubmit((data) => onSubmitSuccess(data))();
  };

  return (
    <Wizard
      isVisitRequired={false}
      startIndex={PATTERNFLY_WIZARD_FIRST_LEAF_INDEX}
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
      onStepChange={(_e, newStep) => {
        setCurrent(newStep.index);
        setFurthest((f) => Math.max(f, newStep.index));
      }}
      onSave={handleSave}
    >
      <WizardStep
        name={WIZARD_GROUP.required.name}
        id={WIZARD_GROUP.required.id}
        isExpandable
        isDisabled={isWizardStepNavIndexDisabled(
          PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[WIZARD_GROUP.required.id],
          furthest
        )}
        status={wizardStepStatus(
          requiredWizardSubsteps.some((d) => {
            const subIdx = PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[d.nav.id];
            return shouldShowSubstepNavError(
              errors,
              dirtyFields,
              subIdx,
              furthest,
              'required',
              d.formKey
            );
          })
        )}
        steps={requiredWizardSubsteps.map((d) => {
          const subIndex = PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[d.nav.id];
          const Sub = SIMPLE_WIZARD_SUBSTEP_VIEWS[d.formKey];
          return (
            <WizardStep
              name={d.nav.name}
              id={d.nav.id}
              key={d.nav.id}
              isDisabled={isWizardStepNavIndexDisabled(subIndex, furthest)}
              status={wizardStepStatus(
                shouldShowSubstepNavError(
                  errors,
                  dirtyFields,
                  subIndex,
                  furthest,
                  d.group,
                  d.formKey
                )
              )}
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
        isDisabled={isWizardStepNavIndexDisabled(
          PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[WIZARD_GROUP.optional.id],
          furthest
        )}
        status={wizardStepStatus(
          optionalWizardSubsteps.some((d) => {
            const subIdx = PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[d.nav.id];
            return shouldShowSubstepNavError(
              errors,
              dirtyFields,
              subIdx,
              furthest,
              'optional',
              d.formKey
            );
          })
        )}
        steps={optionalWizardSubsteps.map((d) => {
          const subIndex = PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[d.nav.id];
          const Sub = SIMPLE_WIZARD_SUBSTEP_VIEWS[d.formKey];
          return (
            <WizardStep
              name={d.nav.name}
              id={d.nav.id}
              key={d.nav.id}
              isDisabled={isWizardStepNavIndexDisabled(subIndex, furthest)}
              status={wizardStepStatus(
                shouldShowSubstepNavError(
                  errors,
                  dirtyFields,
                  subIndex,
                  furthest,
                  d.group,
                  d.formKey
                )
              )}
            >
              <Sub />
            </WizardStep>
          );
        })}
      />

      <WizardStep
        name={WIZARD_REVIEW.name}
        id={WIZARD_REVIEW.id}
        isDisabled={isWizardStepNavIndexDisabled(
          PATTERNFLY_WIZARD_NAV_ID_TO_INDEX[String(WIZARD_REVIEW.id)],
          furthest
        )}
        status="default"
        footer={{ nextButtonText: 'Submit' }}
      >
        <ReviewStep />
      </WizardStep>
    </Wizard>
  );
};

export const WizardExpandableSteps = ({
  onSubmitSuccess = logSubmittedWizard,
}: WizardExpandableStepsProps = {}) => {
  const methods = useForm<SimpleWizardFormValues>({
    defaultValues: defaultSimpleWizardFormValues,
    mode: 'onSubmit',
    resolver: zodResolver(simpleWizardSchema as never) as Resolver<SimpleWizardFormValues>,
  });
  return (
    <FormProvider {...methods}>
      <SimpleWizardWithNav onSubmitSuccess={onSubmitSuccess} />
    </FormProvider>
  );
};

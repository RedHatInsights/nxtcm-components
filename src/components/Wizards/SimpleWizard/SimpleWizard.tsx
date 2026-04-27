import {
  isWizardSubStep,
  useWizardContext,
  Wizard,
  WizardFooter,
  WizardStep,
} from '@patternfly/react-core';
import type { WizardFooterProps, WizardStepType } from '@patternfly/react-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { handleWizardNext, type WizardContextGoNext } from './handleWizardNext';
import ReviewStep from './Steps/ReviewStep';
import { StepA } from './Steps/Required/StepA';
import { StepB } from './Steps/Required/StepB';
import { StepC } from './Steps/Required/StepC';
import { StepD } from './Steps/Required/StepD';
import { StepE } from './Steps/Optional/StepE';
import { StepF } from './Steps/Optional/StepF';
import {
  defaultSimpleWizardFormValues,
  type SimpleWizardFormValues,
} from './simpleWizardFormSchema';
import { simpleWizardYupResolver } from './simpleWizardYupResolver';
import {
  SimpleWizardFooterValidationProvider,
  useSimpleWizardFooterValidation,
} from './SimpleWizardFooterValidationContext';
import {
  SIMPLE_WIZARD_FIELDS_THAT_INVALIDATE_FUTURE_STEPS,
  WIZARD_OPTIONAL_SUBSTEP_IDS,
  WIZARD_REQUIRED_SUBSTEP_IDS,
  WIZARD_REVIEW_STEP_FLAT_ONE_BASED_INDEX,
  WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX,
  WIZARD_SUBSTEP_ID_TO_LABEL,
  wizardExpandableParentNavStatus,
  wizardSubstepNavStatus,
} from './wizardStepFieldPaths';

export type WizardExpandableStepsProps = {
  /** Called when the user clicks Finish on the last step with a valid form. Defaults to logging in the console. */
  onSubmitSuccess?: (data: SimpleWizardFormValues) => void;
};

const logSubmittedWizard = (data: SimpleWizardFormValues) => {
  // eslint-disable-next-line no-console -- default demo behavior; override via onSubmitSuccess in production apps
  console.log('SimpleWizard submitted:', data);
};

const isWizardFooterBackDisabled = (activeStep: WizardStepType): boolean =>
  activeStep.index === 1 || (isWizardSubStep(activeStep) && activeStep.index === 2);

/** Needs `useWizardContext` (must render under PatternFly `Wizard`). */
const SimpleWizardFooter = (
  p: Pick<WizardFooterProps, 'onBack' | 'onClose' | 'onNext'> & {
    activeStep: WizardStepType;
    methods: Pick<UseFormReturn<SimpleWizardFormValues>, 'trigger'>;
    setFooterBlockedStepIndex: (index: number | null) => void;
  }
) => {
  const { goToStepByIndex } = useWizardContext();
  return (
    <WizardFooter
      activeStep={p.activeStep}
      isBackDisabled={isWizardFooterBackDisabled(p.activeStep)}
      nextButtonText="Next"
      onBack={p.onBack}
      onClose={p.onClose}
      onNext={() =>
        void handleWizardNext({
          activeStep: p.activeStep,
          goNext: p.onNext as WizardContextGoNext,
          goToStepByIndex,
          methods: p.methods,
          setFooterBlockedStepIndex: p.setFooterBlockedStepIndex,
        })
      }
    />
  );
};

const SimpleWizardFrame = ({
  onSubmitSuccess = logSubmittedWizard,
}: WizardExpandableStepsProps) => {
  const methods = useFormContext<SimpleWizardFormValues>();
  const { errors } = useFormState({ control: methods.control });
  const { setFooterBlockedStepIndex } = useSimpleWizardFooterValidation();

  /** PatternFly flat step index (1-based); first substep after the initial parent focus bump is 2. */
  const [wizardActiveFlatOneBasedIndex, setWizardActiveFlatOneBasedIndex] = useState(2);
  const [wizardMostFutureVisitedFlatOneBasedIndex, setWizardMostFutureVisitedFlatOneBasedIndex] =
    useState(2);

  const gateSlice = useWatch({
    control: methods.control,
    name: [...SIMPLE_WIZARD_FIELDS_THAT_INVALIDATE_FUTURE_STEPS],
  });
  const gateKey = JSON.stringify(gateSlice ?? null);
  const prevGateKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevGateKey.current === null) {
      prevGateKey.current = gateKey;
      return;
    }
    if (prevGateKey.current === gateKey) return;
    prevGateKey.current = gateKey;
    setWizardMostFutureVisitedFlatOneBasedIndex(wizardActiveFlatOneBasedIndex);
  }, [gateKey, wizardActiveFlatOneBasedIndex]);

  const onWizardStepChange = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>, step: WizardStepType) => {
      const idx = step.index;
      setWizardActiveFlatOneBasedIndex(idx);
      setWizardMostFutureVisitedFlatOneBasedIndex((m) => Math.max(m, idx));
    },
    []
  );

  const stepNavDisabled = useMemo(
    () => (flat: number) =>
      flat > wizardActiveFlatOneBasedIndex && flat > wizardMostFutureVisitedFlatOneBasedIndex,
    [wizardActiveFlatOneBasedIndex, wizardMostFutureVisitedFlatOneBasedIndex]
  );

  const onSubmit = (data: SimpleWizardFormValues) => {
    onSubmitSuccess(data);
  };

  const footer = useCallback(
    (
      activeStep: WizardStepType,
      onNext: WizardFooterProps['onNext'],
      onBack: WizardFooterProps['onBack'],
      onClose: WizardFooterProps['onClose']
    ) => (
      <SimpleWizardFooter
        activeStep={activeStep}
        methods={methods}
        onBack={onBack}
        onClose={onClose}
        onNext={onNext}
        setFooterBlockedStepIndex={setFooterBlockedStepIndex}
      />
    ),
    [methods, setFooterBlockedStepIndex]
  );

  return (
    <Wizard
      footer={footer}
      height={400}
      isVisitRequired={false}
      nav={{ isExpanded: true }}
      onStepChange={onWizardStepChange}
      onSave={() => {
        void methods.handleSubmit(onSubmit)();
      }}
      title="Expandable steps wizard"
    >
      <WizardStep
        id="required-steps"
        isExpandable
        name="Required"
        status={wizardExpandableParentNavStatus(errors, WIZARD_REQUIRED_SUBSTEP_IDS)}
        steps={[
          <WizardStep
            id="expand-steps-sub-a"
            key="expand-steps-sub-a"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-a'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-a']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-a')}
          >
            <StepA />
          </WizardStep>,
          <WizardStep
            id="expand-steps-sub-b"
            key="expand-steps-sub-b"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-b'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-b']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-b')}
          >
            <StepB />
          </WizardStep>,
          <WizardStep
            id="expand-steps-sub-c"
            key="expand-steps-sub-c"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-c'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-c']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-c')}
          >
            <StepC />
          </WizardStep>,
          <WizardStep
            id="expand-steps-sub-d"
            key="expand-steps-sub-d"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-d'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-d']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-d')}
          >
            <StepD />
          </WizardStep>,
        ]}
      />

      <WizardStep
        id="optional-steps"
        isExpandable
        name="Optional"
        status={wizardExpandableParentNavStatus(errors, WIZARD_OPTIONAL_SUBSTEP_IDS)}
        steps={[
          <WizardStep
            id="expand-steps-sub-e"
            key="expand-steps-sub-e"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-e'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-e']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-e')}
          >
            <StepE />
          </WizardStep>,
          <WizardStep
            id="expand-steps-sub-f"
            key="expand-steps-sub-f"
            isDisabled={stepNavDisabled(WIZARD_SUBSTEP_FLAT_ONE_BASED_INDEX['expand-steps-sub-f'])}
            name={WIZARD_SUBSTEP_ID_TO_LABEL['expand-steps-sub-f']}
            status={wizardSubstepNavStatus(errors, 'expand-steps-sub-f')}
          >
            <StepF />
          </WizardStep>,
        ]}
      />

      <WizardStep
        footer={{ nextButtonText: 'Submit' }}
        id="review-step"
        isDisabled={stepNavDisabled(WIZARD_REVIEW_STEP_FLAT_ONE_BASED_INDEX)}
        name="Review"
      >
        <ReviewStep />
      </WizardStep>
    </Wizard>
  );
};

export const WizardExpandableSteps = ({ onSubmitSuccess }: WizardExpandableStepsProps = {}) => {
  const methods = useForm<SimpleWizardFormValues>({
    defaultValues: defaultSimpleWizardFormValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: simpleWizardYupResolver,
  });

  return (
    <FormProvider {...methods}>
      <SimpleWizardFooterValidationProvider>
        <SimpleWizardFrame onSubmitSuccess={onSubmitSuccess} />
      </SimpleWizardFooterValidationProvider>
    </FormProvider>
  );
};

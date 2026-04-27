import type { UseFormReturn } from 'react-hook-form';
import type { SimpleWizardFormValues } from './simpleWizardFormSchema';
import {
  SIMPLE_WIZARD_REVIEW_STEP_ID,
  WIZARD_SUBSTEP_ID_TO_FIELD_PATHS,
  wizardNextNavigableFlatOneBasedIndex,
} from './wizardStepFieldPaths';

export type WizardNextActiveStep = {
  id: string | number;
  index: number;
};

/** PatternFly wizard context passes a zero-arg `goNext` (see `WizardContext` / `goToNextStep`). */
export type WizardContextGoNext = () => void | Promise<void>;

export type HandleWizardNextParams = {
  activeStep: WizardNextActiveStep;
  goNext: WizardContextGoNext;
  /** Advances by flat index without `isDisabled` checks (PatternFly `goToNextStep` cannot). */
  goToStepByIndex?: (flatOneBasedIndex: number) => void;
  methods: Pick<UseFormReturn<SimpleWizardFormValues>, 'trigger'>;
  setFooterBlockedStepIndex: (index: number | null) => void;
};

/**
 * Validates the current wizard screen before PatternFly advances:
 * — substeps: `trigger` only that step’s field paths
 * — review: `trigger` the full form (same as final submit validation)
 */
export const handleWizardNext = async ({
  activeStep,
  goNext,
  goToStepByIndex,
  methods,
  setFooterBlockedStepIndex,
}: HandleWizardNextParams): Promise<void> => {
  const stepId = String(activeStep.id);
  const paths = WIZARD_SUBSTEP_ID_TO_FIELD_PATHS[stepId];

  if (paths) {
    const valid = await methods.trigger(paths);
    if (!valid) {
      setFooterBlockedStepIndex(activeStep.index);
      return;
    }
    setFooterBlockedStepIndex(null);
    const nextFlat = wizardNextNavigableFlatOneBasedIndex(activeStep.index);
    if (nextFlat != null && goToStepByIndex) {
      goToStepByIndex(nextFlat);
      return;
    }
    await Promise.resolve(goNext());
    return;
  }

  if (stepId === SIMPLE_WIZARD_REVIEW_STEP_ID) {
    const valid = await methods.trigger();
    if (!valid) {
      setFooterBlockedStepIndex(activeStep.index);
      return;
    }
    setFooterBlockedStepIndex(null);
    await Promise.resolve(goNext());
    return;
  }

  setFooterBlockedStepIndex(null);
  await Promise.resolve(goNext());
};

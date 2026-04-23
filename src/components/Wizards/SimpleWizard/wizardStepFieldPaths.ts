import type { FieldPath, FieldErrors } from 'react-hook-form';
import { get } from 'react-hook-form';
import type { SimpleWizardFormValues } from './simpleWizardForm';

/** PatternFly `WizardStep` ids for each substep → RHF field paths validated together on Next. */
export const WIZARD_SUBSTEP_ID_TO_FIELD_PATHS: Record<string, FieldPath<SimpleWizardFormValues>[]> =
  {
    'expand-steps-sub-a': [
      'required.stepA.fullName',
      'required.stepA.selectionA1',
      'required.stepA.selectionA2',
      'required.stepA.selectionA3',
    ],
    'expand-steps-sub-b': [
      'required.stepB.selectionB1',
      'required.stepB.selectionB2',
      'required.stepB.selectionB3',
    ],
    'expand-steps-sub-c': [
      'required.stepC.selectionC1',
      'required.stepC.selectionC2',
      'required.stepC.selectionC3',
    ],
    'expand-steps-sub-d': [
      'required.stepD.selectionD1',
      'required.stepD.selectionD2',
      'required.stepD.selectionD3',
    ],
    'expand-steps-sub-e': ['optional.stepE.optionText1'],
    'expand-steps-sub-f': ['optional.stepF.optionText2'],
  };

export const SIMPLE_WIZARD_REVIEW_STEP_ID = 'review-step';

export const stepFieldsHaveErrors = (
  errors: FieldErrors<SimpleWizardFormValues>,
  paths: FieldPath<SimpleWizardFormValues>[]
): boolean =>
  paths.some((path) => {
    const err = get(errors, path);
    return (
      err != null &&
      typeof err === 'object' &&
      'message' in err &&
      (err as { message?: unknown }).message
    );
  });

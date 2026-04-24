import type { FieldPath } from 'react-hook-form';

import type { SimpleWizardFormValues } from './simpleWizardForm';

/** Every leaf field path — used when validating the whole “Required” group. */
export const ALL_SIMPLE_WIZARD_FIELD_PATHS: FieldPath<SimpleWizardFormValues>[] = [
  'required.stepA.fullName',
  'required.stepA.selectionA1',
  'required.stepA.selectionA2',
  'required.stepA.selectionA3',
  'required.stepB.selectionB1',
  'required.stepB.selectionB2',
  'required.stepB.selectionB3',
  'required.stepC.selectionC1',
  'required.stepC.selectionC2',
  'required.stepC.selectionC3',
  'required.stepD.selectionD1',
  'required.stepD.selectionD2',
  'required.stepD.selectionD3',
  'optional.stepE.optionText1',
  'optional.stepF.optionText2',
];

/** React Hook Form field names to validate when leaving each wizard substep (by {@link WizardStep} `id`). */
export const FIELDS_PER_WIZARD_STEP: Record<string, FieldPath<SimpleWizardFormValues>[]> = {
  /** Parent “Required” nav item — if focused, require all form fields. */
  'required-steps': ALL_SIMPLE_WIZARD_FIELD_PATHS,
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

import * as yup from 'yup';

const selectionRequiredMessage = 'Selection is required';

const nonEmptyString = (message: string) => yup.string().trim().min(1, message);

/** Substep A */
export const simpleWizardStepASchema = yup.object({
  fullName: nonEmptyString('Full name is required'),
  selectionA1: nonEmptyString(selectionRequiredMessage),
  selectionA2: nonEmptyString(selectionRequiredMessage),
  selectionA3: yup.string().default(''),
});

/** Substep B */
export const simpleWizardStepBSchema = yup.object({
  selectionB1: nonEmptyString(selectionRequiredMessage),
  selectionB2: nonEmptyString(selectionRequiredMessage),
  selectionB3: yup.string().default(''),
});

/** Substep C */
export const simpleWizardStepCSchema = yup.object({
  selectionC1: nonEmptyString(selectionRequiredMessage),
  selectionC2: nonEmptyString(selectionRequiredMessage),
  selectionC3: yup.string().default(''),
});

/** Substep D */
export const simpleWizardStepDSchema = yup.object({
  selectionD1: nonEmptyString(selectionRequiredMessage),
  selectionD2: nonEmptyString(selectionRequiredMessage),
  selectionD3: yup.string().default(''),
});

/** Substep E */
export const simpleWizardStepESchema = yup.object({
  optionText1: yup.string().default(''),
});

/** Substep F */
export const simpleWizardStepFSchema = yup.object({
  optionText2: yup.string().default(''),
});

/** Parent "Required": substeps A–D, each with its own schema. */
export const simpleWizardRequiredSectionSchema = yup.object({
  stepA: simpleWizardStepASchema,
  stepB: simpleWizardStepBSchema,
  stepC: simpleWizardStepCSchema,
  stepD: simpleWizardStepDSchema,
});

/** Parent "Optional": substeps E–F, each with its own schema. */
export const simpleWizardOptionalSectionSchema = yup.object({
  stepE: simpleWizardStepESchema,
  stepF: simpleWizardStepFSchema,
});

/** Full wizard form: `required` + `optional`, nested per substep. */
export const simpleWizardFormSchema = yup.object({
  required: simpleWizardRequiredSectionSchema,
  optional: simpleWizardOptionalSectionSchema,
});

export type SimpleWizardFormSchemaValues = yup.InferType<typeof simpleWizardFormSchema>;

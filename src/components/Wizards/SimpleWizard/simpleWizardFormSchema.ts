import * as yup from 'yup';

const selectionRequiredMessage = 'Selection is required';

/** `default('')` so `schema.cast(...)` can seed the form; `min(1)` still enforces required on validate. */
const nonEmptyString = (message: string) => yup.string().default('').trim().min(1, message);

/**
 * Per-substep metadata on each object schema. Read at runtime with `schema.describe().meta` (e.g. to
 * build `WizardStep` id → RHF field paths) so substep id/label live next to the fields they describe.
 */
export type SimpleWizardSubstepSchemaMeta = {
  /** PatternFly `WizardStep` id (e.g. `expand-steps-sub-a`) */
  id: string;
  label: string;
};

const substepMeta = (m: SimpleWizardSubstepSchemaMeta) => m;

/** Substep A */
export const simpleWizardStepASchema = yup
  .object({
    fullName: nonEmptyString('Full name is required'),
    selectionA1: nonEmptyString(selectionRequiredMessage),
    selectionA2: nonEmptyString(selectionRequiredMessage),
    selectionA3: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-a', label: 'Substep A' }));

/** Substep B */
export const simpleWizardStepBSchema = yup
  .object({
    selectionB1: nonEmptyString(selectionRequiredMessage),
    selectionB2: nonEmptyString(selectionRequiredMessage),
    selectionB3: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-b', label: 'Substep B' }));

/** Substep C */
export const simpleWizardStepCSchema = yup
  .object({
    selectionC1: nonEmptyString(selectionRequiredMessage),
    selectionC2: nonEmptyString(selectionRequiredMessage),
    selectionC3: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-c', label: 'Substep C' }));

/** Substep D */
export const simpleWizardStepDSchema = yup
  .object({
    selectionD1: nonEmptyString(selectionRequiredMessage),
    selectionD2: nonEmptyString(selectionRequiredMessage),
    selectionD3: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-d', label: 'Substep D' }));

/** Substep E */
export const simpleWizardStepESchema = yup
  .object({
    optionText1: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-e', label: 'Substep E' }));

/** Substep F */
export const simpleWizardStepFSchema = yup
  .object({
    optionText2: yup.string().default('').trim(),
  })
  .meta(substepMeta({ id: 'expand-steps-sub-f', label: 'Substep F' }));

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

export type SimpleWizardFormValues = yup.InferType<typeof simpleWizardFormSchema>;

/** Initial RHF values derived from schema defaults (see `nonEmptyString` and per-field `.default('')`). */
export const defaultSimpleWizardFormValues: SimpleWizardFormValues = simpleWizardFormSchema.cast(
  { required: {}, optional: {} },
  { assert: false }
);

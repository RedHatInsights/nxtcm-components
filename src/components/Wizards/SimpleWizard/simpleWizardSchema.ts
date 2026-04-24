import { z } from 'zod';
import type { FieldPath } from 'react-hook-form';

const REQUIRED_SELECT_MSG = 'Selection is required';

export const WIZARD_GROUP = {
  required: { id: 'required-steps', name: 'Required' },
  optional: { id: 'optional-steps', name: 'Optional' },
} as const;

export const WIZARD_REVIEW = { id: 'review-step' as const, name: 'Review' as const };

/** Add a substep = one list entry; add a field = edit that entry’s `fields` — everything else is derived. */
type WizardSubstepListItem = {
  group: 'required' | 'optional';
  formKey: string;
  /** PatternFly substep id + display name; also Zod `z.object(…).meta(…)` */
  nav: { id: string; name: string };
  fields: z.ZodRawShape;
};

/* =============================================================================
   Single source: each substep = `nav` + `fields` (and `group` / `formKey` for RHF path).
   ============================================================================= */

/** Avoid re-running async fullName validation when the value is unchanged (e.g. re-submit). */
let lastFullNameAsyncValue: string | undefined;

export const WIZARD_SUBSTEPS = [
  {
    group: 'required' as const,
    formKey: 'stepA' as const,
    nav: { id: 'expand-steps-sub-a', name: 'Substep A' },
    fields: {
      fullName: z
        .string()
        .min(1, { message: 'Full name is required', abort: true })
        .refine(
          async (value) => {
            if (value === lastFullNameAsyncValue) {
              return true;
            }
            // eslint-disable-next-line no-console
            console.log('Starting validation for fullName', value);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // eslint-disable-next-line no-console
            console.log('Validation for fullName completed');

            lastFullNameAsyncValue = value;
            return true;
          },
          {
            message: 'Full name must be unique',
          }
        )
        .default('')
        .meta({ label: 'Full name' }),
      selectionA1: z
        .string()
        .min(1, { message: REQUIRED_SELECT_MSG })
        .default('')
        .meta({ label: 'Selection A1' }),
      selectionA2: z
        .string()
        .min(1, { message: REQUIRED_SELECT_MSG })
        .default('')
        .meta({ label: 'Selection A2' }),
      selectionA3: z.string().default('').meta({ label: 'Selection A3' }),
    } satisfies z.ZodRawShape,
  },
  {
    group: 'required' as const,
    formKey: 'stepB' as const,
    nav: { id: 'expand-steps-sub-b', name: 'Substep B' },
    fields: {
      selectionB1: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionB2: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionB3: z.string().default(''),
    } satisfies z.ZodRawShape,
  },
  {
    group: 'required' as const,
    formKey: 'stepC' as const,
    nav: { id: 'expand-steps-sub-c', name: 'Substep C' },
    fields: {
      selectionC1: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionC2: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionC3: z.string().default(''),
    } satisfies z.ZodRawShape,
  },
  {
    group: 'required' as const,
    formKey: 'stepD' as const,
    nav: { id: 'expand-steps-sub-d', name: 'Substep D' },
    fields: {
      selectionD1: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionD2: z.string().min(1, { message: REQUIRED_SELECT_MSG }).default(''),
      selectionD3: z.string().default(''),
    } satisfies z.ZodRawShape,
  },
  {
    group: 'optional' as const,
    formKey: 'stepE' as const,
    nav: { id: 'expand-steps-sub-e', name: 'Substep E' },
    fields: {
      optionText1: z.string().default(''),
    } satisfies z.ZodRawShape,
  },
  {
    group: 'optional' as const,
    formKey: 'stepF' as const,
    nav: { id: 'expand-steps-sub-f', name: 'Substep F' },
    fields: {
      optionText2: z.string().default(''),
    } satisfies z.ZodRawShape,
  },
] satisfies ReadonlyArray<WizardSubstepListItem>;

/**
 * Output shape for RHF and consumers. The Zod object under `required` / `optional` is built
 * from `WIZARD_SUBSTEPS` at runtime; TypeScript cannot infer nested keys, so the shape is written
 * here explicitly. Keep in sync with `WIZARD_SUBSTEPS` field definitions.
 */
export type SimpleWizardFormValues = {
  required: {
    stepA: { fullName: string; selectionA1: string; selectionA2: string; selectionA3: string };
    stepB: { selectionB1: string; selectionB2: string; selectionB3: string };
    stepC: { selectionC1: string; selectionC2: string; selectionC3: string };
    stepD: { selectionD1: string; selectionD2: string; selectionD3: string };
  };
  optional: {
    stepE: { optionText1: string };
    stepF: { optionText2: string };
  };
};

/* =============================================================================
   Derived: Zod (same nesting as the form: required | optional > formKey > field)
   ============================================================================= */

const stepZod = (d: (typeof WIZARD_SUBSTEPS)[number]): z.ZodObject<z.ZodRawShape> =>
  z
    .object(d.fields)
    .meta({ id: d.nav.id, name: d.nav.name }) as unknown as z.ZodObject<z.ZodRawShape>;

const requiredFormShape: z.ZodRawShape = Object.fromEntries(
  WIZARD_SUBSTEPS.filter((s) => s.group === 'required').map((d) => [d.formKey, stepZod(d)] as const)
) as z.ZodRawShape;

const optionalFormShape: z.ZodRawShape = Object.fromEntries(
  WIZARD_SUBSTEPS.filter((s) => s.group === 'optional').map((d) => [d.formKey, stepZod(d)] as const)
) as z.ZodRawShape;

const requiredGroupSchema = z
  .object(requiredFormShape)
  .meta({ id: WIZARD_GROUP.required.id, name: WIZARD_GROUP.required.name });

const optionalGroupSchema = z
  .object(optionalFormShape)
  .meta({ id: WIZARD_GROUP.optional.id, name: WIZARD_GROUP.optional.name });

export const simpleWizardSchema = z.object({
  required: requiredGroupSchema,
  optional: optionalGroupSchema,
});

export type SimpleWizardRequiredStepsValues = z.infer<typeof requiredGroupSchema>;
export type SimpleWizardOptionalStepsValues = z.infer<typeof optionalGroupSchema>;

export type SimpleWizardStepAValues = SimpleWizardFormValues['required']['stepA'];
export type SimpleWizardStepBValues = SimpleWizardFormValues['required']['stepB'];
export type SimpleWizardStepCValues = SimpleWizardFormValues['required']['stepC'];
export type SimpleWizardStepDValues = SimpleWizardFormValues['required']['stepD'];
export type SimpleWizardStepEValues = SimpleWizardFormValues['optional']['stepE'];
export type SimpleWizardStepFValues = SimpleWizardFormValues['optional']['stepF'];

export type SimpleWizardFormSubkey = (typeof WIZARD_SUBSTEPS)[number]['formKey'];

export const requiredWizardSubsteps = WIZARD_SUBSTEPS.filter((s) => s.group === 'required');
export const optionalWizardSubsteps = WIZARD_SUBSTEPS.filter((s) => s.group === 'optional');

/**
 * Legacy shape `{ stepA: { id, name } }` — same data as `WIZARD_SUBSTEPS[*].formKey` + `nav` (one source:
 * {@link WIZARD_SUBSTEPS} only).
 */
export const WIZARD_SUBSTEP: Record<SimpleWizardFormSubkey, { id: string; name: string }> =
  Object.fromEntries(WIZARD_SUBSTEPS.map((d) => [d.formKey, d.nav] as const)) as Record<
    SimpleWizardFormSubkey,
    { id: string; name: string }
  >;

/* =============================================================================
   RHF: paths + defaults (derived from the same list)
   ============================================================================= */

const rhfPathsForZodObject = (
  formPrefix: string,
  zodObject: z.ZodObject<z.ZodRawShape>
): FieldPath<SimpleWizardFormValues>[] =>
  Object.keys(zodObject.shape).map(
    (key) => `${formPrefix}.${key}` as FieldPath<SimpleWizardFormValues>
  );

const pathsForListItem = (d: (typeof WIZARD_SUBSTEPS)[number]) =>
  rhfPathsForZodObject(
    d.group === 'required' ? `required.${d.formKey}` : `optional.${d.formKey}`,
    stepZod(d)
  );

export const ALL_SIMPLE_WIZARD_FIELD_PATHS: FieldPath<SimpleWizardFormValues>[] =
  WIZARD_SUBSTEPS.flatMap((d) => pathsForListItem(d));

export const FIELDS_PER_WIZARD_STEP: Record<string, FieldPath<SimpleWizardFormValues>[]> = (() => {
  const m: Record<string, FieldPath<SimpleWizardFormValues>[]> = {
    [WIZARD_GROUP.required.id]: ALL_SIMPLE_WIZARD_FIELD_PATHS,
  };
  for (const d of WIZARD_SUBSTEPS) {
    m[d.nav.id] = pathsForListItem(d);
  }
  return m;
})();

function defaultStringsFromZodObject<T extends z.ZodObject<z.ZodRawShape>>(
  zodObject: T
): z.infer<T> {
  return Object.fromEntries(Object.keys(zodObject.shape).map((k) => [k, ''])) as z.infer<T>;
}

export const defaultSimpleWizardFormValues: SimpleWizardFormValues = (() => {
  const buildGroup = (g: 'required' | 'optional') =>
    Object.fromEntries(
      WIZARD_SUBSTEPS.filter((d) => d.group === g).map((d) => [
        d.formKey,
        defaultStringsFromZodObject(stepZod(d)),
      ])
    );
  return {
    required: buildGroup('required'),
    optional: buildGroup('optional'),
  } as SimpleWizardFormValues;
})();

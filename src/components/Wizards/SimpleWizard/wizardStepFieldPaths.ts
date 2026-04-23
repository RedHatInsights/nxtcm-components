import type { FieldPath, FieldErrors } from 'react-hook-form';
import { get } from 'react-hook-form';
import type {
  SimpleWizardFormValues,
  SimpleWizardSubstepSchemaMeta,
} from './simpleWizardFormSchema';
import {
  simpleWizardOptionalSectionSchema,
  simpleWizardRequiredSectionSchema,
} from './simpleWizardFormSchema';

/**
 * Minimal Yup object-schema surface used here: `fields` for RHF path keys, `describe().meta` for
 * per-substep wizard id/label.
 */
type YupObjectSchemaLike = {
  readonly fields: Record<string, unknown>;
  describe: () => { meta?: unknown };
};

/** RHF paths under `pathPrefix` from a Yup object schema’s `fields` (same keys as the schema definition). */
const fieldPathsFromYupObject = (
  pathPrefix: string,
  schema: YupObjectSchemaLike
): FieldPath<SimpleWizardFormValues>[] =>
  Object.keys(schema.fields).map(
    (key) => `${pathPrefix}.${key}` as FieldPath<SimpleWizardFormValues>
  );

const isSubstepMeta = (v: unknown): v is SimpleWizardSubstepSchemaMeta => {
  if (v == null || typeof v !== 'object') return false;
  const o = v as { id?: unknown; label?: unknown };
  return typeof o.id === 'string' && typeof o.label === 'string';
};

const substepSchemaMeta = (
  childSchema: YupObjectSchemaLike
): SimpleWizardSubstepSchemaMeta | undefined => {
  const m = childSchema.describe().meta;
  return isSubstepMeta(m) ? m : undefined;
};

/**
 * Uses each child schema’s `.meta({ id, label })` (via `describe().meta`) so the wizard nav map stays
 * aligned with the Yup form shape in `simpleWizardRequiredSectionSchema` / `simpleWizardOptionalSectionSchema`.
 */
const substepNavForSection = (
  formPathPrefix: 'required' | 'optional',
  section: YupObjectSchemaLike
): {
  idToPaths: Record<string, FieldPath<SimpleWizardFormValues>[]>;
  idToLabel: Record<string, string>;
  orderedIds: string[];
} => {
  const idToPaths: Record<string, FieldPath<SimpleWizardFormValues>[]> = {};
  const idToLabel: Record<string, string> = {};
  const orderedIds: string[] = [];

  for (const key of Object.keys(section.fields)) {
    const childSchema = section.fields[key] as YupObjectSchemaLike;
    const meta = substepSchemaMeta(childSchema);
    if (meta == null) {
      throw new Error(
        `SimpleWizard: yup .meta({ id, label }) is required on the object schema at "${formPathPrefix}.${key}"`
      );
    }
    const pathPrefix = `${formPathPrefix}.${key}`;
    idToPaths[meta.id] = fieldPathsFromYupObject(pathPrefix, childSchema);
    idToLabel[meta.id] = meta.label;
    orderedIds.push(meta.id);
  }

  return { idToPaths, idToLabel, orderedIds };
};

const requiredNav = substepNavForSection('required', simpleWizardRequiredSectionSchema);
const optionalNav = substepNavForSection('optional', simpleWizardOptionalSectionSchema);

/** PatternFly `WizardStep` ids for each substep → RHF field paths validated together on Next. */
export const WIZARD_SUBSTEP_ID_TO_FIELD_PATHS: Record<string, FieldPath<SimpleWizardFormValues>[]> =
  {
    ...requiredNav.idToPaths,
    ...optionalNav.idToPaths,
  };

/** Nav `name` for each `WizardStep` id, from the same yup meta as the field-path map. */
export const WIZARD_SUBSTEP_ID_TO_LABEL: Record<string, string> = {
  ...requiredNav.idToLabel,
  ...optionalNav.idToLabel,
};

export const SIMPLE_WIZARD_REVIEW_STEP_ID = 'review-step';

/** Substep ids under the expandable "Required" group (A–D), in schema key order. */
export const WIZARD_REQUIRED_SUBSTEP_IDS = requiredNav.orderedIds;

/** Substep ids under the expandable "Optional" group (E–F), in schema key order. */
export const WIZARD_OPTIONAL_SUBSTEP_IDS = optionalNav.orderedIds;

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

/** Nav `status` for a single substep from current RHF errors. */
export const wizardSubstepNavStatus = (
  errors: FieldErrors<SimpleWizardFormValues>,
  substepId: string
): 'default' | 'error' => {
  const paths = WIZARD_SUBSTEP_ID_TO_FIELD_PATHS[substepId];
  if (!paths) return 'default';
  return stepFieldsHaveErrors(errors, paths) ? 'error' : 'default';
};

/** Nav `status` for an expandable parent when any listed substep has errors. */
export const wizardExpandableParentNavStatus = (
  errors: FieldErrors<SimpleWizardFormValues>,
  substepIds: readonly string[]
): 'default' | 'error' =>
  substepIds.some((id) => wizardSubstepNavStatus(errors, id) === 'error') ? 'error' : 'default';

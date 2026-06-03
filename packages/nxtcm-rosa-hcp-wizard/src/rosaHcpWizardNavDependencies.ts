import { listWizardFieldResetEntries } from './yupSchemas/wizardFieldMetaChangeRegistry';

/**
 * Form fields with Yup `resetsFieldsToDefaultOnChange`. Changing one of these on the active step
 * (with user engagement) blocks forward nav to visited steps.
 */
export const ROSA_HCP_NAV_RESET_SOURCE_FIELDS: readonly string[] =
  listWizardFieldResetEntries().map((entry) => entry.sourceField);

/** Fields that run async Yup tests; forward nav is blocked while validation is in flight. */
export const ROSA_HCP_ASYNC_VALIDATED_FIELD_PATHS: readonly string[] = ['name'];

import { listWizardFieldRefetchEntries } from './wizardFieldRefetchRegistry';
import { listWizardFieldResetEntries } from './wizardFieldResetRegistry';
import type { WizardFormFieldName } from './types';

/** Sorted form fields that declare reset or refetch metadata in Yup `.meta()`. */
export function listWizardFieldMetaChangeSourceFields(): WizardFormFieldName[] {
  const fields = new Set<WizardFormFieldName>();
  for (const { sourceField } of listWizardFieldResetEntries()) {
    fields.add(sourceField);
  }
  for (const { sourceField } of listWizardFieldRefetchEntries()) {
    fields.add(sourceField);
  }
  return [...fields].sort((a, b) => a.localeCompare(b));
}

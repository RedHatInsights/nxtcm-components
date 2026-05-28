import { listWizardFieldDerivedSyncEntries } from './wizardFieldDerivedSyncRegistry';
import { listWizardFieldRefetchEntries } from './wizardFieldRefetchRegistry';
import { listWizardFieldResetEntries } from './wizardFieldResetRegistry';
import { listWizardFieldSyncEntries } from './wizardFieldSyncRegistry';
import type { WizardFormFieldName } from './types';

/** Sorted form fields that declare reset, refetch, sync, or derived-sync metadata in Yup `.meta()`. */
export function listWizardFieldMetaChangeSourceFields(): WizardFormFieldName[] {
  const fields = new Set<WizardFormFieldName>();
  for (const { sourceField } of listWizardFieldResetEntries()) {
    fields.add(sourceField);
  }
  for (const { sourceField } of listWizardFieldRefetchEntries()) {
    fields.add(sourceField);
  }
  for (const { sourceField } of listWizardFieldSyncEntries()) {
    fields.add(sourceField);
  }
  for (const { sourceField } of listWizardFieldDerivedSyncEntries()) {
    fields.add(sourceField);
  }
  return [...fields].sort((a, b) => a.localeCompare(b));
}

import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type { WizardFormFieldName } from './types';

export type WizardFieldResetEntry = {
  sourceField: WizardFormFieldName;
  targetFields: readonly WizardFormFieldName[];
};

function readResetEntries(): WizardFieldResetEntry[] {
  const entries: WizardFieldResetEntry[] = [];
  for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
    const targetFields = readWizardFieldMeta(fieldSchema)?.resetsFieldsToDefaultOnChange;
    if (targetFields?.length) {
      entries.push({
        sourceField: fieldName as WizardFormFieldName,
        targetFields,
      });
    }
  }
  return entries;
}

let resetRegistry: Map<WizardFormFieldName, readonly WizardFormFieldName[]> | undefined;

export function buildWizardFieldResetRegistry(): Map<
  WizardFormFieldName,
  readonly WizardFormFieldName[]
> {
  const map = new Map<WizardFormFieldName, readonly WizardFormFieldName[]>();
  for (const { sourceField, targetFields } of readResetEntries()) {
    map.set(sourceField, targetFields);
  }
  return map;
}

function getResetRegistry(): Map<WizardFormFieldName, readonly WizardFormFieldName[]> {
  resetRegistry ??= buildWizardFieldResetRegistry();
  return resetRegistry;
}

export function getWizardFieldResetsForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardFormFieldName[] {
  return getResetRegistry().get(sourceField) ?? [];
}

export function listWizardFieldResetEntries(): WizardFieldResetEntry[] {
  return readResetEntries();
}

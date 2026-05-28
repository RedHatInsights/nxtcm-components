import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type { WizardFieldSyncOnChange, WizardFormFieldName } from './types';

export type WizardFieldSyncEntry = {
  sourceField: WizardFormFieldName;
  syncs: readonly WizardFieldSyncOnChange[];
};

function readSyncEntries(): WizardFieldSyncEntry[] {
  const entries: WizardFieldSyncEntry[] = [];
  for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
    const syncs = readWizardFieldMeta(fieldSchema)?.syncsFieldsOnChange;
    if (syncs?.length) {
      entries.push({
        sourceField: fieldName as WizardFormFieldName,
        syncs,
      });
    }
  }
  return entries;
}

let syncRegistry: Map<WizardFormFieldName, readonly WizardFieldSyncOnChange[]> | undefined;

export function buildWizardFieldSyncRegistry(): Map<
  WizardFormFieldName,
  readonly WizardFieldSyncOnChange[]
> {
  const map = new Map<WizardFormFieldName, readonly WizardFieldSyncOnChange[]>();
  for (const { sourceField, syncs } of readSyncEntries()) {
    map.set(sourceField, syncs);
  }
  return map;
}

function getSyncRegistry(): Map<WizardFormFieldName, readonly WizardFieldSyncOnChange[]> {
  syncRegistry ??= buildWizardFieldSyncRegistry();
  return syncRegistry;
}

export function getWizardFieldSyncsForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardFieldSyncOnChange[] {
  return getSyncRegistry().get(sourceField) ?? [];
}

export function listWizardFieldSyncEntries(): WizardFieldSyncEntry[] {
  return readSyncEntries();
}

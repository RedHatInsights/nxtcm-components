import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type { WizardFieldDerivedSyncKey, WizardFormFieldName } from './types';

export type WizardFieldDerivedSyncEntry = {
  sourceField: WizardFormFieldName;
  syncKey: WizardFieldDerivedSyncKey;
};

function readDerivedSyncEntries(): WizardFieldDerivedSyncEntry[] {
  const entries: WizardFieldDerivedSyncEntry[] = [];
  for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
    const syncKey = readWizardFieldMeta(fieldSchema)?.derivedFieldsSyncOnChange;
    if (syncKey) {
      entries.push({
        sourceField: fieldName as WizardFormFieldName,
        syncKey,
      });
    }
  }
  return entries;
}

let derivedSyncEntriesCache: WizardFieldDerivedSyncEntry[] | undefined;
let derivedSyncRegistry: Map<WizardFormFieldName, WizardFieldDerivedSyncKey> | undefined;

export function buildWizardFieldDerivedSyncRegistry(): Map<
  WizardFormFieldName,
  WizardFieldDerivedSyncKey
> {
  const map = new Map<WizardFormFieldName, WizardFieldDerivedSyncKey>();
  for (const { sourceField, syncKey } of listWizardFieldDerivedSyncEntries()) {
    map.set(sourceField, syncKey);
  }
  return map;
}

function getDerivedSyncRegistry(): Map<WizardFormFieldName, WizardFieldDerivedSyncKey> {
  derivedSyncRegistry ??= buildWizardFieldDerivedSyncRegistry();
  return derivedSyncRegistry;
}

export function getWizardFieldDerivedSyncKeyForSourceField(
  sourceField: WizardFormFieldName
): WizardFieldDerivedSyncKey | undefined {
  return getDerivedSyncRegistry().get(sourceField);
}

export function listWizardFieldDerivedSyncEntries(): WizardFieldDerivedSyncEntry[] {
  derivedSyncEntriesCache ??= readDerivedSyncEntries();
  return derivedSyncEntriesCache;
}

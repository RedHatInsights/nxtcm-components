import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type {
  WizardFieldDerivedSyncKey,
  WizardFieldSyncOnChange,
  WizardFormFieldName,
  WizardResourceRefetchOnChange,
} from './types';

export type WizardFieldResetEntry = {
  sourceField: WizardFormFieldName;
  targetFields: readonly WizardFormFieldName[];
};

export type WizardFieldRefetchEntry = {
  sourceField: WizardFormFieldName;
  refetches: readonly WizardResourceRefetchOnChange[];
};

export type WizardFieldSyncEntry = {
  sourceField: WizardFormFieldName;
  syncs: readonly WizardFieldSyncOnChange[];
};

export type WizardFieldDerivedSyncEntry = {
  sourceField: WizardFormFieldName;
  syncKey: WizardFieldDerivedSyncKey;
};

type WizardFieldMetaChangeRegistry = {
  sourceFields: WizardFormFieldName[];
  resets: Map<WizardFormFieldName, readonly WizardFormFieldName[]>;
  refetches: Map<WizardFormFieldName, readonly WizardResourceRefetchOnChange[]>;
  syncs: Map<WizardFormFieldName, readonly WizardFieldSyncOnChange[]>;
  derivedSync: Map<WizardFormFieldName, WizardFieldDerivedSyncKey>;
  resetEntries: WizardFieldResetEntry[];
  refetchEntries: WizardFieldRefetchEntry[];
  syncEntries: WizardFieldSyncEntry[];
  derivedSyncEntries: WizardFieldDerivedSyncEntry[];
};

function buildWizardFieldMetaChangeRegistry(): WizardFieldMetaChangeRegistry {
  const resets = new Map<WizardFormFieldName, readonly WizardFormFieldName[]>();
  const refetches = new Map<WizardFormFieldName, readonly WizardResourceRefetchOnChange[]>();
  const syncs = new Map<WizardFormFieldName, readonly WizardFieldSyncOnChange[]>();
  const derivedSync = new Map<WizardFormFieldName, WizardFieldDerivedSyncKey>();
  const sourceFieldSet = new Set<WizardFormFieldName>();
  const resetEntries: WizardFieldResetEntry[] = [];
  const refetchEntries: WizardFieldRefetchEntry[] = [];
  const syncEntries: WizardFieldSyncEntry[] = [];
  const derivedSyncEntries: WizardFieldDerivedSyncEntry[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
    const meta = readWizardFieldMeta(fieldSchema);
    if (!meta) {
      continue;
    }

    const sourceField = fieldName as WizardFormFieldName;

    if (meta.resetsFieldsToDefaultOnChange?.length) {
      resets.set(sourceField, meta.resetsFieldsToDefaultOnChange);
      resetEntries.push({ sourceField, targetFields: meta.resetsFieldsToDefaultOnChange });
      sourceFieldSet.add(sourceField);
    }

    if (meta.refetchesResourcesOnChange?.length) {
      refetches.set(sourceField, meta.refetchesResourcesOnChange);
      refetchEntries.push({ sourceField, refetches: meta.refetchesResourcesOnChange });
      sourceFieldSet.add(sourceField);
    }

    if (meta.syncsFieldsOnChange?.length) {
      syncs.set(sourceField, meta.syncsFieldsOnChange);
      syncEntries.push({ sourceField, syncs: meta.syncsFieldsOnChange });
      sourceFieldSet.add(sourceField);
    }

    if (meta.derivedFieldsSyncOnChange) {
      derivedSync.set(sourceField, meta.derivedFieldsSyncOnChange);
      derivedSyncEntries.push({ sourceField, syncKey: meta.derivedFieldsSyncOnChange });
      sourceFieldSet.add(sourceField);
    }
  }

  return {
    sourceFields: [...sourceFieldSet].sort((a, b) => a.localeCompare(b)),
    resets,
    refetches,
    syncs,
    derivedSync,
    resetEntries,
    refetchEntries,
    syncEntries,
    derivedSyncEntries,
  };
}

let registryCache: WizardFieldMetaChangeRegistry | undefined;

function getWizardFieldMetaChangeRegistry(): WizardFieldMetaChangeRegistry {
  registryCache ??= buildWizardFieldMetaChangeRegistry();
  return registryCache;
}

/** Sorted form fields that declare reset, refetch, sync, or derived-sync metadata in Yup `.meta()`. */
export function listWizardFieldMetaChangeSourceFields(): WizardFormFieldName[] {
  return getWizardFieldMetaChangeRegistry().sourceFields;
}

export function getWizardFieldResetsForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardFormFieldName[] {
  return getWizardFieldMetaChangeRegistry().resets.get(sourceField) ?? [];
}

export function listWizardFieldResetEntries(): WizardFieldResetEntry[] {
  return getWizardFieldMetaChangeRegistry().resetEntries;
}

export function getWizardResourceRefetchesForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardResourceRefetchOnChange[] {
  return getWizardFieldMetaChangeRegistry().refetches.get(sourceField) ?? [];
}

export function listWizardFieldRefetchEntries(): WizardFieldRefetchEntry[] {
  return getWizardFieldMetaChangeRegistry().refetchEntries;
}

export function getWizardFieldSyncsForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardFieldSyncOnChange[] {
  return getWizardFieldMetaChangeRegistry().syncs.get(sourceField) ?? [];
}

export function listWizardFieldSyncEntries(): WizardFieldSyncEntry[] {
  return getWizardFieldMetaChangeRegistry().syncEntries;
}

export function getWizardFieldDerivedSyncKeyForSourceField(
  sourceField: WizardFormFieldName
): WizardFieldDerivedSyncKey | undefined {
  return getWizardFieldMetaChangeRegistry().derivedSync.get(sourceField);
}

export function listWizardFieldDerivedSyncEntries(): WizardFieldDerivedSyncEntry[] {
  return getWizardFieldMetaChangeRegistry().derivedSyncEntries;
}

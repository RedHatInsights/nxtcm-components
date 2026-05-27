import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type { WizardFormFieldName, WizardResourceRefetchOnChange } from './types';

export type WizardFieldRefetchEntry = {
  sourceField: WizardFormFieldName;
  refetches: readonly WizardResourceRefetchOnChange[];
};

function readRefetchEntries(): WizardFieldRefetchEntry[] {
  const entries: WizardFieldRefetchEntry[] = [];
  for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
    const refetches = readWizardFieldMeta(fieldSchema)?.refetchesResourcesOnChange;
    if (refetches?.length) {
      entries.push({
        sourceField: fieldName as WizardFormFieldName,
        refetches,
      });
    }
  }
  return entries;
}

let refetchRegistry: Map<WizardFormFieldName, readonly WizardResourceRefetchOnChange[]> | undefined;

export function buildWizardFieldRefetchRegistry(): Map<
  WizardFormFieldName,
  readonly WizardResourceRefetchOnChange[]
> {
  const map = new Map<WizardFormFieldName, readonly WizardResourceRefetchOnChange[]>();
  for (const { sourceField, refetches } of readRefetchEntries()) {
    map.set(sourceField, refetches);
  }
  return map;
}

function getRefetchRegistry(): Map<WizardFormFieldName, readonly WizardResourceRefetchOnChange[]> {
  refetchRegistry ??= buildWizardFieldRefetchRegistry();
  return refetchRegistry;
}

export function getWizardResourceRefetchesForSourceField(
  sourceField: WizardFormFieldName
): readonly WizardResourceRefetchOnChange[] {
  return getRefetchRegistry().get(sourceField) ?? [];
}

export function listWizardFieldRefetchEntries(): WizardFieldRefetchEntry[] {
  return readRefetchEntries();
}

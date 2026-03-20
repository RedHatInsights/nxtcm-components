/**
 * Merge helpers for RosaWizard string bundles.
 *
 * - **Types:** {@link ./rosaWizardStrings.types}
 * - **Default English copy (safe to copy into your app for translation):** {@link ./rosaWizardStrings.defaults}
 *
 * Pass partial `strings` into {@link RosaWizard} or {@link RosaWizardStringsProvider}; omitted keys
 * are filled from {@link defaultRosaWizardStrings} and {@link defaultRosaWizardValidatorStrings}.
 */

import type {
  DeepPartial,
  RosaWizardStrings,
  RosaWizardStringsInput,
  RosaWizardValidatorStrings,
} from './rosaWizardStrings.types';
import {
  defaultRosaWizardStrings,
  defaultRosaWizardValidatorStrings,
} from './rosaWizardStrings.defaults';

export * from './rosaWizardStrings.types';
export * from './rosaWizardStrings.defaults';

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function mergeDeep<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(patch) as (keyof T & string)[]) {
    const baseVal = (base as Record<string, unknown>)[key];
    const patchVal = (patch as Record<string, unknown>)[key];
    if (patchVal === undefined) continue;
    if (isPlainRecord(baseVal) && isPlainRecord(patchVal)) {
      result[key] = mergeDeep(baseVal, patchVal as DeepPartial<typeof baseVal>);
    } else {
      result[key] = patchVal;
    }
  }
  return result as T;
}

export function mergeRosaWizardStrings(
  partial?: DeepPartial<RosaWizardStrings>
): RosaWizardStrings {
  return mergeDeep(defaultRosaWizardStrings, partial);
}

export function mergeRosaWizardValidatorStrings(
  partial?: DeepPartial<RosaWizardValidatorStrings>
): RosaWizardValidatorStrings {
  return mergeDeep(defaultRosaWizardValidatorStrings, partial);
}

export function buildRosaWizardStringBundles(input?: RosaWizardStringsInput): {
  strings: RosaWizardStrings;
  validators: RosaWizardValidatorStrings;
} {
  const { validators: vPartial, ...rest } = input ?? {};
  return {
    strings: mergeRosaWizardStrings(rest),
    validators: mergeRosaWizardValidatorStrings(vPartial),
  };
}

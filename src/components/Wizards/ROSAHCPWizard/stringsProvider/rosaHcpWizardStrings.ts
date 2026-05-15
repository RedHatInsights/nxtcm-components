/**
 * Merge helpers for RosaHcpWizard string bundles.
 *
 * - **Types:** {@link ./rosaHcpWizardStrings.types}
 * - **Default English copy (safe to copy into your app for translation):** {@link ./rosaHcpWizardStrings.defaults}
 *
 * Pass partial `strings` into {@link RosaHCPWizard} or {@link RosaHcpWizardStringsProvider}; omitted keys
 * are filled from {@link defaultRosaHcpWizardStrings} and {@link defaultRosaHcpWizardValidatorStrings}.
 */

import type {
  DeepPartial,
  RosaHcpWizardStrings,
  RosaHcpWizardStringsInput,
  RosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.types';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';

export * from './rosaHcpWizardStrings.types';
export * from './rosaHcpWizardStrings.defaults';

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

export function mergeRosaHcpWizardStrings(
  partial?: DeepPartial<RosaHcpWizardStrings>
): RosaHcpWizardStrings {
  return mergeDeep(defaultRosaHcpWizardStrings, partial);
}

export function mergeRosaHcpWizardValidatorStrings(
  partial?: DeepPartial<RosaHcpWizardValidatorStrings>
): RosaHcpWizardValidatorStrings {
  return mergeDeep(defaultRosaHcpWizardValidatorStrings, partial);
}

export function buildRosaHcpWizardStringBundles(input?: RosaHcpWizardStringsInput): {
  strings: RosaHcpWizardStrings;
  validators: RosaHcpWizardValidatorStrings;
} {
  const { validators: vPartial, ...rest } = input ?? {};
  return {
    strings: mergeRosaHcpWizardStrings(rest),
    validators: mergeRosaHcpWizardValidatorStrings(vPartial),
  };
}

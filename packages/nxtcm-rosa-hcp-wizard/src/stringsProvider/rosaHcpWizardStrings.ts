/**
 * Merge helpers for RosaHcpWizard string bundles.
 *
 * - **Types:** {@link ./rosaHcpWizardStrings.types}
 * - **Default English copy (safe to copy into your app for translation):** {@link ./rosaHcpWizardStrings.defaults}
 *
 * Pass partial `strings` into {@link RosaHCPWizard} or {@link RosaHcpWizardStringsProvider}; omitted keys
 * are filled from {@link defaultRosaHcpWizardStrings} and {@link defaultRosaHcpWizardValidatorStrings}.
 */

import { isObjectRecord } from '../utilities/typeGuards';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';
import type {
  DeepPartial,
  RosaHcpWizardStrings,
  RosaHcpWizardStringsInput,
  RosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.types';

export * from './rosaHcpWizardStrings.types';
export * from './rosaHcpWizardStrings.defaults';

function mergeDeep<T extends object>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  const result = { ...base };
  for (const key in patch) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    const baseVal = base[key];
    const patchVal = patch[key];
    if (patchVal === undefined) continue;
    if (isObjectRecord(baseVal) && isObjectRecord(patchVal)) {
      result[key] = mergeDeep(baseVal, patchVal as DeepPartial<typeof baseVal>);
    } else {
      // DeepPartial preserves leaf types; TypeScript cannot narrow its conditional
      // mapped type after the recursive object branch has been ruled out.
      result[key] = patchVal as T[typeof key];
    }
  }
  return result;
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

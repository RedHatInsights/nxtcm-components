/**
 * Merge helpers for RosaWizard string bundles.
 *
 * - **Types:** {@link ./rosaWizardStrings.types}
 * - **Default English copy (safe to copy into your app for translation):** {@link ./rosaWizardStrings.defaults}
 *
 * Pass partial `strings` into {@link RosaWizard} or {@link RosaWizardStringsProvider}; omitted keys
 * are filled from {@link defaultRosaWizardStrings} and {@link defaultRosaWizardValidatorStrings}.
 */

import {
  defaultWizardFooterStrings,
  type WizardFooterStrings,
} from './wizardFooterStrings';
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
  const { validators: vPartial, formWizard: _formWizard, ...rest } = input ?? {};
  return {
    strings: mergeRosaWizardStrings(rest),
    validators: mergeRosaWizardValidatorStrings(vPartial),
  };
}

/**
 * Merged strings for the wizard footer / shared chrome. Aligns `reviewLabel` with Rosa’s review
 * step nav label after optional `strings.formWizard` overrides.
 */
export function buildWizardStringsForRosa(
  rosa: RosaWizardStrings,
  formWizardPartial?: DeepPartial<WizardFooterStrings>
): WizardFooterStrings {
  const base = mergeDeep(defaultWizardFooterStrings, formWizardPartial);
  return mergeDeep(base, { reviewLabel: rosa.wizard.stepLabels.review });
}

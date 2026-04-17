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

/** Re-exports RosaWizard string and validator TypeScript types for consumers and localization. */
export * from './rosaWizardStrings.types';
/** Re-exports default English UI and validation string objects. */
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

/** Deep-merges partial UI strings with {@link defaultRosaWizardStrings} to produce a full bundle. */
export function mergeRosaWizardStrings(
  partial?: DeepPartial<RosaWizardStrings>
): RosaWizardStrings {
  return mergeDeep(defaultRosaWizardStrings, partial);
}

/** Deep-merges partial validator messages with {@link defaultRosaWizardValidatorStrings}. */
export function mergeRosaWizardValidatorStrings(
  partial?: DeepPartial<RosaWizardValidatorStrings>
): RosaWizardValidatorStrings {
  return mergeDeep(defaultRosaWizardValidatorStrings, partial);
}

/**
 * Builds merged `strings` and `validators` bundles from optional partial input, including legacy
 * `formWizard` chrome field mapping into `wizard.chrome`.
 */
export function buildRosaWizardStringBundles(input?: RosaWizardStringsInput): {
  strings: RosaWizardStrings;
  validators: RosaWizardValidatorStrings;
} {
  const { validators: vPartial, formWizard, ...rest } = input ?? {};

  const chromeFromFormWizard = formWizard
    ? {
        nextButtonText: formWizard.nextButtonText,
        backButtonText: formWizard.backButtonText,
        cancelButtonText: formWizard.cancelButtonText,
        submitButtonText: formWizard.submitButtonText,
      }
    : undefined;

  const stringPartial: DeepPartial<RosaWizardStrings> = chromeFromFormWizard
    ? mergeDeep(rest, { wizard: { chrome: chromeFromFormWizard } })
    : rest;

  return {
    strings: mergeRosaWizardStrings(stringPartial),
    validators: mergeRosaWizardValidatorStrings(vPartial),
  };
}

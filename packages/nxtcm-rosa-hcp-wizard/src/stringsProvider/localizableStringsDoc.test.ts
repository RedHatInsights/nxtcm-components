/**
 * Guards docs/localizable-strings.md against the English string defaults.
 * Adding a key to either defaults object fails this file until the catalog names it.
 */
import fs from 'fs';
import path from 'path';

import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';

/**
 * Walks a string bundle and returns a dotted path for each leaf.
 * Nested objects keep being walked. Strings, numbers, functions, and arrays stop the walk,
 * so `daysOfWeek` and validator formatters count as one key each rather than as their contents.
 * `prefix` is the path already built by the caller. The first call passes `''`.
 */
function collectLeafPaths(value: unknown, prefix: string): string[] {
  if (
    typeof value === 'function' ||
    Array.isArray(value) ||
    value === null ||
    typeof value !== 'object'
  ) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/**
 * Returns the markdown from `startHeading` up to, but not including, `endHeading`.
 * Used to check the "safe to omit" section on its own, so a key mentioned later in a
 * table does not satisfy this check. Throws when either heading is missing.
 */
function sectionBetween(doc: string, startHeading: string, endHeading: string): string {
  const start = doc.indexOf(startHeading);
  const end = doc.indexOf(endHeading, start + startHeading.length);
  if (start === -1 || end === -1) {
    throw new Error(`Missing heading range ${startHeading} .. ${endHeading}`);
  }
  return doc.slice(start, end);
}

describe('localizable strings reference', () => {
  const doc = fs.readFileSync(path.join(__dirname, '../../docs/localizable-strings.md'), 'utf8');

  const uiLeaves = collectLeafPaths(defaultRosaHcpWizardStrings, '');
  const validatorLeaves = collectLeafPaths(defaultRosaHcpWizardValidatorStrings, 'validators');

  /** Fails with the dotted paths that the catalog no longer mentions in backticks. */
  it('lists every UI and validator key', () => {
    const missing = [...uiLeaves, ...validatorLeaves].filter((key) => !doc.includes(`\`${key}\``));
    expect(missing).toEqual([]);
  });

  /** Fails when a top-level UI or validator section has no `###` heading of its own. */
  it('lists every top-level section', () => {
    const missingHeadings = [
      ...Object.keys(defaultRosaHcpWizardStrings).map((key) => `### \`${key}\``),
      ...Object.keys(defaultRosaHcpWizardValidatorStrings).map(
        (key) => `### \`validators.${key}\``
      ),
    ].filter((heading) => !doc.includes(heading));
    expect(missingHeadings).toEqual([]);
  });

  /**
   * Checks only the omit section. Hidden proxy and cluster-updates keys must be named there,
   * and so must `validators.commonRequired`, which stays required when those steps are hidden.
   */
  it('names the string sections that hidden steps make safe to omit', () => {
    const omitSection = sectionBetween(doc, '## Sections safe to omit', '## UI strings');

    expect(omitSection).toContain('STEP_IDS.CLUSTER_WIDE_PROXY');
    expect(omitSection).toContain('STEP_IDS.CLUSTER_UPDATES');
    expect(omitSection).toContain('`clusterWideProxy`');
    expect(omitSection).toContain('`validators.url`');
    expect(omitSection).toContain('`validators.noProxyDomains`');
    expect(omitSection).toContain('`validators.ca`');
    expect(omitSection).toContain('`validators.proxyConfigureAtLeastOne`');
    expect(omitSection).toContain('`wizard.stepLabels.clusterWideProxy`');
    expect(omitSection).toContain('`networking.proxyCheckboxLabel`');
    expect(omitSection).toContain('`networking.proxyCheckboxHelp`');
    expect(omitSection).toContain('`networking.proxyNextStepInfo`');
    expect(omitSection).toContain('`clusterUpdates`');
    expect(omitSection).toContain('`wizard.stepLabels.clusterUpdatesOptional`');
    expect(omitSection).toContain('`review.updateStrategy`');
    expect(omitSection).toContain('`review.strategyIndividual`');
    expect(omitSection).toContain('`review.strategyAutomatic`');
    expect(omitSection).toContain('`validators.commonRequired`');
  });
});

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
 * Throws when either heading is missing.
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

  /** The omit section explains the two hidden steps and does not repeat the per-key lists. */
  it('explains which hidden steps make strings safe to omit', () => {
    const omitSection = sectionBetween(doc, '## Sections safe to omit', '## UI strings');

    expect(omitSection).toContain('STEP_IDS.CLUSTER_WIDE_PROXY');
    expect(omitSection).toContain('STEP_IDS.CLUSTER_UPDATES');
    expect(omitSection).toContain('`validators.commonRequired`');
    expect(omitSection).toContain('FIELD_NAME.NODES_COMPUTE');
    expect(omitSection).toContain('`wizard.stepLabels.additionalSetup`');
    expect(omitSection).not.toContain('`networking.proxyCheckboxLabel`');
    expect(omitSection).not.toContain('`review.updateStrategy`');
  });
});

/**
 * Guards docs/localizable-strings.md against the English string defaults.
 * Adding a key, moving it to another section, or changing its English default fails this file.
 */
import fs from 'fs';
import path from 'path';

import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';

type CatalogRow = {
  key: string;
  english: string;
  notes: string;
  section: string;
  signature: string;
};

const NOT_READ_KEYS = [
  'yamlEditor.description',
  'yamlEditor.convertError',
  'yamlEditor.invalidYaml',
  'rolesAndPolicies.supportPlaceholder',
  'rolesAndPolicies.workerPlaceholder',
  'rolesAndPolicies.copyHover',
  'rolesAndPolicies.copyClicked',
  'networking.proxyNextStepInfo',
  'machinePools.machinePoolLabel',
  'machinePools.addPoolButton',
  'machinePools.settingsSectionLabel',
  'machinePools.rootDiskHelp',
  'machinePools.securityGroupsToggle',
  'autoscaling.title',
  'securityGroups.refreshLink',
  'securityGroups.selectAriaLabelledBy',
  'encryption.etcdTitle',
  'review.detailsToggle',
  'review.rolesToggle',
  'review.networkingToggle',
  'review.encryptionToggle',
  'review.optionalNetworkingToggle',
  'review.clusterUpdatesToggle',
  'review.clusterName',
  'review.openShiftVersion',
  'review.awsInfra',
  'review.awsBilling',
  'review.region',
  'review.installerRole',
  'review.oidcConfigId',
  'review.operatorPrefix',
  'review.publicSubnet',
  'review.installVpc',
  'review.instanceType',
  'review.computeCount',
  'review.machinePoolsHeading',
  'review.additionalEtcd',
  'review.encryptionKeys',
  'review.machineCidr',
  'review.serviceCidr',
  'review.podCidr',
  'review.hostPrefix',
  'review.autoscalingMinPrefix',
  'review.autoscalingMaxPrefix',
  'validators.proxyConfigureAtLeastOne',
  'validators.serviceCidr.subnetMaskBetween',
];

const PROXY_OMIT_KEYS = [
  'wizard.stepLabels.clusterWideProxy',
  'networking.proxyCheckboxLabel',
  'networking.proxyCheckboxHelp',
  'networking.proxyNextStepInfo',
  'validators.proxyConfigureAtLeastOne',
];

const UPDATES_OMIT_KEYS = [
  'wizard.stepLabels.clusterUpdatesOptional',
  'review.updateStrategy',
  'review.strategyIndividual',
  'review.strategyAutomatic',
];

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

function splitCells(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/** Turns catalog escaping back into the characters stored on the defaults. */
function decodeCell(cell: string): string {
  let text = cell.trim();
  if (text.startsWith('`') && text.endsWith('`') && !text.slice(1, -1).includes('`')) {
    text = text.slice(1, -1);
  }
  return text
    .replace(/\\`/g, '`')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function parseCatalog(doc: string): CatalogRow[] {
  const rows: CatalogRow[] = [];
  let section = '';
  let headers: string[] = [];

  for (const line of doc.split('\n')) {
    const heading = /^### `([^`]+)`/.exec(line);
    if (heading?.[1]) {
      section = heading[1];
      headers = [];
      continue;
    }
    if (line.startsWith('| Key |')) {
      headers = splitCells(line);
      continue;
    }
    if (!line.startsWith('| `') || headers.length === 0) {
      continue;
    }
    const cells = splitCells(line);
    const key = cells[0]?.replace(/^`|`$/g, '') ?? '';
    const englishIndex = headers.indexOf('Default English');
    const notesIndex = headers.indexOf('Notes');
    const signatureIndex = headers.indexOf('Signature');
    rows.push({
      key,
      english: decodeCell(cells[englishIndex] ?? ''),
      notes: notesIndex === -1 ? '' : (cells[notesIndex] ?? ''),
      section,
      signature: signatureIndex === -1 ? '' : (cells[signatureIndex] ?? ''),
    });
  }

  return rows;
}

function lookupDefault(key: string): unknown {
  const root = key.startsWith('validators.')
    ? defaultRosaHcpWizardValidatorStrings
    : defaultRosaHcpWizardStrings;
  const parts = key.startsWith('validators.') ? key.split('.').slice(1) : key.split('.');
  return parts.reduce<unknown>((current, part) => {
    if (current !== null && typeof current === 'object') {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, root);
}

/** Heading a key belongs under: the top-level section, or `validators.<group>`. */
function expectedSectionFor(key: string): string {
  const parts = key.split('.');
  if (parts[0] === 'validators') {
    return parts.length === 2 ? key : `validators.${parts[1]}`;
  }
  return parts[0] ?? key;
}

function expectedEnglish(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.join(', ');
  }
  return undefined;
}

function parameterNames(fn: (...args: never[]) => unknown): string[] {
  const source = fn.toString();
  const arrow = source.indexOf('=>');
  const head = arrow === -1 ? source.slice(0, source.indexOf('{')) : source.slice(0, arrow);
  const open = head.indexOf('(');
  const close = head.lastIndexOf(')');
  if (open === -1 || close === -1 || close <= open) {
    return [];
  }
  const inside = head.slice(open + 1, close).trim();
  if (!inside) {
    return [];
  }
  return inside
    .split(',')
    .map((part) => part.trim().split(/[\s:]/)[0] ?? '')
    .filter((name) => name.length > 0);
}

describe('localizable strings reference', () => {
  const doc = fs.readFileSync(path.join(__dirname, '../../docs/localizable-strings.md'), 'utf8');
  const uiLeaves = collectLeafPaths(defaultRosaHcpWizardStrings, '');
  const validatorLeaves = collectLeafPaths(defaultRosaHcpWizardValidatorStrings, 'validators');
  const rows = parseCatalog(doc);
  const rowsByKey = new Map(rows.map((row) => [row.key, row]));

  /** Fails when a key is missing from a table, sits under the wrong heading, or its English drifted. */
  it('matches every default in its catalog table row', () => {
    const problems: string[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (seen.has(row.key)) {
        problems.push(`${row.key} is listed more than once`);
      }
      seen.add(row.key);
    }

    for (const key of [...uiLeaves, ...validatorLeaves]) {
      const row = rowsByKey.get(key);
      if (!row || !doc.includes(`| \`${key}\` |`)) {
        problems.push(`${key} is missing a table row`);
        continue;
      }
      const section = expectedSectionFor(key);
      if (row.section !== section) {
        problems.push(`${key} is under ### \`${row.section}\`, expected ### \`${section}\``);
      }
      const english = expectedEnglish(lookupDefault(key));
      if (english !== undefined && row.english !== english) {
        problems.push(
          `${key} English differs\n  catalog: ${JSON.stringify(row.english)}\n  default: ${JSON.stringify(english)}`
        );
      }
      const value = lookupDefault(key);
      if (typeof value === 'function') {
        for (const name of parameterNames(value as (...args: never[]) => unknown)) {
          if (!row.signature.includes(name)) {
            problems.push(`${key} signature is missing parameter ${name}`);
          }
        }
      }
    }

    const known = new Set([...uiLeaves, ...validatorLeaves]);
    for (const row of rows) {
      if (!known.has(row.key)) {
        problems.push(`${row.key} is in the catalog but not in the defaults`);
      }
    }

    expect(problems).toEqual([]);
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

  it('marks hidden-step keys on their table rows and whole sections in the section introduction', () => {
    for (const key of PROXY_OMIT_KEYS) {
      expect(rowsByKey.get(key)?.notes).toContain('Omit when cluster-wide proxy is hidden');
    }
    for (const key of UPDATES_OMIT_KEYS) {
      expect(rowsByKey.get(key)?.notes).toContain('Omit when cluster updates is hidden');
    }

    expect(sectionBetween(doc, '### `clusterWideProxy`', '### `encryption`')).toContain(
      'Omit this entire section when cluster-wide proxy is hidden.'
    );
    expect(sectionBetween(doc, '### `clusterUpdates`', '### `review`')).toContain(
      'Omit this entire section when cluster updates is hidden.'
    );
    expect(sectionBetween(doc, '### `validators.url`', '### `validators.ca`')).toContain(
      'Omit this entire section when cluster-wide proxy is hidden.'
    );
    expect(
      sectionBetween(doc, '### `validators.noProxyDomains`', '### `validators.url`')
    ).toContain('Omit this entire section when cluster-wide proxy is hidden.');
    expect(sectionBetween(doc, '### `validators.ca`', '### `validators.rootDisk`')).toContain(
      'Omit this entire section when cluster-wide proxy is hidden.'
    );
  });

  it('marks every key the wizard does not read', () => {
    const missing = NOT_READ_KEYS.filter((key) => !rowsByKey.get(key)?.notes?.includes('Not read'));
    expect(missing).toEqual([]);
  });
});

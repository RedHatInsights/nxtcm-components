import { STEP_IDS } from '../constants';
import { isObjectRecord } from '../utilities/typeGuards';
import {
  buildRosaHcpWizardStrings,
  ROSA_HCP_WIZARD_TRANSLATION_PREFIX,
  ROSA_HCP_WIZARD_UNREAD_MESSAGE_PATHS,
  type RosaHcpWizardTranslate,
  type RosaHcpWizardTranslateOptions,
} from './buildRosaHcpWizardStrings';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';

const unreadPaths = new Set<string>(ROSA_HCP_WIZARD_UNREAD_MESSAGE_PATHS);

function interpolate(template: string, options?: RosaHcpWizardTranslateOptions): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    String(options?.[name] ?? '')
  );
}

/** Uses the English passed as defaultValue, which is what a host does when a key is not translated. */
const englishT: RosaHcpWizardTranslate = (_key, options) =>
  interpolate(options?.defaultValue ?? '', options);

function parameterNames(fn: (...args: never[]) => unknown): string[] {
  const source = fn.toString();
  const arrow = source.indexOf('=>');
  const head = arrow === -1 ? source.slice(0, source.indexOf('{')) : source.slice(0, arrow);
  const open = head.indexOf('(');
  const close = head.lastIndexOf(')');
  if (open === -1 || close <= open) {
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

function sampleArgs(params: readonly string[], plural: boolean): (string | number | boolean)[] {
  return params.map((name) => {
    if (name === 'plural') {
      return plural;
    }
    if (
      name === 'max' ||
      name === 'min' ||
      name === 'maxServices' ||
      name === 'prefixLength' ||
      name === 'maxPodIPs' ||
      name === 'maxPrefix' ||
      name === 'minPrefix' ||
      name.endsWith('Mask')
    ) {
      return 24;
    }
    return `sample-${name}`;
  });
}

function leafPaths(value: unknown, path: string): string[] {
  if (typeof value === 'string' || typeof value === 'function') {
    return [path];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown, index) => leafPaths(item, `${path}.${index}`));
  }
  if (isObjectRecord(value)) {
    return Object.keys(value).flatMap((key) =>
      leafPaths(value[key], path === '' ? key : `${path}.${key}`)
    );
  }
  return [];
}

function expectLeavesMatch(actual: unknown, expected: unknown, path: string): void {
  if (typeof expected === 'string') {
    expect(actual).toBe(expected);
    return;
  }
  if (typeof expected === 'function') {
    const params = parameterNames(expected as (...args: never[]) => unknown);
    const call = (plural: boolean): void => {
      const args = sampleArgs(params, plural);
      const expectedFn = expected as (...args: never[]) => string;
      const actualFn = actual as (...args: never[]) => string;
      expect(actualFn(...(args as never[]))).toBe(expectedFn(...(args as never[])));
    };
    call(false);
    if (params.includes('plural')) {
      call(true);
    }
    return;
  }
  if (Array.isArray(expected)) {
    expect(actual).toEqual(expected);
    return;
  }
  if (isObjectRecord(expected)) {
    expect(isObjectRecord(actual)).toBe(true);
    if (!isObjectRecord(actual)) {
      return;
    }
    for (const key of Object.keys(expected)) {
      const childPath = path === '' ? key : `${path}.${key}`;
      if (actual[key] === undefined) {
        const missing = leafPaths(expected[key], childPath);
        expect(missing.every((leaf) => unreadPaths.has(leaf))).toBe(true);
        continue;
      }
      expectLeavesMatch(actual[key], expected[key], childPath);
    }
  }
}

describe('buildRosaHcpWizardStrings', () => {
  it('returns English copy for every key the wizard reads', () => {
    const strings = buildRosaHcpWizardStrings(englishT);

    expectLeavesMatch(strings, defaultRosaHcpWizardStrings, '');
    expectLeavesMatch(strings.validators, defaultRosaHcpWizardValidatorStrings, 'validators');
    expect(strings.yamlEditor?.description).toBeUndefined();
    expect(strings.encryption?.etcdTitle).toBeUndefined();
    expect(strings.validators?.proxyConfigureAtLeastOne).toBeUndefined();
    expect(strings.validators?.serviceCidr?.subnetMaskBetween).toBeUndefined();
    expect(strings.validators?.serviceCidr?.subnetMaskBetweenOneAnd).toEqual(expect.any(Function));
  });

  it('uses a translated value when the host has one, and the English default otherwise', () => {
    const t: RosaHcpWizardTranslate = (key, options) => {
      if (key === `${ROSA_HCP_WIZARD_TRANSLATION_PREFIX}.wizard.next`) {
        return 'Siguiente';
      }
      return interpolate(options?.defaultValue ?? '', options);
    };
    const strings = buildRosaHcpWizardStrings(t);

    expect(strings.wizard?.next).toBe('Siguiente');
    expect(strings.wizard?.back).toBe('Back');
  });

  it('uses the translator so a non-English locale replaces visible copy', () => {
    const t: RosaHcpWizardTranslate = (_key, options) =>
      `es:${interpolate(options?.defaultValue ?? '', options)}`;
    const strings = buildRosaHcpWizardStrings(t, [
      STEP_IDS.CLUSTER_WIDE_PROXY,
      STEP_IDS.CLUSTER_UPDATES,
    ]);

    expect(strings.wizard?.next).toBe('es:Next');
    expect(strings.wizard?.stepLabels?.details).toBe('es:Details');
    expect(strings.wizard?.stepLabels?.additionalSetup).toBe('es:Additional setup');
    expect(strings.details?.clusterNameLabel).toBe('es:Cluster name');
    expect(strings.encryption?.etcdLabel).toBe('es:Enable additional etcd encryption');
    expect(strings.review?.editStep).toBe('es:Edit step');
    expect(strings.validators?.commonRequired).toBe('es:This field is required');
    expect(strings.validators?.cidr?.invalidNotation?.('10.1.0.0/8')).toBe(
      "es:IP address range '10.1.0.0/8' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'."
    );
  });

  it('omits copy for the steps ACM hides and keeps the other steps', () => {
    const strings = buildRosaHcpWizardStrings(englishT, [
      STEP_IDS.CLUSTER_WIDE_PROXY,
      STEP_IDS.CLUSTER_UPDATES,
    ]);

    expect(strings.clusterWideProxy).toBeUndefined();
    expect(strings.clusterUpdates).toBeUndefined();
    expect(strings.wizard?.stepLabels?.clusterWideProxy).toBeUndefined();
    expect(strings.wizard?.stepLabels?.clusterUpdatesOptional).toBeUndefined();
    expect(strings.networking?.proxyCheckboxLabel).toBeUndefined();
    expect(strings.networking?.machineCidrLabel).toBe('Machine CIDR');
    expect(strings.validators?.url).toBeUndefined();
    expect(strings.validators?.ca).toBeUndefined();
    expect(strings.validators?.noProxyDomains).toBeUndefined();
    expect(strings.review?.updateStrategy).toBeUndefined();
    expect(strings.review?.strategyIndividual).toBeUndefined();
    expect(strings.review?.editStep).toBe('Edit step');
    expect(strings.encryption?.sectionLabel).toBe('Advanced encryption');
  });

  it('passes the current English as defaultValue for every key', () => {
    const calls: { key: string; defaultValue: string }[] = [];
    const recordingT: RosaHcpWizardTranslate = (key, options) => {
      calls.push({ key, defaultValue: options?.defaultValue ?? '' });
      return englishT(key, options);
    };
    buildRosaHcpWizardStrings(recordingT);

    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.defaultValue.length > 0)).toBe(true);
    expect(
      calls.every((call) => call.key.startsWith(`${ROSA_HCP_WIZARD_TRANSLATION_PREFIX}.`))
    ).toBe(true);
    expect(calls.find((call) => call.key.endsWith('.wizard.next'))?.defaultValue).toBe('Next');
  });
});

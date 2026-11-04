import { useMemo } from 'react';

import { STEP_IDS } from '../constants';
import { isObjectRecord } from '../utilities/typeGuards';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.defaults';
import type { RosaHcpWizardStringsInput } from './rosaHcpWizardStrings.types';

/**
 * i18next-style translator. ACM's `useTranslation` tuple starts with this function.
 * `options.defaultValue` is the current English from the wizard defaults. Return it when
 * `key` has no translation, so an English wording change does not need a catalog edit.
 */
export type RosaHcpWizardTranslateOptions = {
  defaultValue?: string;
  [name: string]: string | number | boolean | undefined;
};

export type RosaHcpWizardTranslate = (
  key: string,
  options?: RosaHcpWizardTranslateOptions
) => string;

/** Stable prefix for every key passed to `t`. The key does not contain the English sentence. */
export const ROSA_HCP_WIZARD_TRANSLATION_PREFIX = 'rosaHcpWizard';

/** Message paths the wizard never reads. Hosts should not translate these. */
export const ROSA_HCP_WIZARD_UNREAD_MESSAGE_PATHS: readonly string[] = [
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

const UNREAD_KEYS = new Set<string>(ROSA_HCP_WIZARD_UNREAD_MESSAGE_PATHS);

type StringFunction = (...args: never[]) => string;

function messageKey(path: string): string {
  return `${ROSA_HCP_WIZARD_TRANSLATION_PREFIX}.${path}`;
}

function parameterNames(fn: StringFunction): string[] {
  const source = fn.toString();
  const arrow = source.indexOf('=>');
  const head = arrow === -1 ? source.slice(0, source.indexOf('{')) : source.slice(0, arrow);
  const open = head.indexOf('(');
  const close = head.lastIndexOf(')');
  if (open === -1 || close <= open) {
    const name = head.replace('async', '').trim();
    return name && !name.includes(' ') && !name.includes('function') ? [name] : [];
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

function isProxyOnlyPath(path: string): boolean {
  return (
    path === 'clusterWideProxy' ||
    path.startsWith('clusterWideProxy.') ||
    path === 'wizard.stepLabels.clusterWideProxy' ||
    path === 'networking.proxyCheckboxLabel' ||
    path === 'networking.proxyCheckboxHelp' ||
    path === 'networking.proxyNextStepInfo' ||
    path === 'validators.noProxyDomains' ||
    path.startsWith('validators.noProxyDomains.') ||
    path === 'validators.url' ||
    path.startsWith('validators.url.') ||
    path === 'validators.ca' ||
    path.startsWith('validators.ca.') ||
    path === 'validators.proxyConfigureAtLeastOne'
  );
}

function isClusterUpdatesOnlyPath(path: string): boolean {
  return (
    path === 'clusterUpdates' ||
    path.startsWith('clusterUpdates.') ||
    path === 'wizard.stepLabels.clusterUpdatesOptional' ||
    path === 'review.updateStrategy' ||
    path === 'review.strategyIndividual' ||
    path === 'review.strategyAutomatic'
  );
}

function omitPath(path: string, hidden: ReadonlySet<string>): boolean {
  if (UNREAD_KEYS.has(path)) {
    return true;
  }
  if (hidden.has(STEP_IDS.CLUSTER_WIDE_PROXY) && isProxyOnlyPath(path)) {
    return true;
  }
  if (hidden.has(STEP_IDS.CLUSTER_UPDATES) && isClusterUpdatesOnlyPath(path)) {
    return true;
  }
  return false;
}

function templateFromFunction(
  fn: StringFunction,
  params: readonly string[],
  plural: boolean
): string {
  const args = params.map((name) => (name === 'plural' ? plural : `{{${name}}}`));
  return fn(...(args as never[]));
}

function translateFunction(
  path: string,
  fn: StringFunction,
  t: RosaHcpWizardTranslate
): StringFunction {
  const params = parameterNames(fn);
  const pluralMessage = params.includes('plural');
  return (...args: readonly (string | number | boolean)[]) => {
    const options: Record<string, string | number | boolean> = {};
    let plural = false;
    params.forEach((name, index) => {
      const arg = args[index];
      if (name === 'plural') {
        plural = Boolean(arg);
        return;
      }
      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
        options[name] = arg;
      }
    });
    const suffix = pluralMessage ? `_${plural ? 'plural' : 'singular'}` : '';
    return t(`${messageKey(path)}${suffix}`, {
      ...options,
      defaultValue: templateFromFunction(fn, params, plural),
    });
  };
}

function translateNode(
  value: unknown,
  path: string,
  t: RosaHcpWizardTranslate,
  hidden: ReadonlySet<string>
): unknown {
  if (path !== '' && omitPath(path, hidden)) {
    return undefined;
  }
  if (typeof value === 'string') {
    return t(messageKey(path), { defaultValue: value });
  }
  if (typeof value === 'function') {
    return translateFunction(path, value as StringFunction, t);
  }
  if (Array.isArray(value)) {
    return value.map((item: unknown, index) => translateNode(item, `${path}.${index}`, t, hidden));
  }
  if (!isObjectRecord(value)) {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const childPath = path === '' ? key : `${path}.${key}`;
    const child = translateNode(value[key], childPath, t, hidden);
    if (child !== undefined) {
      result[key] = child;
    }
  }
  return Object.keys(result).length === 0 ? undefined : result;
}

/**
 * Builds the `strings` prop from a host translator.
 * Each call passes the current English as `options.defaultValue`.
 * A host that has no translation for the key returns that value, so English copy stays in the defaults file.
 * Pass the same `hiddenSteps` as `RosaHCPWizard`'s `config.hiddenSteps`.
 * Only cluster-wide proxy and cluster updates can be hidden; their copy is left out of the result.
 * Unread keys are always left out.
 */
export function buildRosaHcpWizardStrings(
  t: RosaHcpWizardTranslate,
  hiddenSteps: readonly string[] = []
): RosaHcpWizardStringsInput {
  const hidden = new Set(hiddenSteps);
  const ui = translateNode(defaultRosaHcpWizardStrings, '', t, hidden);
  const validators = translateNode(defaultRosaHcpWizardValidatorStrings, 'validators', t, hidden);
  // The tree is built from the default string objects, so the runtime shape matches the input type.
  const result = {
    ...(isObjectRecord(ui) ? ui : {}),
    validators: isObjectRecord(validators) ? validators : {},
  } as RosaHcpWizardStringsInput;
  return result;
}

/**
 * Memoized {@link buildRosaHcpWizardStrings} for a host that already calls `useTranslation`.
 * ACM: `const [t] = useTranslation()` then `strings={useRosaHcpWizardStrings(t, hiddenSteps)}`.
 */
export function useRosaHcpWizardStrings(
  t: RosaHcpWizardTranslate,
  hiddenSteps: readonly string[] = []
): RosaHcpWizardStringsInput {
  const hiddenKey = hiddenSteps.join('\0');
  return useMemo(
    () => buildRosaHcpWizardStrings(t, hiddenKey === '' ? [] : hiddenKey.split('\0')),
    [t, hiddenKey]
  );
}

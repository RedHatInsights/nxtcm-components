import * as yup from 'yup';
import { containsCidr, overlapCidr } from 'cidr-tools';
import IPCIDR from 'ip-cidr';

import {
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MIN,
  isValidIpv4Cidr,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
} from '../constants';
import { parseCIDRSubnetLength } from '../utilities/helpers';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';
import type { ValidationSchemaContext } from './types';
import { CIDRSubnet, ROSAHCPCluster } from '../types';

export const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';

export function ctx(testContext: yup.TestContext): ValidationSchemaContext {
  return testContext.options.context as ValidationSchemaContext;
}

export function isValidCidr(value: string): boolean {
  return isValidIpv4Cidr(value);
}

export function isCidrSubnetAddress(value: string): boolean {
  const parts = value.split('/');
  const binaryStr = parts[0]
    .split('.')
    .map((octet) => Number(octet).toString(2).padEnd(8, '0'))
    .join('');
  const maskBits = parseInt(parts[1], 10);
  const masked = binaryStr.slice(0, maskBits).padEnd(32, '0');
  return masked === binaryStr;
}

export function getStartingIP(cidr: string): string {
  const ip = new IPCIDR(cidr);
  return ip.start().toString();
}

export function validateClusterNameSync(
  value: string,
  msgs: RosaHcpWizardValidatorStrings['clusterName']
): string | undefined {
  if (!value) return undefined;
  if (value.length > 54) return msgs.maxLength;
  for (const char of value) {
    if (!LOWERCASE_ALPHANUMERIC.includes(char) && char !== '-' && char !== '.') {
      return msgs.invalidChars;
    }
  }
  if (!LOWERCASE_ALPHANUMERIC.includes(value[0])) return msgs.mustStartAlphanumeric;
  if (/^\d/.test(value[0])) return msgs.mustNotStartNumber;
  if (!LOWERCASE_ALPHANUMERIC.includes(value[value.length - 1])) return msgs.mustEndAlphanumeric;
  return undefined;
}

export function validateAwsMachineCidrPrefix(
  prefixLength: number,
  isMultiAz: boolean,
  isHypershift: boolean,
  msgs: RosaHcpWizardValidatorStrings['awsMachineCidr']
): string | undefined {
  if (prefixLength < AWS_MACHINE_CIDR_MIN) {
    return msgs.maskTooLarge(AWS_MACHINE_CIDR_MIN);
  }
  if ((isMultiAz || isHypershift) && prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ) {
    return msgs.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ);
  }
  if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
    return msgs.maskTooSmallSingleAz(AWS_MACHINE_CIDR_MAX_SINGLE_AZ);
  }
  return undefined;
}

export function findMachineSubnetIncludeError(
  value: string,
  selectedSubnets: CIDRSubnet[],
  msgs: RosaHcpWizardValidatorStrings['subnetCidrs']
): string | undefined {
  for (const subnet of selectedSubnets) {
    if (
      isValidIpv4Cidr(subnet.cidr_block) &&
      !containsCidr(value, getStartingIP(subnet.cidr_block))
    ) {
      const subnetLabel = subnet.name || subnet.subnet_id;
      return msgs.machineDoesNotIncludeStartIp(getStartingIP(subnet.cidr_block), subnetLabel);
    }
  }
  return undefined;
}

type ServiceOrPodSubnetMsgs = Pick<
  RosaHcpWizardValidatorStrings['subnetCidrs'],
  'serviceIncludesStartIp' | 'serviceOverlaps' | 'podIncludesStartIp' | 'podOverlaps'
>;

export function findServiceOrPodSubnetConflict(
  value: string,
  selectedSubnets: CIDRSubnet[],
  msgs: ServiceOrPodSubnetMsgs,
  kind: 'service' | 'pod'
): string | undefined {
  for (const subnet of selectedSubnets) {
    if (!isValidIpv4Cidr(subnet.cidr_block)) {
      continue;
    }
    const subnetLabel = subnet.name || subnet.subnet_id;
    const startIp = getStartingIP(subnet.cidr_block);
    if (containsCidr(value, startIp)) {
      return kind === 'service'
        ? msgs.serviceIncludesStartIp(startIp, subnetLabel)
        : msgs.podIncludesStartIp(startIp, subnetLabel);
    }
    if (overlapCidr(value, subnet.cidr_block)) {
      return kind === 'service'
        ? msgs.serviceOverlaps(subnetLabel, subnet.cidr_block)
        : msgs.podOverlaps(subnetLabel, subnet.cidr_block);
    }
  }
  return undefined;
}

export function validateServiceCidrMask(
  value: string,
  msgs: RosaHcpWizardValidatorStrings['serviceCidr']
): string | undefined {
  const prefixLength = parseCIDRSubnetLength(value);
  if (prefixLength != null && prefixLength > SERVICE_CIDR_MAX) {
    const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
    return msgs.maskTooSmall(SERVICE_CIDR_MAX, maxServices);
  }

  const maskBits = parseInt(value.split('/')[1], 10);
  if (maskBits > SERVICE_CIDR_MAX || maskBits < 1) {
    return msgs.subnetMaskBetweenOneAnd(SERVICE_CIDR_MAX);
  }

  return undefined;
}

export function validatePodCidrCapacity(
  prefixLength: number,
  hostPrefix: string | undefined,
  msgs: RosaHcpWizardValidatorStrings['podCidr']
): string | undefined {
  if (prefixLength > POD_CIDR_MAX) {
    return msgs.maskTooSmall(POD_CIDR_MAX);
  }

  const hostPrefixLen = parseCIDRSubnetLength(hostPrefix) || 23;
  const maxPodIPs = 2 ** (32 - hostPrefixLen);
  const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
  if (maxPodNodes < POD_NODES_MIN) {
    return msgs.notEnoughNodes(prefixLength);
  }

  return undefined;
}

export function findOverlappingCidrFields(
  value: string,
  fieldName: string,
  formData: Partial<ROSAHCPCluster>,
  msgs: RosaHcpWizardValidatorStrings['disjointSubnets']
): string[] {
  const fieldLabels: Record<string, string> = {
    network_machine_cidr: msgs.fieldLabelMachine,
    network_service_cidr: msgs.fieldLabelService,
    network_pod_cidr: msgs.fieldLabelPod,
  };
  delete fieldLabels[fieldName];

  const overlapping: string[] = [];
  Object.entries(fieldLabels).forEach(([name, label]) => {
    const fieldValue = (formData as Record<string, string | undefined>)[name];
    try {
      if (fieldValue && overlapCidr(value, fieldValue)) {
        overlapping.push(label);
      }
    } catch {
      // parse error — ignore
    }
  });
  return overlapping;
}

/**
 * Yup test (use before `.required()` on the same chain) so the message comes from
 * {@link RosaHcpWizardValidatorStrings.commonRequired} (override via `strings.validators.commonRequired`
 * on {@link RosaHCPWizard} / the strings provider).
 *
 * Treats a value as **missing** when it is `null`/`undefined`, an empty string, or an empty array.
 * Non-empty strings, non-empty arrays, and non-null objects (e.g. a selected VPC record from the machine pools step)
 * count as present. Yup’s `.required(fn)` message callbacks do not receive validation `context`, so this
 * pattern is required for contextual copy.
 */
export function rosaRequiredPresentValue(
  this: yup.TestContext,
  value: unknown
): true | yup.ValidationError {
  if (value == null) {
    return this.createError({ message: ctx(this).msgs.commonRequired });
  }
  if (typeof value === 'string' && value.length === 0) {
    return this.createError({ message: ctx(this).msgs.commonRequired });
  }
  if (Array.isArray(value) && value.length === 0) {
    return this.createError({ message: ctx(this).msgs.commonRequired });
  }
  return true;
}

/** Use on `string` / `mixed` / `array` schemas before `.required()` — see {@link rosaRequiredPresentValue}. */
export const rosaCommonRequiredNonEmptyTest = {
  name: 'rosa-common-required-nonempty',
  exclusive: true,
  skipAbsent: true,
  test: rosaRequiredPresentValue,
};

/**
 * Like {@link rosaCommonRequiredNonEmptyTest} but still runs when the value is `undefined`.
 * Use on conditionally required fields that may be untouched (e.g. Key ARN shown only when a toggle is on).
 */
export const rosaCommonRequiredNonEmptyIncludingAbsentTest = {
  name: 'rosa-common-required-nonempty',
  exclusive: true,
  test: rosaRequiredPresentValue,
};

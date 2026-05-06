import { overlapCidr, containsCidr } from 'cidr-tools';
import {
  AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX,
  AWS_KMS_SERVICE_ACCOUNT_REGEX,
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MIN,
  BASE_DOMAIN_REGEXP,
  CIDR_REGEXP,
  DNS_LABEL_REGEXP,
  HOST_PREFIX_MAX,
  HOST_PREFIX_MIN,
  HOST_PREFIX_REGEXP,
  MAX_CA_SIZE_BYTES,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
} from './constants';
import { parseCIDRSubnetLength, stringToArray } from './helpers';
import IPCIDR from 'ip-cidr';
import type { ClusterFormData, CIDRSubnet } from '../types';
import {
  defaultRosaHcpWizardValidatorStrings,
  type RosaHcpWizardAwsMachineCidrValidatorStrings,
  type RosaHcpWizardCaValidatorStrings,
  type RosaHcpWizardCidrValidatorStrings,
  type RosaHcpWizardClusterNameValidatorStrings,
  type RosaHcpWizardDisjointSubnetsValidatorStrings,
  type RosaHcpWizardHostPrefixValidatorStrings,
  type RosaHcpWizardKmsKeyValidatorStrings,
  type RosaHcpWizardNoProxyValidatorStrings,
  type RosaHcpWizardOperatorRolesPrefixValidatorStrings,
  type RosaHcpWizardPodCidrValidatorStrings,
  type RosaHcpWizardReplicaValidatorStrings,
  type RosaHcpWizardSecurityGroupsValidatorStrings,
  type RosaHcpWizardServiceCidrValidatorStrings,
  type RosaHcpWizardSubnetCidrsValidatorStrings,
  type RosaHcpWizardUrlValidatorStrings,
  type RosaHcpWizardValidateRangeValidatorStrings,
} from './stringsProvider/rosaHcpWizardStrings';

const lowercaseAlphaNumericCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

export const composeValidators =
  (...args: Array<(value: any, item?: unknown) => string | undefined>) =>
  (value: any, item?: unknown) => {
    for (let i = 0; i < args.length; i += 1) {
      const validator = args[i];
      const error = validator(value, item);

      if (error) {
        return error;
      }
    }

    return undefined;
  };

export function validateClusterName(
  value: string,
  _item?: unknown,
  msgs: RosaHcpWizardClusterNameValidatorStrings = defaultRosaHcpWizardValidatorStrings.clusterName
) {
  if (!value) return undefined;
  if (value.length > 54) return msgs.maxLength;
  for (const char of value) {
    if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-' && char !== '.')
      return msgs.invalidChars;
  }
  if (!lowercaseAlphaNumericCharacters.includes(value[0])) return msgs.mustStartAlphanumeric;
  if (/^[0-9]/.test(value[0])) return msgs.mustNotStartNumber;
  if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
    return msgs.mustEndAlphanumeric;
  return undefined;
}

export const validateCustomOperatorRolesPrefix = (
  value: string,
  _item?: unknown,
  msgs: RosaHcpWizardOperatorRolesPrefixValidatorStrings = defaultRosaHcpWizardValidatorStrings.operatorRolesPrefix
): string | undefined => {
  const label = msgs.fieldLabel;
  if (!value) {
    return undefined;
  }
  if (!DNS_LABEL_REGEXP.test(value)) {
    return msgs.invalidFormat(label, value);
  }
  if (value.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH) {
    return msgs.tooLong(label, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH);
  }
  return undefined;
};

export const validateAWSKMSKeyARN = (
  value: string,
  region: string | undefined,
  msgs: RosaHcpWizardKmsKeyValidatorStrings = defaultRosaHcpWizardValidatorStrings.kmsKeyArn
): string | undefined => {
  if (!value) {
    return msgs.required;
  }

  if (/\s/.test(value)) {
    return msgs.noWhitespace;
  }

  if (
    value.includes(':key/mrk-')
      ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
      : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
  ) {
    return msgs.invalidArn;
  }

  const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
  if (kmsRegion !== region) {
    return msgs.wrongRegion;
  }

  return undefined;
};

export const checkNoProxyDomains = (
  value?: string,
  msgs: RosaHcpWizardNoProxyValidatorStrings = defaultRosaHcpWizardValidatorStrings.noProxyDomains
) => {
  const stringArray = stringToArray(value);
  if (stringArray && stringArray.length > 0) {
    const invalidDomains = stringArray.filter(
      (domain) => !!domain && !(BASE_DOMAIN_REGEXP.test(domain) && BASE_DOMAIN_REGEXP.test(domain))
    );
    const plural = invalidDomains.length > 1;
    if (invalidDomains.length > 0) {
      return msgs.invalidDomains(invalidDomains.join(', '), plural);
    }
  }
  return undefined;
};

export const validateCA = (
  value: string,
  msgs: RosaHcpWizardCaValidatorStrings = defaultRosaHcpWizardValidatorStrings.ca
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const pemRegex =
    /-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/;

  if (value.length > MAX_CA_SIZE_BYTES) {
    return msgs.fileTooLarge;
  }
  if (!pemRegex.test(value)) {
    return msgs.invalidPem;
  }
  return undefined;
};

export const validateUrl = (
  value: string,
  protocol: string | string[] = 'http',
  msgs: RosaHcpWizardUrlValidatorStrings = defaultRosaHcpWizardValidatorStrings.url
): string | undefined => {
  if (!value) {
    return undefined;
  }
  let protocolArr: string[];
  if (typeof protocol === 'string') {
    protocolArr = [protocol];
  } else {
    protocolArr = protocol;
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return msgs.invalid;
  }
  const scheme = parsed.protocol.slice(0, -1);
  if (!protocolArr.includes(scheme)) {
    const protocolStr = protocolArr.map((p) => `${p}://`).join(', ');
    return msgs.schemePrefix(protocolStr);
  }
  return undefined;
};

export const disjointSubnets =
  (
    fieldName: string,
    msgs: RosaHcpWizardDisjointSubnetsValidatorStrings = defaultRosaHcpWizardValidatorStrings.disjointSubnets
  ) =>
  (value: string | undefined, formData: ClusterFormData | undefined): string | undefined => {
    if (!value) {
      return undefined;
    }

    const networkingFields: { [key: string]: string } = {
      network_machine_cidr: msgs.fieldLabelMachine,
      network_service_cidr: msgs.fieldLabelService,
      network_pod_cidr: msgs.fieldLabelPod,
    };
    delete networkingFields[fieldName];
    const overlappingFields: string[] = [];

    if (CIDR_REGEXP.test(value)) {
      Object.keys(networkingFields).forEach((name) => {
        const fieldValue = (formData as Record<string, string | undefined> | undefined)?.[name];
        try {
          if (fieldValue && overlapCidr(value, fieldValue)) {
            overlappingFields.push(networkingFields[name]);
          }
        } catch {
          // parse error for fieldValue; ignore
        }
      });
    }

    const plural = overlappingFields.length > 1;
    if (overlappingFields.length > 0) {
      return msgs.overlap(overlappingFields.join(', '), plural);
    }
    return undefined;
  };

// Function to validate IP address masks
export const hostPrefix = (
  value?: string,
  msgs: RosaHcpWizardHostPrefixValidatorStrings = defaultRosaHcpWizardValidatorStrings.hostPrefix
): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (!HOST_PREFIX_REGEXP.test(value)) {
    return msgs.invalidMaskFormat(value);
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < HOST_PREFIX_MIN) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
      return msgs.maskTooLarge(HOST_PREFIX_MIN, maxPodIPs);
    }
    if (prefixLength > HOST_PREFIX_MAX) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
      return msgs.maskTooSmall(HOST_PREFIX_MAX, maxPodIPs);
    }
  }

  return undefined;
};

// Function to validate IP address blocks
export const cidr = (
  value?: string,
  msgs: RosaHcpWizardCidrValidatorStrings = defaultRosaHcpWizardValidatorStrings.cidr
): string | undefined => {
  if (value && !CIDR_REGEXP.test(value)) {
    return msgs.invalidNotation(value);
  }
  return undefined;
};

export const validateRange = (
  value?: string,
  msgs: RosaHcpWizardValidateRangeValidatorStrings = defaultRosaHcpWizardValidatorStrings.validateRange,
  cidrMsgs: RosaHcpWizardCidrValidatorStrings = defaultRosaHcpWizardValidatorStrings.cidr
): string | undefined => {
  if (cidr(value, cidrMsgs) !== undefined || !value) {
    return undefined;
  }
  const parts = value.split('/');
  const cidrBinaryString = parts[0]
    .split('.')
    .map((octet) => Number(octet).toString(2).padEnd(8, '0'))
    .join('');
  const maskBits = parseInt(parts[1], 10);
  const maskedBinaryString = cidrBinaryString.slice(0, maskBits).padEnd(32, '0');

  if (maskedBinaryString !== cidrBinaryString) {
    return msgs.notSubnetAddress;
  }
  return undefined;
};

export const awsMachineCidr = (
  value?: string,
  formData?: ClusterFormData,
  msgs: RosaHcpWizardAwsMachineCidrValidatorStrings = defaultRosaHcpWizardValidatorStrings.awsMachineCidr
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData?.multi_az === 'true';
  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < AWS_MACHINE_CIDR_MIN) {
      return msgs.maskTooLarge(AWS_MACHINE_CIDR_MIN);
    }

    if (
      (isMultiAz || formData?.hypershift === 'true') &&
      prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ
    ) {
      return msgs.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ);
    }

    if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
      return msgs.maskTooSmallSingleAz(AWS_MACHINE_CIDR_MAX_SINGLE_AZ);
    }
  }

  return undefined;
};

export const serviceCidr = (
  value?: string,
  msgs: RosaHcpWizardServiceCidrValidatorStrings = defaultRosaHcpWizardValidatorStrings.serviceCidr
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength > SERVICE_CIDR_MAX) {
      const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
      return msgs.maskTooSmall(SERVICE_CIDR_MAX, maxServices);
    }
  }

  return undefined;
};

export const podCidr = (
  value?: string,
  network_host_prefix?: string,
  msgs: RosaHcpWizardPodCidrValidatorStrings = defaultRosaHcpWizardValidatorStrings.podCidr
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);
  if (prefixLength != null) {
    if (prefixLength > POD_CIDR_MAX) {
      return msgs.maskTooSmall(POD_CIDR_MAX);
    }

    const hostPrefixLen = parseCIDRSubnetLength(network_host_prefix) || 23;
    const maxPodIPs = 2 ** (32 - hostPrefixLen);
    const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
    if (maxPodNodes < POD_NODES_MIN) {
      return msgs.notEnoughNodes(prefixLength);
    }
  }

  return undefined;
};

export const subnetCidrs = (
  value?: string,
  formData?: ClusterFormData,
  fieldName?: string,
  selectedSubnets?: CIDRSubnet[],
  msgs: RosaHcpWizardSubnetCidrsValidatorStrings = defaultRosaHcpWizardValidatorStrings.subnetCidrs
): string | undefined => {
  type ErroredSubnet = {
    cidr_block: string;
    name: string;
    subnet_id: string;
    overlaps?: boolean;
  };

  if (!value || selectedSubnets?.length === 0) {
    return undefined;
  }

  const erroredSubnets: ErroredSubnet[] = [];

  const startingIP = (cidr: string) => {
    const ip = new IPCIDR(cidr);
    return ip.start().toString();
  };

  const compareCidrs = (shouldInclude: boolean) => {
    if (shouldInclude) {
      selectedSubnets?.forEach((subnet: CIDRSubnet) => {
        if (
          CIDR_REGEXP.test(subnet.cidr_block) &&
          !containsCidr(value, startingIP(subnet.cidr_block))
        ) {
          erroredSubnets.push(subnet);
        }
      });
    } else {
      selectedSubnets?.forEach((subnet: CIDRSubnet) => {
        if (CIDR_REGEXP.test(subnet.cidr_block)) {
          if (containsCidr(value, startingIP(subnet.cidr_block))) {
            erroredSubnets.push(subnet);
          } else if (overlapCidr(value, subnet.cidr_block)) {
            const overlappedSubnet = { ...subnet, overlaps: true };
            erroredSubnets.push(overlappedSubnet);
          }
        }
      });
    }
  };

  const subnetName = () => erroredSubnets[0]?.name || erroredSubnets[0]?.subnet_id;

  if (fieldName === 'network_machine_cidr') {
    compareCidrs(true);
    if (erroredSubnets.length > 0) {
      return msgs.machineDoesNotIncludeStartIp(
        startingIP(erroredSubnets[0].cidr_block),
        subnetName() ?? ''
      );
    }
  }
  if (fieldName === 'network_service_cidr') {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return msgs.serviceOverlaps(subnetName() ?? '', erroredSubnets[0].cidr_block);
      }
      return msgs.serviceIncludesStartIp(
        startingIP(erroredSubnets[0].cidr_block),
        subnetName() ?? ''
      );
    }
  }
  if (fieldName === 'network_pod_cidr') {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return msgs.podOverlaps(subnetName() ?? '', erroredSubnets[0].cidr_block);
      }
      return msgs.podIncludesStartIp(startingIP(erroredSubnets[0].cidr_block), subnetName() ?? '');
    }
  }

  return undefined;
};

export const awsSubnetMask =
  (
    fieldName: string | undefined,
    msgs: Pick<
      RosaHcpWizardServiceCidrValidatorStrings,
      'subnetMaskBetween' | 'subnetMaskBetweenOneAnd'
    > = defaultRosaHcpWizardValidatorStrings.serviceCidr
  ) =>
  (value?: string): string | undefined => {
    if (!fieldName || cidr(value) !== undefined || !value) {
      return undefined;
    }
    const awsSubnetMaskRanges: { [key: string]: [number | undefined, number] } = {
      network_machine_cidr_single_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_SINGLE_AZ],
      network_machine_cidr_multi_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_MULTI_AZ],
      network_service_cidr: [undefined, SERVICE_CIDR_MAX],
    };
    const maskRange = awsSubnetMaskRanges[fieldName];
    const parts = value.split('/');
    const maskBits = parseInt(parts[1], 10);
    if (!maskRange[0]) {
      if (maskBits > maskRange[1] || maskBits < 1) {
        return msgs.subnetMaskBetweenOneAnd(maskRange[1]);
      }
      return undefined;
    }
    if (!(maskRange[0] <= maskBits && maskBits <= maskRange[1])) {
      return msgs.subnetMaskBetween(maskRange[0], maskRange[1]);
    }
    return undefined;
  };

export const required = (value?: string): string | undefined =>
  value && value.trim() ? undefined : 'Field is required';

export const validateNumericInput = (
  input: string | undefined,
  { allowDecimal = false, allowNeg = false, allowZero = false, max = NaN, min = NaN } = {}
) => {
  if (!input) {
    return undefined; // accept empty input. Further validation done according to field
  }
  const value = Number(input);
  if (Number.isNaN(value)) {
    return 'Input must be a number.';
  }
  if (!Number.isNaN(min) && value < min) {
    return `Input cannot be less than ${min}.`;
  }
  if (!allowNeg && !allowZero && value <= 0) {
    return 'Input must be a positive number.';
  }
  if (!allowNeg && allowZero && value < 0) {
    return 'Input must be a non-negative number.';
  }
  if (!allowDecimal && input.toString().includes('.')) {
    return 'Input must be an integer.';
  }
  if (!Number.isNaN(max) && value > max) {
    return `Input cannot be more than ${max}.`;
  }
  return undefined;
};

export const validatePositiveInteger = (
  value: number | undefined,
  msgs: RosaHcpWizardReplicaValidatorStrings = defaultRosaHcpWizardValidatorStrings.replicas
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Number.isInteger(value)) {
    return msgs.notInteger;
  }
  if (value <= 0) {
    return msgs.notPositive;
  }
  return undefined;
};

export const validateMinReplicas = (
  value: number | undefined,
  item?: unknown,
  machinePoolsNumber?: number,
  msgs: RosaHcpWizardReplicaValidatorStrings = defaultRosaHcpWizardValidatorStrings.replicas
): string | undefined => {
  const positiveError = validatePositiveInteger(value, msgs);
  if (positiveError) return positiveError;
  const typedItem = item as { cluster?: { max_replicas?: number } } | undefined;
  if (value !== undefined && value > 500) {
    return msgs.maxNodes(500);
  }
  if (value !== undefined && typedItem?.cluster?.max_replicas !== undefined) {
    if (value > typedItem?.cluster?.max_replicas) {
      return msgs.minGreaterThanMax;
    }
  }
  if (machinePoolsNumber && machinePoolsNumber < 2 && value !== undefined && value < 2) {
    return msgs.computeMinTwo;
  }
  return undefined;
};

export const validateMaxReplicas = (
  value: number | undefined,
  item?: unknown,
  maxNodeBasedOnOpenshiftVersion?: number,
  msgs: RosaHcpWizardReplicaValidatorStrings = defaultRosaHcpWizardValidatorStrings.replicas
): string | undefined => {
  const positiveError = validatePositiveInteger(value, msgs);
  if (positiveError) return positiveError;
  const typedItem = item as { cluster?: { min_replicas?: number } } | undefined;
  if (
    value !== undefined &&
    maxNodeBasedOnOpenshiftVersion !== undefined &&
    value > maxNodeBasedOnOpenshiftVersion
  ) {
    return msgs.maxNodes(maxNodeBasedOnOpenshiftVersion);
  }
  if (value !== undefined && typedItem?.cluster?.min_replicas !== undefined) {
    if (value < typedItem?.cluster?.min_replicas) {
      return msgs.maxLessThanMin;
    }
  }
  return undefined;
};

export const validateComputeNodes = (
  value: number | undefined,
  msgs: RosaHcpWizardReplicaValidatorStrings = defaultRosaHcpWizardValidatorStrings.replicas
): string | undefined => {
  return validatePositiveInteger(value, msgs);
};

export const validateRootDiskSize = (
  value: number | undefined,
  msgs = defaultRosaHcpWizardValidatorStrings.rootDisk,
  maxRootDiskSize: number
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Number.isInteger(value)) {
    return msgs.notInteger;
  }
  if (value < 75) {
    return msgs.tooSmall;
  }
  if (value > maxRootDiskSize && maxRootDiskSize === 1024) {
    return msgs.tooLargeOldOpenshift;
  }
  if (value > maxRootDiskSize && maxRootDiskSize === 16384) {
    return msgs.tooLargeNewOpenshift;
  }
  return undefined;
};

export const validateSecurityGroups = (
  securityGroups: string[],
  msgs: RosaHcpWizardSecurityGroupsValidatorStrings = defaultRosaHcpWizardValidatorStrings.securityGroups
) => {
  const maxSecurityGroups = 10;
  return securityGroups?.length && securityGroups.length > maxSecurityGroups
    ? msgs.maxExceeded(maxSecurityGroups)
    : undefined;
};

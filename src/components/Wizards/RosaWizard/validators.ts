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
import { CIDRSubnet } from '../types';

const lowercaseAlphaNumericCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

type Networks = Parameters<typeof overlapCidr>[0];

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

// TODO: remove any when i18next is implemented
export function validateClusterName(value: string, _item: unknown, t?: any) {
  t = t ? t : (value: any) => value;
  if (!value) return undefined;
  if (value.length > 54) return `${t('This value can contain at most 54 characters')}`;
  for (const char of value) {
    if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-' && char !== '.')
      return `${t("This value can only contain lowercase alphanumeric characters or '-' or '.'")}`;
  }
  if (!lowercaseAlphaNumericCharacters.includes(value[0]))
    return `${t('This value must start with an alphanumeric character')}`;
  if (/^[0-9]/.test(value[0])) return `${t('This value must not start with a number')}`;
  if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
    return `${t('This value must end with an alphanumeric character')}`;
  return undefined;
}

export const validateCustomOperatorRolesPrefix = (
  value: string,
  _item: unknown,
  t?: any
): string | undefined => {
  t = t ? t : (value: any) => value;
  const label = 'Custom operator roles prefix';
  if (!value) {
    return undefined;
  }
  if (!DNS_LABEL_REGEXP.test(value)) {
    const validationErrorString = `${label} '${value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;
    return t(validationErrorString);
  }
  if (value.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH) {
    const validationErrorString = `${label} may not exceed ${MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH} characters.`;
    return t(validationErrorString);
  }
  return undefined;
};

export const validateAWSKMSKeyARN = (
  value: string,
  region: string,
  t?: any
): string | undefined => {
  t = t ? t : (value: any) => value;
  if (!value) {
    return `${t('Field is required.')}`;
  }

  if (/\s/.test(value)) {
    return `${t('Value must not contain whitespaces.')}`;
  }

  if (
    value.includes(':key/mrk-')
      ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
      : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
  ) {
    return `${t('Key provided is not a valid ARN. It should be in the format "arn:aws:kms:<region>:<accountid>:key/<keyid>".')}`;
  }

  const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
  if (kmsRegion !== region) {
    return `${t('Your KMS key must contain your selected region.')}`;
  }

  return undefined;
};

export const checkNoProxyDomains = (value?: string) => {
  const stringArray = stringToArray(value);
  if (stringArray && stringArray.length > 0) {
    const invalidDomains = stringArray.filter(
      (domain) => !!domain && !(BASE_DOMAIN_REGEXP.test(domain) && BASE_DOMAIN_REGEXP.test(domain))
    );
    const plural = invalidDomains.length > 1;
    if (invalidDomains.length > 0) {
      return `The domain${plural ? 's' : ''} '${invalidDomains.join(', ')}' ${
        plural ? "aren't" : "isn't"
      } valid, 
      must contain at least two valid lower-case DNS labels separated by dots, for example 'domain.com' or 'sub.domain.com'.`;
    }
  }
  return undefined;
};

export const validateCA = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const pemRegex =
    /-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/;

  if (value.length > MAX_CA_SIZE_BYTES) {
    return 'File must be no larger than 4 MB';
  }
  if (!pemRegex.test(value)) {
    return 'Must be a PEM encoded X.509 file (.pem, .crt, .ca, .cert) and no larger than 4 MB';
  }
  return undefined;
};

export const validateUrl = (
  value: string,
  protocol: string | string[] = 'http'
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
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch (error) {
    return 'Invalid URL';
  } finally {
    const valueStart = value.substring(0, value.indexOf('://'));
    if (!protocolArr.includes(valueStart)) {
      const protocolStr = protocolArr.map((p) => `${p}://`).join(', ');
      // eslint-disable-next-line no-unsafe-finally
      return `The URL should include the scheme prefix (${protocolStr})`;
    }
  }
  return undefined;
};

export const disjointSubnets =
  (fieldName: string) =>
  (value: string | undefined, formData: { [name: string]: Networks }): string | undefined => {
    if (!value) {
      return undefined;
    }

    const networkingFields: { [key: string]: string } = {
      network_machine_cidr: 'Machine CIDR',
      network_service_cidr: 'Service CIDR',
      network_pod_cidr: 'Pod CIDR',
    };
    delete networkingFields[fieldName];
    const overlappingFields: string[] = [];

    if (CIDR_REGEXP.test(value)) {
      Object.keys(networkingFields).forEach((name) => {
        const fieldValue = formData.name ? formData.name : null;
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
      return `This subnet overlaps with the subnet${
        plural ? 's' : ''
      } in the ${overlappingFields.join(', ')} field${plural ? 's' : ''}.`;
    }
    return undefined;
  };

// Function to validate IP address masks
export const hostPrefix = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (!HOST_PREFIX_REGEXP.test(value)) {
    return `The value '${value}' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.`;
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < HOST_PREFIX_MIN) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
      return `The subnet mask can't be larger than '/${HOST_PREFIX_MIN}', which provides up to ${maxPodIPs} Pod IP addresses.`;
    }
    if (prefixLength > HOST_PREFIX_MAX) {
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
      return `The subnet mask can't be smaller than '/${HOST_PREFIX_MAX}', which provides up to ${maxPodIPs} Pod IP addresses.`;
    }
  }

  return undefined;
};

// Function to validate IP address blocks
export const cidr = (value?: string): string | undefined => {
  if (value && !CIDR_REGEXP.test(value)) {
    return `IP address range '${value}' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.`;
  }
  return undefined;
};

export const validateRange = (value?: string): string | undefined => {
  if (cidr(value) !== undefined || !value) {
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
    return 'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.';
  }
  return undefined;
};

export const awsMachineCidr = (
  value?: string,
  formData?: Record<string, string>
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData?.multi_az === 'true';
  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength < AWS_MACHINE_CIDR_MIN) {
      return `The subnet mask can't be larger than '/${AWS_MACHINE_CIDR_MIN}'.`;
    }

    if (
      (isMultiAz || formData?.hypershift === 'true') &&
      prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ
    ) {
      return `The subnet mask can't be smaller than '/${AWS_MACHINE_CIDR_MAX_MULTI_AZ}'.`;
    }

    if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
      return `The subnet mask can't be smaller than '/${AWS_MACHINE_CIDR_MAX_SINGLE_AZ}'.`;
    }
  }

  return undefined;
};

export const serviceCidr = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);

  if (prefixLength != null) {
    if (prefixLength > SERVICE_CIDR_MAX) {
      const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
      return `The subnet mask can't be smaller than '/${SERVICE_CIDR_MAX}', which provides up to ${maxServices} services.`;
    }
  }

  return undefined;
};

export const podCidr = (value?: string, network_host_prefix?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const prefixLength = parseCIDRSubnetLength(value);
  if (prefixLength != null) {
    if (prefixLength > POD_CIDR_MAX) {
      return `The subnet mask can't be smaller than /${POD_CIDR_MAX}.`;
    }

    const hostPrefix = parseCIDRSubnetLength(network_host_prefix) || 23;
    const maxPodIPs = 2 ** (32 - hostPrefix);
    const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
    if (maxPodNodes < POD_NODES_MIN) {
      return `The subnet mask of /${prefixLength} does not allow for enough nodes. Try changing the host prefix or the pod subnet range.`;
    }
  }

  return undefined;
};

export const subnetCidrs = (
  value?: string,
  formData?: Record<string, string>,
  fieldName?: string,
  selectedSubnets?: CIDRSubnet[]
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
      return `The Machine CIDR does not include the starting IP (${startingIP(
        erroredSubnets[0].cidr_block
      )}) of ${subnetName()}`;
    }
  }
  if (fieldName === 'network_service_cidr') {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return `The Service CIDR overlaps with ${subnetName()} CIDR 
        '${erroredSubnets[0].cidr_block}'`;
      }
      return `The Service CIDR includes the starting IP (${startingIP(
        erroredSubnets[0].cidr_block
      )}) of ${subnetName()}`;
    }
  }
  if (fieldName === 'network_pod_cidr') {
    compareCidrs(false);
    if (erroredSubnets.length > 0) {
      if (erroredSubnets[0]?.overlaps) {
        return `The Pod CIDR overlaps with ${subnetName()} CIDR 
        '${erroredSubnets[0].cidr_block}'`;
      }
      return `The Pod CIDR includes the starting IP (${startingIP(
        erroredSubnets[0].cidr_block
      )}) of ${subnetName()}`;
    }
  }

  return undefined;
};

export const awsSubnetMask =
  (fieldName: string | undefined) =>
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
        return `Subnet mask must be between /1 and /${maskRange[1]}.`;
      }
      return undefined;
    }
    if (!(maskRange[0] <= maskBits && maskBits <= maskRange[1])) {
      return `Subnet mask must be between /${maskRange[0]} and /${maskRange[1]}.`;
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

export const validatePositiveInteger = (value: number | undefined): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Number.isInteger(value)) {
    return 'Input must be an integer.';
  }
  if (value <= 0) {
    return 'Input must be a positive number.';
  }
  return undefined;
};

export const validateMinReplicas = (
  value: number | undefined,
  item?: unknown
): string | undefined => {
  const positiveError = validatePositiveInteger(value);
  if (positiveError) return positiveError;
  const typedItem = item as { cluster?: { max_replicas?: number } } | undefined;
  if (value !== undefined && value > 500) {
    return 'Input cannot be more than 500.';
  }
  if (value !== undefined && typedItem?.cluster?.max_replicas !== undefined) {
    if (value > typedItem?.cluster?.max_replicas) {
      return 'Min nodes cannot be greater than max nodes.';
    }
  }
  return undefined;
};

export const validateMaxReplicas = (
  value: number | undefined,
  item?: unknown
): string | undefined => {
  const positiveError = validatePositiveInteger(value);
  if (positiveError) return positiveError;
  const typedItem = item as { cluster?: { min_replicas?: number } } | undefined;
  if (value !== undefined && value > 500) {
    return 'Input cannot be more than 500.';
  }
  if (value !== undefined && typedItem?.cluster?.min_replicas !== undefined) {
    if (value < typedItem?.cluster?.min_replicas) {
      return 'Max nodes must be greater than or equal to min nodes.';
    }
  }
  return undefined;
};

export const validateComputeNodes = (value: number | undefined): string | undefined => {
  return validatePositiveInteger(value);
};

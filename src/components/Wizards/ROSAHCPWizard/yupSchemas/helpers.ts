import * as yup from 'yup';
import { overlapCidr } from 'cidr-tools';
import IPCIDR from 'ip-cidr';

import { CIDR_REGEXP } from '../constants';
import type { ClusterFormData } from '../../types';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';
import type { ValidationSchemaContext } from './types';

export const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';

export function ctx(testContext: yup.TestContext): ValidationSchemaContext {
  return testContext.options.context as ValidationSchemaContext;
}

export function isValidCidr(value: string): boolean {
  return CIDR_REGEXP.test(value);
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
  if (/^[0-9]/.test(value[0])) return msgs.mustNotStartNumber;
  if (!LOWERCASE_ALPHANUMERIC.includes(value[value.length - 1])) return msgs.mustEndAlphanumeric;
  return undefined;
}

export function findOverlappingCidrFields(
  value: string,
  fieldName: string,
  formData: Partial<ClusterFormData>,
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

export const requiredMessage = (_params: yup.TestContext) => {
  return 'This field is required';
};

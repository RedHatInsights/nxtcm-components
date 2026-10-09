import { overlapCidr } from 'cidr-tools';
import * as yup from 'yup';

import { CIDR_REGEXP, LOWERCASE_ALPHANUMERIC, MAX_CLUSTER_NAME_LENGTH } from '../constants';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';
import { ROSAHCPCluster } from '../types';
import type { ValidationSchemaContext } from './types';

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
  const [address, prefix] = cidr.split('/');
  const maskBits = Number(prefix);

  return address
    .split('.')
    .map(Number)
    .map((octet, index) => {
      const bitsInOctet = Math.min(Math.max(maskBits - index * 8, 0), 8);
      const mask = bitsInOctet === 0 ? 0 : 256 - 2 ** (8 - bitsInOctet);
      return octet & mask;
    })
    .join('.');
}

export function validateClusterNameSync(
  value: string,
  msgs: RosaHcpWizardValidatorStrings['clusterName']
): string | undefined {
  if (!value) return undefined;
  if (value.length > MAX_CLUSTER_NAME_LENGTH) return msgs.maxLength;
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
 * Yup transform for required **string** fields (selects, text inputs).
 * Use before {@link rosaCommonRequiredNonEmptyTest} and `.required()`.
 * Coerces `null` to `''`; untouched `undefined` is handled by {@link coerceAbsentRequiredFieldValues}.
 */
function rosaAbsentStringToEmpty(value: unknown, originalValue: unknown): unknown {
  return originalValue == null ? '' : value;
}

/**
 * Yup transform for required **mixed** object selects (e.g. VPC).
 * Use before {@link rosaCommonRequiredNonEmptyTest} and `.required()`.
 * Coerces `null` to `{}`; untouched `undefined` is handled by {@link coerceAbsentRequiredFieldValues}.
 */
function rosaUndefinedMixedToAbsentObject(value: unknown, originalValue: unknown): unknown {
  return originalValue == null ? {} : value;
}

function isAbsentRequiredValue(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value !== 'object') {
    return false;
  }
  if (Object.keys(value).length === 0) {
    return true;
  }
  const id = (value as { id?: unknown }).id;
  if (typeof id === 'string') {
    return id.trim() === '';
  }
  return id == null || id === '';
}

/**
 * Yup test paired with `.required()` (via {@link rosaRequiredStringField} / {@link rosaRequiredMixedField})
 * so the message comes from
 * {@link RosaHcpWizardValidatorStrings.commonRequired} (override via `strings.validators.commonRequired`
 * on {@link RosaHCPWizard} / the strings provider).
 *
 * Treats a value as **missing** when it is `null`/`undefined`, an empty string, or an empty array.
 * Non-empty strings, non-empty arrays, and non-null objects (e.g. a selected VPC record from the machine pools step)
 * count as present.
 *
 * **Required field pattern:** {@link rosaRequiredStringField}, {@link rosaRequiredMixedField}, or
 * {@link rosaRequiredArrayField}.
 */
function rosaRequiredPresentValue<TContext extends yup.AnyObject>(
  this: yup.TestContext<TContext>,
  value: unknown
): true | yup.ValidationError {
  if (isAbsentRequiredValue(value)) {
    return this.createError({ message: ctx(this).msgs.commonRequired });
  }
  return true;
}

/**
 * Use on `string` / `mixed` / `array` schemas with `.required()` — see {@link rosaRequiredPresentValue}.
 * `skipAbsent: false` ensures `null` / `''` / `[]` are validated (Yup skips absent values by default).
 */
export const rosaCommonRequiredNonEmptyTest = {
  name: 'rosa-common-required-nonempty',
  exclusive: true,
  skipAbsent: false,
  test: rosaRequiredPresentValue,
};

/**
 * Required string field (select, text): transform + {@link rosaCommonRequiredNonEmptyTest} + `.required()`.
 * Untouched top-level `undefined` is coerced in {@link coerceAbsentRequiredFieldValues} before validate.
 */
export function rosaRequiredStringField(): yup.StringSchema {
  return yup
    .string()
    .transform(rosaAbsentStringToEmpty)
    .test(rosaCommonRequiredNonEmptyTest)
    .required();
}

/**
 * Required object select (`mixed`, e.g. VPC): {@link rosaUndefinedMixedToAbsentObject} + test + `.required()`.
 */
export function rosaRequiredMixedField(): yup.MixedSchema {
  return yup
    .mixed()
    .transform(rosaUndefinedMixedToAbsentObject)
    .test(rosaCommonRequiredNonEmptyTest)
    .required();
}

/**
 * Required non-empty array: test + `.required()`. Optional `defaultValue` for structural row shape
 * (e.g. `[{ machine_pool_subnet: '' }]`); use {@link rosaRequiredStringField} on item fields for leaf validation.
 */
export function rosaRequiredArrayField<T>(
  of: yup.ISchema<T>,
  defaultValue?: T[]
): yup.ArraySchema<T[], yup.AnyObject, T[] | undefined, '' | 'd'> {
  const schema = yup.array<yup.AnyObject, T>(of);
  const schemaWithDefault = defaultValue === undefined ? schema : schema.default(defaultValue);
  return schemaWithDefault.test(rosaCommonRequiredNonEmptyTest).required();
}

import {
  AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX,
  AWS_KMS_SERVICE_ACCOUNT_REGEX,
  MAX_SECURITY_GROUPS,
} from './constants';
import {
  defaultRosaHcpWizardValidatorStrings,
  type RosaHcpWizardKmsKeyValidatorStrings,
  type RosaHcpWizardSecurityGroupsValidatorStrings,
} from './stringsProvider/rosaHcpWizardStrings';

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

export const validateSecurityGroups = (
  securityGroups: string[],
  msgs: RosaHcpWizardSecurityGroupsValidatorStrings = defaultRosaHcpWizardValidatorStrings.securityGroups
) => {
  return securityGroups?.length && securityGroups.length > MAX_SECURITY_GROUPS
    ? msgs.maxExceeded(MAX_SECURITY_GROUPS)
    : undefined;
};

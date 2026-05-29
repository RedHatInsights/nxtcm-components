import * as yup from 'yup';

import { ClusterEncryptionKeys } from '../components/Wizards/ROSAHCPWizard/types';
import { clusterValidationSchema } from '../components/Wizards/ROSAHCPWizard/yupSchemas';
import { isYupFieldRequired, requiredFromYup } from './yupFieldRequired';

describe('isYupFieldRequired', () => {
  it('returns true when the leaf schema is required', () => {
    const schema = yup.object({
      acceptTerms: yup.boolean().oneOf([true], 'You must accept.').required(),
    });
    expect(isYupFieldRequired(schema, 'acceptTerms')).toBe(true);
  });

  it('returns false when the leaf schema is optional', () => {
    const schema = yup.object({
      optIn: yup.boolean().optional(),
    });
    expect(isYupFieldRequired(schema, 'optIn')).toBe(false);
  });

  it('supports nested paths via yup.reach', () => {
    const schema = yup.object({
      user: yup.object({
        name: yup.string().required(),
      }),
    });
    expect(isYupFieldRequired(schema, 'user.name')).toBe(true);
  });

  it('resolves conditionally required encryption Key ARN fields via describe value', () => {
    expect(
      isYupFieldRequired(clusterValidationSchema, 'kms_key_arn', {
        value: { encryption_keys: ClusterEncryptionKeys.default },
      })
    ).toBe(false);
    expect(
      isYupFieldRequired(clusterValidationSchema, 'kms_key_arn', {
        value: { encryption_keys: ClusterEncryptionKeys.custom },
      })
    ).toBe(true);
    expect(
      isYupFieldRequired(clusterValidationSchema, 'etcd_key_arn', {
        value: { etcd_encryption: false },
      })
    ).toBe(false);
    expect(
      isYupFieldRequired(clusterValidationSchema, 'etcd_key_arn', {
        value: { etcd_encryption: true },
      })
    ).toBe(true);
  });
});

describe('requiredFromYup', () => {
  const schema = yup.object({
    a: yup.string().required(),
    b: yup.string().optional(),
  });

  it('matches isYupFieldRequired when schema is set', () => {
    expect(requiredFromYup(schema, 'a')).toBe(true);
    expect(requiredFromYup(schema, 'b')).toBe(false);
  });

  it('returns undefined when schema is omitted', () => {
    expect(requiredFromYup(undefined, 'a')).toBeUndefined();
  });

  it('pairs with explicit isRequired via nullish coalescing', () => {
    const fromProps = (isRequiredProp: boolean | undefined) =>
      isRequiredProp ?? requiredFromYup(schema, 'a');
    expect(fromProps(false)).toBe(false);
    expect(fromProps(true)).toBe(true);
    expect(fromProps(undefined)).toBe(true);
  });
});

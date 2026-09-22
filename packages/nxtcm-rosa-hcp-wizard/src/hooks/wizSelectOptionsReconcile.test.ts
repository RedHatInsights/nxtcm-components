import * as yup from 'yup';

import { clusterValidationSchema } from '../yupSchemas';

import {
  flattenWizSelectOptionsForReconcile,
  readWizSelectFieldMetaByPath,
  reconcileWizSelectFormValue,
  shouldReconcileWizSelectValue,
  wizSelectValueToReconcileString,
} from './wizSelectOptionsReconcile';

const RECONCILE_ENABLED_SELECT_PATHS = [
  'cluster_version',
  'associated_aws_id',
  'billing_account_id',
  'region',
  'installer_role_arn',
  'byo_oidc_config_id',
  'selected_vpc',
  'machine_pools_subnets.0.machine_pool_subnet',
  'machine_type',
  'cluster_privacy_public_subnet_id',
] as const;

describe('wizSelectOptionsReconcile', () => {
  describe('shouldReconcileWizSelectValue', () => {
    it('defaults to true for select fields in the cluster schema', () => {
      expect(shouldReconcileWizSelectValue(clusterValidationSchema, 'region')).toBe(true);
    });

    it('returns false when reconcileValueWithOptions is false', () => {
      expect(shouldReconcileWizSelectValue(clusterValidationSchema, 'security_groups_worker')).toBe(
        false
      );
    });

    it('returns false for non-select fields', () => {
      expect(shouldReconcileWizSelectValue(clusterValidationSchema, 'name')).toBe(false);
      expect(shouldReconcileWizSelectValue(clusterValidationSchema, 'support_role_arn')).toBe(
        false
      );
      expect(shouldReconcileWizSelectValue(clusterValidationSchema, 'worker_role_arn')).toBe(false);
    });

    it('requires optionsWizardDataResource when reconcile is enabled', () => {
      for (const path of RECONCILE_ENABLED_SELECT_PATHS) {
        expect(shouldReconcileWizSelectValue(clusterValidationSchema, path)).toBe(true);
        expect(
          readWizSelectFieldMetaByPath(clusterValidationSchema, path)?.optionsWizardDataResource
        ).toBeDefined();
      }
    });
  });

  describe('flattenWizSelectOptionsForReconcile', () => {
    it('flattens primitive and object options', () => {
      expect(
        flattenWizSelectOptionsForReconcile({
          options: ['us-east-1', { label: 'West', value: 'us-west-2' }],
        })
      ).toEqual([
        { label: 'us-east-1', value: 'us-east-1' },
        { label: 'West', value: 'us-west-2' },
      ]);
    });

    it('flattens grouped options', () => {
      expect(
        flattenWizSelectOptionsForReconcile({
          optionGroups: [
            {
              label: 'Group A',
              options: [{ label: 'East', value: 'us-east-1' }],
            },
          ],
        })
      ).toEqual([{ label: 'East', value: 'us-east-1' }]);
    });
  });

  describe('wizSelectValueToReconcileString', () => {
    it('returns a non-empty string value directly', () => {
      expect(wizSelectValueToReconcileString('us-east-1', 'value')).toBe('us-east-1');
    });

    it('returns empty string for null', () => {
      expect(wizSelectValueToReconcileString(null, 'value')).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(wizSelectValueToReconcileString(undefined, 'value')).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(wizSelectValueToReconcileString('', 'value')).toBe('');
    });

    it('converts a number value to string', () => {
      expect(wizSelectValueToReconcileString(42, 'value')).toBe('42');
    });

    it('converts zero to string', () => {
      expect(wizSelectValueToReconcileString(0, 'value')).toBe('0');
    });

    it('returns keyed string from an object', () => {
      expect(wizSelectValueToReconcileString({ value: 'east' }, 'value')).toBe('east');
    });

    it('converts keyed number from an object to string', () => {
      expect(wizSelectValueToReconcileString({ value: 7 }, 'value')).toBe('7');
    });

    it('falls through keyed boolean to id fallback', () => {
      expect(wizSelectValueToReconcileString({ value: true, id: 'fallback-id' }, 'value')).toBe(
        'fallback-id'
      );
    });

    it('falls through keyed null to id fallback', () => {
      expect(wizSelectValueToReconcileString({ value: null, id: 'id-1' }, 'value')).toBe('id-1');
    });

    it('falls through keyed empty string to id fallback', () => {
      expect(wizSelectValueToReconcileString({ value: '', id: 'id-2' }, 'value')).toBe('id-2');
    });

    it('reads id from VPC-shaped objects', () => {
      expect(
        wizSelectValueToReconcileString({ id: 'vpc-abc', name: 'my-vpc', aws_subnets: [] }, 'value')
      ).toBe('vpc-abc');
    });

    it('returns empty string for object without keyed value or id', () => {
      expect(wizSelectValueToReconcileString({ name: 'no-key-no-id' }, 'value')).toBe('');
    });

    it('resolves nested keyPath with dot notation', () => {
      expect(wizSelectValueToReconcileString({ a: { b: 'deep' } }, 'a.b')).toBe('deep');
    });

    it('converts boolean true to string', () => {
      expect(wizSelectValueToReconcileString(true, 'value')).toBe('true');
    });

    it('converts boolean false to string', () => {
      expect(wizSelectValueToReconcileString(false, 'value')).toBe('false');
    });
  });

  describe('reconcileWizSelectFormValue', () => {
    it('keeps the current value when it is still in the option list', () => {
      expect(
        reconcileWizSelectFormValue({
          name: 'region',
          schema: clusterValidationSchema,
          currentValue: 'us-east-1',
          newOptions: [{ label: 'East', value: 'us-east-1' }],
        })
      ).toBe('us-east-1');
    });

    it('resets to schema default when the value is missing from new options', () => {
      expect(
        reconcileWizSelectFormValue({
          name: 'region',
          schema: clusterValidationSchema,
          currentValue: 'eu-central-1',
          newOptions: [{ label: 'East', value: 'us-east-1' }],
        })
      ).toBe('');
    });

    it('resets selected_vpc to empty when the VPC is not in the refreshed list', () => {
      expect(
        reconcileWizSelectFormValue({
          name: 'selected_vpc',
          schema: clusterValidationSchema,
          currentValue: 'vpc-missing',
          newOptions: [{ label: 'Prod VPC', value: 'vpc-prod' }],
        })
      ).toBe('');
    });

    it('uses a custom schema default when provided', () => {
      const schema = yup.object({
        flavor: yup.string().default('vanilla'),
      });

      expect(
        reconcileWizSelectFormValue({
          name: 'flavor',
          schema,
          currentValue: 'chocolate',
          newOptions: [{ label: 'Vanilla', value: 'vanilla' }],
        })
      ).toBe('vanilla');
    });

    it('applies schema default when the field is empty and options first load', () => {
      const schema = yup.object({
        flavor: yup.string().default('vanilla'),
      });

      expect(
        reconcileWizSelectFormValue({
          name: 'flavor',
          schema,
          currentValue: '',
          newOptions: [{ label: 'Vanilla', value: 'vanilla' }],
        })
      ).toBe('vanilla');
    });
  });
});

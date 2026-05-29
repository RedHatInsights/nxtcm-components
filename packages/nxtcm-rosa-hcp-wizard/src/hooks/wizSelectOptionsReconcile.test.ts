import * as yup from 'yup';

import { clusterValidationSchema } from '../yupSchemas';

import {
  flattenWizSelectOptionsForReconcile,
  reconcileWizSelectFormValue,
  shouldReconcileWizSelectValue,
  wizSelectValueToReconcileString,
} from './wizSelectOptionsReconcile';

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
    it('reads id from VPC-shaped objects', () => {
      expect(
        wizSelectValueToReconcileString({ id: 'vpc-abc', name: 'my-vpc', aws_subnets: [] }, 'value')
      ).toBe('vpc-abc');
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

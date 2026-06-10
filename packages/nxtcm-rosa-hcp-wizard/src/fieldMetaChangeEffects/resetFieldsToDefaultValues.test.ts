import type { UseFormSetValue } from 'react-hook-form';

import type { ROSAHCPCluster } from '../types';
import { getClusterValidationSchemaDefaultValues } from '../yupSchemas';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';

describe('resetFieldsToDefaultValues', () => {
  it('sets each field from form defaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const defaults = getClusterValidationSchemaDefaultValues();

    resetFieldsToDefaultValues(setValue, ['name', 'autoscaling']);

    expect(setValue).toHaveBeenCalledWith('name', defaults.name, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });
    expect(setValue).toHaveBeenCalledWith('autoscaling', defaults.autoscaling, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });
  });

  it('clears selected_vpc when it is omitted from form defaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    resetFieldsToDefaultValues(setValue, ['selected_vpc']);

    expect(setValue).toHaveBeenCalledWith('selected_vpc', undefined, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });
  });

  it('resets machine_pools_subnets to one empty subnet row', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const defaults = getClusterValidationSchemaDefaultValues();

    resetFieldsToDefaultValues(setValue, ['machine_pools_subnets']);

    expect(setValue).toHaveBeenCalledWith(
      'machine_pools_subnets',
      defaults.machine_pools_subnets,
      expect.any(Object)
    );
  });

  it('skips setValue when array dependents already match schema defaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const defaults = getClusterValidationSchemaDefaultValues();

    resetFieldsToDefaultValues(
      setValue,
      ['machine_pools_subnets', 'security_groups_worker'],
      {},
      {
        machine_pools_subnets: [{ machine_pool_subnet: '' }],
        security_groups_worker: [],
      }
    );

    expect(setValue).not.toHaveBeenCalledWith(
      'machine_pools_subnets',
      defaults.machine_pools_subnets,
      expect.any(Object)
    );
    expect(setValue).not.toHaveBeenCalledWith('security_groups_worker', [], expect.any(Object));
  });
});

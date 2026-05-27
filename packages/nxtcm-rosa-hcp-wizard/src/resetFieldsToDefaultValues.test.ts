import type { UseFormSetValue } from 'react-hook-form';

import type { ROSAHCPCluster } from './types';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';

import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';

describe('resetFieldsToDefaultValues', () => {
  it('sets each field from form defaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const defaults = getClusterValidationSchemaDefaultValues();

    resetFieldsToDefaultValues(setValue, ['name', 'autoscaling']);

    expect(setValue).toHaveBeenCalledWith('name', defaults.name, expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('autoscaling', defaults.autoscaling, expect.any(Object));
  });

  it('clears selected_vpc when it is omitted from form defaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    resetFieldsToDefaultValues(setValue, ['selected_vpc']);

    expect(setValue).toHaveBeenCalledWith('selected_vpc', undefined, expect.any(Object));
  });
});

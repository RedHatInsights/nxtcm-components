import type { UseFormSetValue } from 'react-hook-form';

import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import type { ROSAHCPCluster } from '../types';
import {
  getWizardFieldSyncsForSourceField,
  maxReplicasSchema,
  minReplicasSchema,
  nodesComputeSchema,
} from '../yupSchemas';

const autoscalingSyncRules = getWizardFieldSyncsForSourceField('autoscaling');
const defaultMinReplicas = minReplicasSchema.getDefault() as number;
const defaultMaxReplicas = maxReplicasSchema.getDefault() as number;
const defaultNodesCompute = nodesComputeSchema.getDefault() as number;

describe('syncFieldsOnSourceChange', () => {
  it('sets replica defaults and clears compute count when autoscaling is enabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const clearErrors = jest.fn();

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, true, {}, clearErrors);

    expect(setValue).toHaveBeenCalledWith('nodes_compute', undefined, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith('min_replicas', defaultMinReplicas, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith('max_replicas', defaultMaxReplicas, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(clearErrors).toHaveBeenCalledWith(['nodes_compute', 'min_replicas', 'max_replicas']);
  });

  it('restores compute count and clears replicas when autoscaling is disabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const clearErrors = jest.fn();

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, false, {}, clearErrors);

    expect(setValue).toHaveBeenCalledWith('min_replicas', undefined, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith('max_replicas', undefined, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith('nodes_compute', defaultNodesCompute, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    expect(clearErrors).toHaveBeenCalledWith(['min_replicas', 'max_replicas', 'nodes_compute']);
  });

  it('clears inactive fields without applying setDefaults when clearOnly is set', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, true, { clearOnly: true });

    expect(setValue).toHaveBeenCalledWith('nodes_compute', undefined, expect.any(Object));
    expect(setValue).not.toHaveBeenCalledWith(
      'min_replicas',
      expect.anything(),
      expect.any(Object)
    );
    expect(setValue).not.toHaveBeenCalledWith(
      'max_replicas',
      expect.anything(),
      expect.any(Object)
    );
  });

  it('does nothing when the current value matches no branch', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, undefined);

    expect(setValue).not.toHaveBeenCalled();
  });
});

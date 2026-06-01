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

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, true);

    expect(setValue).toHaveBeenCalledWith('nodes_compute', undefined, expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('min_replicas', defaultMinReplicas, expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('max_replicas', defaultMaxReplicas, expect.any(Object));
  });

  it('restores compute count and clears replicas when autoscaling is disabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, false);

    expect(setValue).toHaveBeenCalledWith('min_replicas', undefined, expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('max_replicas', undefined, expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('nodes_compute', defaultNodesCompute, expect.any(Object));
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

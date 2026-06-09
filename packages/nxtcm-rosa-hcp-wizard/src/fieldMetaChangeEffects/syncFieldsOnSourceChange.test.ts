import type { UseFormSetValue } from 'react-hook-form';

import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import type { ROSAHCPCluster } from '../types';
import {
  getWizardFieldSyncsForSourceField,
  maxReplicasSchema,
  minReplicasSchema,
  networkHostPrefixSchema,
  networkMachineCidrSchema,
  networkPodCidrSchema,
  networkServiceCidrSchema,
  nodesComputeSchema,
} from '../yupSchemas';

const autoscalingSyncRules = getWizardFieldSyncsForSourceField('autoscaling');
const cidrDefaultSyncRules = getWizardFieldSyncsForSourceField('cidr_default');
const defaultMachineCidr = networkMachineCidrSchema.getDefault() as string;
const defaultServiceCidr = networkServiceCidrSchema.getDefault() as string;
const defaultPodCidr = networkPodCidrSchema.getDefault() as string;
const defaultHostPrefix = networkHostPrefixSchema.getDefault() as string;
const defaultMinReplicas = minReplicasSchema.getDefault() as number;
const defaultMaxReplicas = maxReplicasSchema.getDefault() as number;
const defaultNodesCompute = nodesComputeSchema.getDefault() as number;
const clearFieldOpts = { shouldDirty: true, shouldTouch: false, shouldValidate: false };
const setDefaultsWithValidateOpts = { shouldDirty: true, shouldTouch: false, shouldValidate: true };

describe('syncFieldsOnSourceChange', () => {
  it('sets replica defaults and clears compute count when autoscaling is enabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, true);

    expect(setValue).toHaveBeenCalledWith('nodes_compute', undefined, clearFieldOpts);
    expect(setValue).toHaveBeenCalledWith(
      'min_replicas',
      defaultMinReplicas,
      setDefaultsWithValidateOpts
    );
    expect(setValue).toHaveBeenCalledWith(
      'max_replicas',
      defaultMaxReplicas,
      setDefaultsWithValidateOpts
    );
  });

  it('restores compute count and clears replicas when autoscaling is disabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, false);

    expect(setValue).toHaveBeenCalledWith('min_replicas', undefined, clearFieldOpts);
    expect(setValue).toHaveBeenCalledWith('max_replicas', undefined, clearFieldOpts);
    expect(setValue).toHaveBeenCalledWith(
      'nodes_compute',
      defaultNodesCompute,
      setDefaultsWithValidateOpts
    );
  });

  it('clears inactive fields without applying setDefaults when clearOnly is set', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, true, { clearOnly: true });

    expect(setValue).toHaveBeenCalledWith('nodes_compute', undefined, clearFieldOpts);
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

  it('applies shouldValidate when writing synced defaults for every sync branch', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, cidrDefaultSyncRules, true);

    expect(setValue).toHaveBeenCalledWith(
      'network_machine_cidr',
      defaultMachineCidr,
      setDefaultsWithValidateOpts
    );
    expect(setValue).toHaveBeenCalledWith(
      'network_service_cidr',
      defaultServiceCidr,
      setDefaultsWithValidateOpts
    );
    expect(setValue).toHaveBeenCalledWith(
      'network_pod_cidr',
      defaultPodCidr,
      setDefaultsWithValidateOpts
    );
    expect(setValue).toHaveBeenCalledWith(
      'network_host_prefix',
      defaultHostPrefix,
      setDefaultsWithValidateOpts
    );
  });

  it('does nothing when the current value matches no branch', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncFieldsOnSourceChange(setValue, autoscalingSyncRules, undefined);

    expect(setValue).not.toHaveBeenCalled();
  });
});

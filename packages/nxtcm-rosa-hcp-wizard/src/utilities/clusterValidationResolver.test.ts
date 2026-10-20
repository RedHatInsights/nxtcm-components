import type { ROSAHCPCluster } from '../types';
import { coerceAbsentRequiredFieldValues } from './clusterValidationResolver';

describe('coerceAbsentRequiredFieldValues', () => {
  it('adds validation sentinels without mutating the domain object', () => {
    const values: ROSAHCPCluster = { autoscaling: false, nodes_compute: 0 };
    const result = coerceAbsentRequiredFieldValues(values);

    expect(result.name).toBe('');
    expect(result.selected_vpc).toEqual({});
    expect(result.autoscaling).toBe(false);
    expect(result.nodes_compute).toBe(0);
    expect(result.machine_pools_subnets).toBeUndefined();
    expect(values).toEqual({ autoscaling: false, nodes_compute: 0 });
  });

  it('preserves supplied domain values', () => {
    const values: ROSAHCPCluster = { name: 'example', selected_vpc: 'vpc-1' };
    const result = coerceAbsentRequiredFieldValues(values);

    expect(result.name).toBe('example');
    expect(result.selected_vpc).toBe('vpc-1');
  });
});

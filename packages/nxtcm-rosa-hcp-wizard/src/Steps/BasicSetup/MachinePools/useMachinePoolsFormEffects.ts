import { useLayoutEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { ROSAHCPCluster } from '../../../types';

/** Ensures at least one machine pool subnet row exists for the single-subnet UI. */
export function useEnsureMachinePoolSubnetRow(): void {
  const { setValue } = useFormContext<Partial<ROSAHCPCluster>>();
  const machinePoolsSubnets = useWatch({ name: 'machine_pools_subnets' });

  useLayoutEffect(() => {
    if (!machinePoolsSubnets?.length) {
      setValue('machine_pools_subnets', [{ machine_pool_subnet: '' }]);
    }
  }, [machinePoolsSubnets, setValue]);
}

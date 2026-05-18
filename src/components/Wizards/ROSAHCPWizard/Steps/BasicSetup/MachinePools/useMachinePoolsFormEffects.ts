import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { ClusterFormData } from '../../../../types';
import { resetMachinePoolVpcDependentFields } from '../../../resetMachinePoolVpcDependentFields';
import { minReplicasSchema, maxReplicasSchema, nodesComputeSchema } from '../../../yupSchemas';

const defaultMinReplicas = minReplicasSchema.getDefault() as number;
const defaultMaxReplicas = maxReplicasSchema.getDefault() as number;
const defaultNodesCompute = nodesComputeSchema.getDefault() as number;

/** Resets subnet and security group selections when the selected VPC changes. */
export function useResetOnVpcChange(vpcId: string | undefined): void {
  const { setValue } = useFormContext<Partial<ClusterFormData>>();
  const prevVpcIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (vpcId === undefined) {
      prevVpcIdRef.current = undefined;
      return;
    }
    if (prevVpcIdRef.current !== undefined && prevVpcIdRef.current !== vpcId) {
      resetMachinePoolVpcDependentFields(setValue, { clearSelectedVpc: false });
    }
    prevVpcIdRef.current = vpcId;
  }, [vpcId, setValue]);
}

/** Ensures at least one machine pool subnet row exists for the single-subnet UI. */
export function useEnsureMachinePoolSubnetRow(): void {
  const { setValue } = useFormContext<Partial<ClusterFormData>>();
  const machinePoolsSubnets = useWatch({ name: 'machine_pools_subnets' });

  useLayoutEffect(() => {
    if (!machinePoolsSubnets?.length) {
      setValue('machine_pools_subnets', [{ machine_pool_subnet: '' }]);
    }
  }, [machinePoolsSubnets, setValue]);
}

/** Applies default replica / compute values when autoscaling is toggled. */
export function useAutoscalingFieldDefaults(autoscaling: boolean | undefined): void {
  const { setValue } = useFormContext<Partial<ClusterFormData>>();
  const prevAutoscalingRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const prev = prevAutoscalingRef.current;
    prevAutoscalingRef.current = autoscaling;
    if (prev === undefined || prev === autoscaling) {
      return;
    }
    if (autoscaling) {
      setValue('nodes_compute', undefined);
      setValue('min_replicas', defaultMinReplicas);
      setValue('max_replicas', defaultMaxReplicas);
    } else {
      setValue('min_replicas', undefined);
      setValue('max_replicas', undefined);
      setValue('nodes_compute', defaultNodesCompute);
    }
  }, [autoscaling, setValue]);
}

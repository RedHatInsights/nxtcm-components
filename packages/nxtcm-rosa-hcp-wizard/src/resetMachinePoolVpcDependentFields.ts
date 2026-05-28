import type { UseFormSetValue } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';

export type ResetMachinePoolVpcDependentFieldsOptions = {
  /** When true (default), clears `selected_vpc`. Set false when the user is changing VPC on the machine pool step. */
  clearSelectedVpc?: boolean;
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
};

function createEmptyMachinePoolSubnets(): ClusterFormData['machine_pools_subnets'] {
  return [{ machine_pool_subnet: '' }];
}

/** Clears VPC-dependent machine pool fields with aligned react-hook-form flags. */
export function resetMachinePoolVpcDependentFields(
  setValue: UseFormSetValue<Partial<ClusterFormData>>,
  options: ResetMachinePoolVpcDependentFieldsOptions = {}
): void {
  const {
    clearSelectedVpc = true,
    shouldDirty = true,
    shouldTouch = false,
    shouldValidate = false,
  } = options;

  const setOpts = { shouldDirty, shouldTouch, shouldValidate };

  if (clearSelectedVpc) {
    setValue('selected_vpc', undefined, setOpts);
  }
  setValue('machine_pools_subnets', createEmptyMachinePoolSubnets(), setOpts);
  setValue('security_groups_worker', [], setOpts);
}

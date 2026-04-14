import type { FieldPath } from 'react-hook-form';
import { ClusterNetwork, RosaWizardFormData } from '../../types';

/** Cluster fields cleared by {@link updateOnAWSAccountChange}; re-validate after `reset()` so RHF repopulates errors. */
export const clusterFieldPathsClearedOnAwsAccountChange: FieldPath<RosaWizardFormData>[] = [
  'cluster.installer_role_arn',
  'cluster.support_role_arn',
  'cluster.worker_role_arn',
  'cluster.cluster_privacy_public_subnet_id',
  'cluster.selected_vpc',
  'cluster.machine_pools_subnets',
];

export const updateOnAWSAccountChange = async (
  value: string,
  item: RosaWizardFormData,
  refetch?: (param: string) => Promise<void>
) => {
  /**
   * Assign explicit `undefined` / `[]` instead of `delete`. RHF `reset(mergedValues)` can leave
   * omitted nested keys at their previous values; stale `selected_vpc` or `machine_pools_subnets`
   * then skips required errors and subnet rows keep old subnet ids.
   */
  item.cluster.installer_role_arn = undefined;
  item.cluster.support_role_arn = undefined;
  item.cluster.worker_role_arn = undefined;
  item.cluster.cluster_privacy_public_subnet_id = undefined;
  item.cluster.selected_vpc = undefined;
  item.cluster.machine_pools_subnets = [];

  item.cluster.cluster_privacy = ClusterNetwork.external;

  if (refetch) await refetch(value);
};

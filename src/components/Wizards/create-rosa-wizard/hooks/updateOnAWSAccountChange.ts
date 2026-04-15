import { ClusterNetwork, RosaWizardFormData } from '../../types';

export const updateOnAWSAccountChange = async (
  value: string,
  item: RosaWizardFormData,
  refetch?: (param: string) => Promise<void>
) => {
  delete item.cluster.installer_role_arn;
  delete item.cluster.worker_role_arn;
  delete item.cluster.support_role_arn;
  delete item.cluster.cluster_privacy_public_subnet_id;
  delete item.cluster.selected_vpc;
  delete item.cluster.machine_pools_subnets;

  item.cluster.cluster_privacy = ClusterNetwork.external;

  if (refetch) await refetch(value);
};

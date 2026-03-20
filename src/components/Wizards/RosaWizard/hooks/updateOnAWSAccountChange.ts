export const updateOnAWSAccountChange = async (
  value: any,
  item: any,
  refetch?: (param: string) => Promise<void>
) => {
  item.cluster.installer_role_arn = undefined;
  item.cluster.worker_role_arn = undefined;
  item.cluster.support_role_arn = undefined;
  item.cluster.cluster_privacy = 'external';
  item.cluster.cluster_privacy_public_subnet_id = undefined;
  item.cluster.selected_vpc = undefined;
  item.cluster.machine_pools_subnets = undefined;
  if (refetch) await refetch(value as string);
};

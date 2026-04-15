import { ClusterNetwork } from '../../types';
import { type RosaFormApi } from '../RosaFormContext';

export const updateOnAWSAccountChange = async (
  value: string,
  form: RosaFormApi,
  refetch?: (param: string) => Promise<void>
): Promise<void> => {
  form.setFieldValue('cluster.installer_role_arn', undefined);
  form.setFieldValue('cluster.worker_role_arn', undefined);
  form.setFieldValue('cluster.support_role_arn', undefined);
  form.setFieldValue('cluster.cluster_privacy_public_subnet_id', undefined);
  form.setFieldValue('cluster.selected_vpc', undefined);
  form.setFieldValue('cluster.machine_pools_subnets', undefined);
  form.setFieldValue('cluster.cluster_privacy', ClusterNetwork.external);

  if (refetch) await refetch(value);
};

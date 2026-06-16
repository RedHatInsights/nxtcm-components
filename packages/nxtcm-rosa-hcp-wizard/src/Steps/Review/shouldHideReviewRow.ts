import { ClusterNetwork, ClusterUpgrade, type ROSAHCPCluster } from '../../types';

/** Whether a review summary row should be omitted for the current form state. */
export function shouldHideReviewRow({
  path,
  formValues,
  metaShouldHideInReview,
}: {
  path: string;
  formValues: Partial<ROSAHCPCluster>;
  metaShouldHideInReview: boolean;
}): boolean {
  if (metaShouldHideInReview) {
    return true;
  }
  if (path === 'nodes_compute' && formValues.autoscaling) {
    return true;
  }
  if ((path === 'min_replicas' || path === 'max_replicas') && !formValues.autoscaling) {
    return true;
  }
  if (path === 'imds' && !formValues.imds) {
    return true;
  }
  if (path === 'kms_key_arn' || path === 'etcd_key_arn') {
    const keyArn = formValues[path];
    if (
      keyArn === undefined ||
      keyArn === null ||
      (typeof keyArn === 'string' && keyArn.trim() === '')
    ) {
      return true;
    }
  }
  if (
    path === 'cluster_privacy_public_subnet_id' &&
    formValues.cluster_privacy !== ClusterNetwork.external
  ) {
    return true;
  }
  if (path === 'security_groups_worker') {
    const groups = formValues.security_groups_worker;
    if (!groups || !Array.isArray(groups)) {
      return true;
    }
    const validGroupIds = groups
      .map((id) => (typeof id === 'string' ? id.trim() : ''))
      .filter((id) => id !== '');
    if (validGroupIds.length === 0) {
      return true;
    }
  }
  if (path === 'upgrade_schedule') {
    if (formValues.upgrade_policy !== ClusterUpgrade.automatic) {
      return true;
    }
    const schedule = formValues.upgrade_schedule;
    if (typeof schedule !== 'string' || schedule.trim() === '') {
      return true;
    }
  }
  if (path === 'additional_trust_bundle') {
    const bundle = formValues.additional_trust_bundle;
    if (typeof bundle !== 'string' || bundle.trim() === '') {
      return true;
    }
  }

  return false;
}

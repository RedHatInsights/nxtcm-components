import { ClusterNetwork, ClusterUpgrade, type ROSAHCPCluster } from '../../types';

function isUnsetOrBlankString(value: unknown): boolean {
  return (
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
  );
}

function shouldHideReplicaRow(path: string, autoscaling: boolean | undefined): boolean {
  return (path === 'min_replicas' || path === 'max_replicas') && !autoscaling;
}

function shouldHideKeyArnRow(path: string, formValues: Partial<ROSAHCPCluster>): boolean {
  if (path !== 'kms_key_arn' && path !== 'etcd_key_arn') {
    return false;
  }
  return isUnsetOrBlankString(formValues[path]);
}

function shouldHideSecurityGroupsRow(formValues: Partial<ROSAHCPCluster>): boolean {
  const groups = formValues.security_groups_worker;
  if (!groups || !Array.isArray(groups)) {
    return true;
  }
  const validGroupIds = groups
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter((id) => id !== '');
  return validGroupIds.length === 0;
}

function shouldHideUpgradeScheduleRow(formValues: Partial<ROSAHCPCluster>): boolean {
  if (formValues.upgrade_policy !== ClusterUpgrade.automatic) {
    return true;
  }
  return isUnsetOrBlankString(formValues.upgrade_schedule);
}

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
  if (shouldHideReplicaRow(path, formValues.autoscaling)) {
    return true;
  }
  if (path === 'imds' && !formValues.imds) {
    return true;
  }
  if (shouldHideKeyArnRow(path, formValues)) {
    return true;
  }
  if (
    path === 'cluster_privacy_public_subnet_id' &&
    formValues.cluster_privacy !== ClusterNetwork.external
  ) {
    return true;
  }
  if (path === 'security_groups_worker' && shouldHideSecurityGroupsRow(formValues)) {
    return true;
  }
  if (path === 'upgrade_schedule' && shouldHideUpgradeScheduleRow(formValues)) {
    return true;
  }
  if (
    path === 'additional_trust_bundle' &&
    isUnsetOrBlankString(formValues.additional_trust_bundle)
  ) {
    return true;
  }

  return false;
}

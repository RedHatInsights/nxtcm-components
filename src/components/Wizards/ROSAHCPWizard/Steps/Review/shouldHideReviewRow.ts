import type { ClusterFormData } from '@/components/Wizards/types';
import { ClusterUpgrade } from '@/components/Wizards/types';

/** Whether a review summary row should be omitted for the current form state. */
export function shouldHideReviewRow({
  path,
  formValues,
  metaShouldHideInReview,
}: {
  path: string;
  formValues: Partial<ClusterFormData>;
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

  return false;
}

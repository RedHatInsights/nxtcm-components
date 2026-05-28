import type { ClusterFormData } from '@/components/Wizards/types';

/** Values that pass Details-step validation in CT and unit tests. */
export const VALID_DETAILS_FORM_VALUES: Partial<ClusterFormData> = {
  name: 'mycluster',
  cluster_version: '4.16.2',
  associated_aws_id: 'aws-prod-123456789012',
  billing_account_id: 'billing-main-123456789012',
  region: 'us-east-1',
};

/** Values that pass full-form validation for footer Review Submit CT (wizard subset of fields). */
export const VALID_REVIEW_SUBMIT_FORM_VALUES: Partial<ClusterFormData> = {
  ...VALID_DETAILS_FORM_VALUES,
  installer_role_arn: 'arn:aws:iam::123456789012:role/installer',
  support_role_arn: 'arn:aws:iam::123456789012:role/support',
  worker_role_arn: 'arn:aws:iam::123456789012:role/worker',
  byo_oidc_config_id: 'oidc-config-1',
  custom_operator_roles_prefix: 'mycluster-a1b2',
};

export const stepId = {
  CONTROL_PLANE: 'control-plane',
  ACCOUNTS_AND_ROLES_AS_FIRST_STEP: 'accounts-and-roles-as-first-step',
  ACCOUNTS_AND_ROLES_AS_SECOND_STEP: 'accounts-and-roles-as-second-step',
  CLUSTER_SETTINGS: 'cluster-settings',
  CLUSTER_SETTINGS_DETAILS: 'cluster-settings-details',
  CLUSTER_SETTINGS_MACHINE_POOL: 'cluster-settings-machine-pool',
  NETWORKING: 'networking',
  NETWORKING_CONFIGURATION: 'networking-configuration',
  NETWORKING_VPC_SETTINGS: 'networking-vpc-settings',
  NETWORKING_CLUSTER_WIDE_PROXY: 'networking-cluster-wide-proxy',
  NETWORKING_CIDR_RANGES: 'networking-cidr-ranges',
  CLUSTER_ROLES_AND_POLICIES: 'cluster-roles-and-policies',
  CLUSTER_UPDATES: 'cluster-updates',
  REVIEW_AND_CREATE: 'review-and-create',
};

export const stepName = {
  CONTROL_PLANE: 'Control plane',
  ACCOUNTS_AND_ROLES_AS_FIRST_STEP: 'Accounts and roles',
  ACCOUNTS_AND_ROLES_AS_SECOND_STEP: 'Accounts and roles',
  CLUSTER_SETTINGS: 'Cluster settings',
  CLUSTER_SETTINGS_DETAILS: 'Details',
  CLUSTER_SETTINGS_MACHINE_POOL: 'Machine pool',
  NETWORKING: 'Networking',
  NETWORKING_CONFIGURATION: 'Configuration',
  NETWORKING_VPC_SETTINGS: 'VPC settings',
  NETWORKING_CLUSTER_WIDE_PROXY: 'Cluster-wide proxy',
  NETWORKING_CIDR_RANGES: 'CIDR ranges',
  CLUSTER_ROLES_AND_POLICIES: 'cluster roles and policies',
  CLUSTER_UPDATES: 'Cluster updates',
  REVIEW_AND_CREATE: 'Review and create',
};

export const AWS_KMS_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/mrk-[0-9a-f]{32}$/;

// Regular expression used to check whether forward slash is multiple times
export const MULTIPLE_FORWARD_SLASH_REGEX = /^.*[/]+.*[/]+.*$/i;

// Regular expression used to check base DNS domains, based on RFC-1035
export const BASE_DOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?\.)+[a-z]([-a-z0-9]*[a-z0-9])?$/;

// Maximum length for a cluster name
export const MAX_CLUSTER_NAME_LENGTH = 54;
// Maximum length of a cluster display name
export const MAX_CLUSTER_DISPLAY_NAME_LENGTH = 63;
// Regular expression used to check whether input is a valid IPv4 CIDR range
export const CIDR_REGEXP =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[1-9]))$/;
export const SERVICE_CIDR_MAX = 24;
export const POD_CIDR_MAX = 21;
export const POD_NODES_MIN = 32;
export const AWS_MACHINE_CIDR_MIN = 16;
export const AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 25;
export const AWS_MACHINE_CIDR_MAX_MULTI_AZ = 24;
export const GCP_MACHINE_CIDR_MAX = 23;

// Regular expression used to check whether input is a valid IPv4 subnet prefix length
export const HOST_PREFIX_REGEXP = /^\/?(3[0-2]|[1-2][0-9]|[0-9])$/;
export const HOST_PREFIX_MIN = 23;
export const HOST_PREFIX_MAX = 26;

export const MAX_MACHINE_POOL_NAME_LENGTH = 30;

// Valid RFC-1035 labels must consist of lower case alphanumeric characters or '-', start with an
// alphabetic character, and end with an alphanumeric character (e.g. 'my-name',  or 'abc-123').
export const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
export const DNS_ONLY_ALPHANUMERIC_HYPHEN = /^[-a-z0-9]+$/;
export const DNS_START_ALPHA = /^[a-z]/;
export const DNS_END_ALPHANUMERIC = /[a-z0-9]$/;

export const MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH = 32;

export const MAX_CA_SIZE_BYTES = 4 * 1024 * 1024;

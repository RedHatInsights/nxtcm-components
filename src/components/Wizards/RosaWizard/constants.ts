/** Stable identifiers for wizard steps and substeps (used for navigation and state). */
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

/** Human-readable step titles aligned with {@link stepId} for UI labels. */
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

/** Pattern for a standard AWS KMS customer master key ARN (single-region keys). */
export const AWS_KMS_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Pattern for a multi-region AWS KMS key ARN (`mrk-` key id form). */
export const AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/mrk-[0-9a-f]{32}$/;

/** Detects paths containing more than one forward slash segment (used for proxy/path validation). */
export const MULTIPLE_FORWARD_SLASH_REGEX = /^.*[/]+.*[/]+.*$/i;

/** Validates a base DNS domain per RFC 1035-style hostname rules. */
export const BASE_DOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?\.)+[a-z]([-a-z0-9]*[a-z0-9])?$/;

/** Maximum allowed length for the ROSA cluster name field. */
export const MAX_CLUSTER_NAME_LENGTH = 54;

/** Maximum length for the cluster display name. */
export const MAX_CLUSTER_DISPLAY_NAME_LENGTH = 63;

/** IPv4 CIDR notation pattern (address + /prefix) for networking fields. */
export const CIDR_REGEXP =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[1-9]))$/;

/** Largest service CIDR prefix length (smallest mask number) allowed for Kubernetes services. */
export const SERVICE_CIDR_MAX = 24;

/** Largest pod CIDR prefix length allowed so enough pod address space remains. */
export const POD_CIDR_MAX = 21;

/** Minimum node count implied by pod CIDR vs host prefix rules. */
export const POD_NODES_MIN = 32;

/** Minimum machine CIDR prefix length (AWS). */
export const AWS_MACHINE_CIDR_MIN = 16;

/** Maximum machine CIDR prefix for single-AZ AWS clusters. */
export const AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 25;

/** Maximum machine CIDR prefix for multi-AZ (or hosted control plane) AWS clusters. */
export const AWS_MACHINE_CIDR_MAX_MULTI_AZ = 24;

/** Maximum machine CIDR prefix for GCP (reference limit used in wizard copy/validation context). */
export const GCP_MACHINE_CIDR_MAX = 23;

/** Accepts `/NN` host prefix values where NN is a valid IPv4 subnet prefix length. */
export const HOST_PREFIX_REGEXP = /^\/?(3[0-2]|[1-2][0-9]|[0-9])$/;

/** Minimum host prefix length (largest subnets / most pod IPs per node). */
export const HOST_PREFIX_MIN = 23;

/** Maximum host prefix length (smallest subnets). */
export const HOST_PREFIX_MAX = 26;

/** Maximum characters for a machine pool name. */
export const MAX_MACHINE_POOL_NAME_LENGTH = 30;

/** Single DNS label: lowercase alphanumeric or hyphen, RFC 1035 style. */
export const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;

/** String contains only lowercase letters, digits, and hyphens. */
export const DNS_ONLY_ALPHANUMERIC_HYPHEN = /^[-a-z0-9]+$/;

/** Label starts with a letter a–z. */
export const DNS_START_ALPHA = /^[a-z]/;

/** Label ends with a letter or digit. */
export const DNS_END_ALPHANUMERIC = /[a-z0-9]$/;

/** Maximum length for the custom operator roles prefix field. */
export const MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH = 32;

/** Upper size limit (bytes) for pasted CA / trust bundle PEM content. */
export const MAX_CA_SIZE_BYTES = 4 * 1024 * 1024;

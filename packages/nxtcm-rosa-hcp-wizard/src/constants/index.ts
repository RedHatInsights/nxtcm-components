export const STEP_IDS = {
  BASIC_SETUP: 'basic-setup-step',
  DETAILS: 'details-substep',
  ROLES_AND_POLICIES: 'roles-and-policies-step',
  MACHINE_POOLS: 'machine-pools-substep',
  NETWORKING: 'networking-substep',
  OPTIONAL_SETUP: 'optional-setup-step',
  CLUSTER_WIDE_PROXY: 'cluster-wide-proxy-step',
  ENCRYPTION: 'encryption-step',
  CLUSTER_UPDATES: 'cluster-updates-step',
  REVIEW: 'review-step',
} as const;

export const AWS_KMS_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX =
  /^arn:aws([-\w]+)?:kms:[\w-]+:\d{12}:key\/mrk-[0-9a-f]{32}$/;

// Regular expression used to check base DNS domains, based on RFC-1035
export const BASE_DOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?\.)+[a-z]([-a-z0-9]*[a-z0-9])?$/;

// Maximum length for a cluster name
export const MAX_CLUSTER_NAME_LENGTH = 54;
// Regular expression used to check whether input is a valid IPv4 CIDR range
export const CIDR_REGEXP =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[1-9]))$/;
export const SERVICE_CIDR_MAX = 24;
export const POD_CIDR_MAX = 21;
export const POD_NODES_MIN = 32;
export const AWS_MACHINE_CIDR_MIN = 16;
export const AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 25;
export const AWS_MACHINE_CIDR_MAX_MULTI_AZ = 24;

// Regular expression used to check whether input is a valid IPv4 subnet prefix length
export const HOST_PREFIX_REGEXP = /^\/?(3[0-2]|[1-2][0-9]|[0-9])$/;
export const HOST_PREFIX_MIN = 23;
export const HOST_PREFIX_MAX = 26;

// Valid RFC-1035 labels must consist of lower case alphanumeric characters or '-', start with an
// alphabetic character, and end with an alphanumeric character (e.g. 'my-name',  or 'abc-123').
export const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
export const MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH = 32;

export const MAX_CA_SIZE_BYTES = 4 * 1024 * 1024;

/** Lowercase alphanumeric character set for cluster name validation. */
export const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';

/** Maximum number of additional security groups per worker node. */
export const MAX_SECURITY_GROUPS = 10;

/** Minimum root disk size in GiB. */
export const MIN_ROOT_DISK_SIZE_GIB = 75;

/** Max root disk (GiB) for OpenShift versions below 4.14. */
export const MAX_ROOT_DISK_SIZE_OLD_OPENSHIFT = 1024;

/** Max root disk (GiB) for OpenShift versions 4.14+. */
export const MAX_ROOT_DISK_SIZE_NEW_OPENSHIFT = 16384;

/** Max HCP autoscaling nodes for OpenShift versions 4.16+ (and qualifying 4.14/4.15 patches). */
export const MAX_NODES_HCP_DEFAULT = 500;

/** Max HCP autoscaling nodes for older OpenShift versions. */
export const MAX_NODES_HCP_INSUFFICIENT_VERSION = 90;

/** Length of the random hash appended to operator roles prefix. */
export const OPERATOR_ROLES_HASH_LENGTH = 4;

/** Max visible characters for security group display names before truncation. */
export const MAX_SECURITY_GROUP_DISPLAY_LENGTH = 50;

export const ROSA_LOGIN_COMMAND_DEFAULT =
  'rosa login --use-auth-code --url https://api.openshift.com';
export const ROSA_LOGIN_COMMAND_SERVICE =
  'rosa login --client-id <CLIENT_ID> --client-secret <CLIENT_SECRET>';

export const DEFAULT_HOST_PRODUCT = 'acm' as const;

export const YAML_MODEL_PATH = 'rosa-hcp-control-plane.yaml';
export const YAML_VALIDATION_OWNER = 'yaml-hcp-validation';

export const FIELD_NAME = {
  ASSOCIATES_AWS_ACCOUNT_ID: 'associated_aws_id',
  BILLING_ACCOUNT_ID: 'billing_account_id',
  REGION: 'region',
  CLUSTER_NAME: 'name',
  CLUSTER_VERSION: 'cluster_version',
  INSTALLER_ROLE_ARN: 'installer_role_arn',
  WORKER_ROLE_ARN: 'worker_role_arn',
  SUPPORT_ROLE_ARN: 'support_role_arn',
  BYO_OIDC_CONFIG_ID: 'byo_oidc_config_id',
  CUSTOM_OPERATOR_ROLES_PREFIX: 'custom_operator_roles_prefix',
  CLUSTER_PRIVACY_FIELD: {
    NAME: 'cluster_privacy',
    PUBLIC_SUBNET_ID: 'cluster_privacy_public_subnet_id',
    INTERNAL: 'internal',
    EXTERNAL: 'external',
  },
  CONFIGURE_PROXY: 'configure_proxy',
  CIDR_DEFAULT: 'cidr_default',
  NETWORK_MACHINE_CIDR: 'network_machine_cidr',
  NETWORK_SERVICE_CIDR: 'network_service_cidr',
  NETWORK_POD_CIDR: 'network_pod_cidr',
  NETWORK_HOST_PREFIX: 'network_host_prefix',
  SELECTED_VPC: 'selected_vpc',
  SELECTED_MACHINE_POOL: 'machine_pools_subnets.0.machine_pool_subnet',
  MACHINE_TYPE: 'machine_type',
  AUTOSCALING: 'autoscaling',
  NODES_COMPUTE: 'nodes_compute',
  MIN_REPLICAS: 'min_replicas',
  MAX_REPLICAS: 'max_replicas',
  IMDS: 'imds',
  COMPUTE_ROOT_VOLUME: 'compute_root_volume',
  SECURITY_GROUPS_WORKER: 'security_groups_worker',
  HTTP_PROXY_URL: 'http_proxy_url',
  HTTPS_PROXY_URL: 'https_proxy_url',
  NO_PROXY_DOMAINS: 'no_proxy_domains',
  ADDITIONAL_TRUST_BUNDLE: 'additional_trust_bundle',
  UPGRADE_POLICY: 'upgrade_policy',
  ENCRYPTION: {
    ENCRYPTION_KEYS: 'encryption_keys',
    KMS_KEY_ARN: 'kms_key_arn',
    ETCD_ENCRYPTION: 'etcd_encryption',
    ETCD_KEY_ARN: 'etcd_key_arn',
  },
} as const;

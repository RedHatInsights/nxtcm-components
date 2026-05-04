import { TooltipProps, useWizardContext } from '@patternfly/react-core';

// -- dropdown / select option types --

export type ClusterWithNonUniqueName = {
  name: string;
};

export type Region = {
  label: string;
  value: string;
};

export type OpenShiftVersions = {
  label: string;
  value: string;
};

export type AWSInfrastructureAccounts = {
  label: string;
  value: string;
};

export type OIDCConfig = {
  label: string;
  value: string;
  issuer_url: string;
};

export type SelectDropdownType = {
  label: string;
  value: string;
  description?: string;
  /** When true, option is not selectable; PatternFly `isDisabled`. */
  disabled?: boolean;
  /** When true, option stays focusable with a tooltip (use with `tooltipProps` instead of `description`). */
  ariaDisabled?: boolean;
  tooltipProps?: TooltipProps;
};

export type InstallerRole = SelectDropdownType & {
  roleVersion?: string;
};

/** Flat version data from the host app; the wizard builds option groups internally. */
export type OpenShiftVersionsData = {
  default?: SelectDropdownType;
  latest?: SelectDropdownType;
  /** Additional releases; group labels are supplied with `buildOpenShiftVersionGroups` via Rosa wizard `details.openShiftVersionGroups`. */
  releases: SelectDropdownType[];
};

/** Grouped options for version select (built internally from OpenShiftVersionsData). */
export type OpenShiftVersionGroup = {
  label: string;
  options: SelectDropdownType[];
};

export type MachineTypesDropdownType = {
  id: string;
  label: string;
  description: string;
  value: string;
};

export type Role = {
  installerRole: InstallerRole;
  supportRole: SelectDropdownType[];
  workerRole: SelectDropdownType[];
};

// -- networking / VPC types --

export type Subnet = {
  subnet_id: string;
  name: string;
  availability_zone: string;
};

export type CIDRSubnet = {
  cidr_block: string;
  name: string;
  subnet_id: string;
  availability_zone: string;
};

export type VPC = {
  id: string;
  name: string;
  aws_subnets: Subnet[];
  aws_security_groups?: SecurityGroup[];
};

export type SecurityGroup = {
  id?: string;
  name?: string;
  red_hat_managed?: boolean;
};

export type Subnetwork = {
  /** @description The CIDR Block of the subnet. */
  cidr_block?: string;
  /** @description The availability zone to which the subnet is related. */
  availability_zone?: string;
  /** @description Name of the subnet according to its `Name` tag on AWS. */
  name?: string;
  /** @description Whether or not it is a public subnet. */
  public?: boolean;
  /** @description If the resource is RH managed. */
  red_hat_managed?: boolean;
  /** @description The subnet ID to be used while installing a cluster. */
  subnet_id?: string;
};

export type CloudVpc = {
  /** @description List of AWS security groups with details. */
  aws_security_groups?: SecurityGroup[];
  /** @description List of AWS subnetworks with details. */
  aws_subnets?: Subnetwork[];
  /** @description CIDR block of the virtual private cloud. */
  cidr_block?: string;
  /** @description ID of virtual private cloud. */
  id?: string;
  /** @description Name of virtual private cloud according to its `Name` tag on AWS. */
  name?: string;
  /** @description If the resource is RH managed. */
  red_hat_managed?: boolean;
  /** @description List of subnets used by the virtual private cloud. */
  subnets?: string[];
};

// -- machine pool entry used in the wizard form --

export type MachinePoolSubnetEntry = {
  machine_pool_subnet: string;
};

export enum ClusterNetwork {
  external = 'external',
  internal = 'internal',
}

export enum ClusterEncryptionKeys {
  default = 'default',
  custom = 'custom',
}

export enum ClusterUpgrade {
  manual = 'manual',
  automatic = 'automatic',
}

// -- cluster form data: the full shape of the wizard's form state --

export type ClusterFormData = {
  name: string | undefined;
  cluster_version: string | undefined;
  associated_aws_id: string;
  billing_account_id: string | undefined;
  region: string | undefined;

  // roles & policies
  installer_role_arn: string | undefined;
  support_role_arn: string | undefined;
  worker_role_arn: string | undefined;
  byo_oidc_config_id: string;
  custom_operator_roles_prefix: string;

  // machine pools — WizSelect stores the full VPC object at runtime via keyPath
  selected_vpc?: string | VPC;
  machine_pools_subnets?: MachinePoolSubnetEntry[];
  machine_type?: string;
  autoscaling?: boolean;
  nodes_compute?: number;
  min_replicas?: number;
  max_replicas?: number;
  compute_root_volume?: number;
  imds?: string;

  // networking
  cluster_privacy?: ClusterNetwork.external | ClusterNetwork.internal;
  cluster_privacy_public_subnet_id?: string;
  cidr_default?: boolean;
  network_machine_cidr?: string;
  network_service_cidr?: string;
  network_pod_cidr?: string;
  network_host_prefix?: string;
  configure_proxy?: boolean;
  multi_az?: string;
  hypershift?: string;

  // proxy
  http_proxy_url?: string;
  https_proxy_url?: string;
  no_proxy_domains?: string;
  additional_trust_bundle?: string;

  // encryption
  encryption_keys?: ClusterEncryptionKeys.default | ClusterEncryptionKeys.custom;
  kms_key_arn?: string;
  etcd_encryption?: boolean;
  etcd_key_arn?: string;

  // cluster updates
  upgrade_policy?: ClusterUpgrade.automatic | ClusterUpgrade.manual;
  upgrade_schedule?: string;
};

export type RosaWizardFormData = {
  cluster: ClusterFormData;
};

// -- wizard type discriminator for WizardWrapper --

export type WizardType = 'rosa-hcp' | 'rosa-yaml-editor';

// -- resource types for async data with loading/error state --

// co-locates data, loading, and error for a given field
// optional fetch is used when a field supports refresh/reload
export type Resource<TData, TArgs extends unknown[] = []> = {
  data: TData;
  error: string | null;
  isFetching: boolean;
  fetch?: (...args: TArgs) => Promise<void>;
};

// validate-only state for fields that don't carry a data property
export type ValidationResource = {
  error: string | null;
  isFetching: boolean;
};

// -- wizard context: the PatternFly useWizardContext() return type --

export type WizardNavigationContext = ReturnType<typeof useWizardContext>;

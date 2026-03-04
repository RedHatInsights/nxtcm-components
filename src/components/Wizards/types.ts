import { useWizardContext } from '@patternfly/react-core';

// -- dropdown / select option types --

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
};

export type MachineTypesDropdownType = {
  id: string;
  label: string;
  description: string;
  value: string;
};

export type Roles = {
  installerRoles: SelectDropdownType[];
  supportRoles: SelectDropdownType[];
  workerRoles: SelectDropdownType[];
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
};

export type VPC = {
  id: string;
  name: string;
  aws_subnets: Subnet[];
};

// -- machine pool entry used in the wizard form --

export type MachinePoolSubnetEntry = {
  machine_pool_subnet: string;
};

// -- cluster form data: the full shape of the wizard's form state --

export type ClusterFormData = {
  name?: string;
  cluster_version?: string;
  associated_aws_id?: string;
  billing_account_id?: string;
  region?: string;

  // roles & policies
  installer_role_arn?: string;
  support_role_arn?: string;
  worker_role_arn?: string;
  byo_oidc_config_id?: string;
  custom_operator_roles_prefix?: string;

  // machine pools
  selected_vpc?: string;
  machine_pools_subnets?: MachinePoolSubnetEntry[];
  machine_type?: string;
  autoscaling?: boolean;
  nodes_compute?: number;
  min_replicas?: number;
  max_replicas?: number;
  compute_root_volume?: number;
  imds?: string;

  // networking
  cluster_privacy?: 'external' | 'internal';
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
  encryption_keys?: 'default' | 'custom';
  kms_key_arn?: string;
  etcd_encryption?: boolean;
  etcd_key_arn?: string;

  // cluster updates
  upgrade_policy?: 'automatic' | 'manual';
  upgrade_schedule?: string;
};

export type RosaWizardFormData = {
  cluster: ClusterFormData;
};

// -- wizard type discriminator for WizardWrapper --

export type WizardType = 'rosa-hcp' | 'rosa-yaml-editor';

// -- callback functions passed into the wizard by consumers --

export type WizardCallbackFunctions = {
  onAWSAccountChange?: (value: unknown) => void;
  refreshAwsAccountDataCallback?: () => void;
  refreshAwsBillingAccountCallback?: () => void;
};

// -- wizard context: the PatternFly useWizardContext() return type --

export type WizardNavigationContext = ReturnType<typeof useWizardContext>;

import { TooltipProps, useWizardContext } from '@patternfly/react-core';

// -- dropdown / select option types --

export type DropdownType = {
  label: string;
  value: string;
  // additional optional props for patternfly
  description?: string;
  disabled?: boolean;
  ariaDisabled?: boolean;
  tooltipProps?: TooltipProps;
};

export type ClusterWithNonUniqueName = {
  name: string;
};

export type Region = DropdownType;

export type OpenShiftVersions = DropdownType;

export type AWSInfrastructureAccounts = DropdownType;

export type AWSBillingAccounts = DropdownType;

export type GenericRole = DropdownType;

export type InstallerRole = GenericRole & {
  roleVersion?: string;
};

/** Flat version data from the host app; the wizard builds option groups internally. */
export type OpenShiftVersionsData = {
  default?: DropdownType;
  latest?: DropdownType;
  /** Additional releases; group labels are supplied with `buildOpenShiftVersionGroups` via Rosa wizard `details.openShiftVersionGroups`. */
  releases: DropdownType[];
};

/** Grouped options for version select (built internally from OpenShiftVersionsData). */
export type OpenShiftVersionGroup = {
  label: string;
  options: DropdownType[];
};

export type MachineTypesDropdownType = DropdownType & {
  id: string;
  description: string;
};

export type Role = {
  installerRole: InstallerRole;
  supportRole: DropdownType[];
  workerRole: DropdownType[];
};

export type OIDCConfig = DropdownType & {
  issuer_url: string;
};

// -- networking / VPC types --

export type Subnet = {
  subnet_id: string;
  name: string;
  availability_zone: string;
  public: boolean;
};

export type CIDRSubnet = {
  cidr_block: string;
  name: string;
  public: boolean;
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
  id: string;
  name: string;
  red_hat_managed?: boolean;
};

export type Subnetwork = {
  cidr_block?: string;
  availability_zone?: string;
  name?: string;
  public?: boolean;
  red_hat_managed?: boolean;
  subnet_id?: string;
};

export type CloudVpc = {
  aws_security_groups?: SecurityGroup[];
  aws_subnets?: Subnetwork[];
  cidr_block?: string;
  id?: string;
  name?: string;
  red_hat_managed?: boolean;
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

export type RolesResource = Resource<Role[], [awsAccount: string]> & {
  ocmRoleError: string | null;
  userRoleError: string | null;
  ocmRoleARN: string | null;
  fetch: (awsAccount: string) => Promise<void>;
};
export type RegionsResource = Resource<Region[], [awsAccount: string]> & {
  fetch: (awsAccount: string) => Promise<void>;
};
export type VersionsResource = Resource<OpenShiftVersionsData, []> & {
  fetch: () => Promise<void>;
};

export type MachineTypesArgs = {
  region: string;
  role_arn: string;
  availability_zones: string[];
};
export type MachineTypesResource = Resource<
  MachineTypesDropdownType[],
  [args: MachineTypesArgs]
> & {
  fetch: (args: MachineTypesArgs) => Promise<void>;
};

export type AwsInfrastructureAccountsResource = Resource<AWSInfrastructureAccounts[]>;
export type AwsBillingAccountsResource = Resource<AWSBillingAccounts[]>;
export type OidcConfigResource = Resource<OIDCConfig[], [awsAccount: string]> & {
  fetch: (awsAccount: string) => Promise<void>;
};

/** Flat args the host app receives when the wizard triggers a VPC refetch. */
export type VPCRefetchArgs = {
  account_id: string;
  role_arn: string;
  region: string;
};

export type VpcListResource = Resource<VPC[], [args: VPCRefetchArgs]> & {
  fetch: (args: VPCRefetchArgs) => Promise<void>;
};
export type SubnetsResource = Resource<Subnet[]>;
export type SecurityGroupsResource = Resource<SecurityGroup[]>;

export type CheckClusterNameUniqueness = (name: string, region?: string) => Promise<string | null>;

export type ROSAHCPWizardData = {
  awsInfrastructureAccounts: AwsInfrastructureAccountsResource;
  awsBillingAccounts: AwsBillingAccountsResource;
  regions: RegionsResource;
  versions: VersionsResource;
  machineTypes: MachineTypesResource;
  roles: RolesResource;
  oidcConfig: OidcConfigResource;
  vpcList: VpcListResource;
  subnets: SubnetsResource;
  securityGroups: SecurityGroupsResource;
  clusterNameValidation: ValidationResource;
  checkClusterNameUniqueness?: CheckClusterNameUniqueness;
};

export type RosaHCPWizardProps = {
  wizardData: ROSAHCPWizardData;
  onSubmit: (data: ROSAHCPCluster) => Promise<void>;
  onSubmitError?: string | boolean;
  onCancel: () => void;
  title: string;
  onBackToReviewStep?: () => void | Promise<void>;
  yamlEditor?: () => React.ReactNode;
  yaml?: boolean;
  /** ROSA login command supplied by the host application (e.g. `rosa login --use-auth-code --url https://api.openshift.com`). Falls back to a built-in default when omitted. */
  rosaLoginCommand?: string;
};

export type WizardNavigationContext = ReturnType<typeof useWizardContext>;

export type ROSAHCPCluster = {
  // details
  name?: string | undefined;
  cluster_version?: string | undefined;
  associated_aws_id?: string;
  billing_account_id?: string | undefined;
  region?: string | undefined;

  // roles & policies
  installer_role_arn?: string | undefined;
  support_role_arn?: string | undefined;
  worker_role_arn?: string | undefined;
  byo_oidc_config_id?: string;
  custom_operator_roles_prefix?: string;

  // machine pools
  selected_vpc?: string | VPC;
  machine_pools_subnets?: MachinePoolSubnetEntry[];
  machine_type?: string;
  autoscaling?: boolean;
  nodes_compute?: number;
  min_replicas?: number;
  max_replicas?: number;
  compute_root_volume?: number;
  imds?: string;
  security_groups_worker?: string[];

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

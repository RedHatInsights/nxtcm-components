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

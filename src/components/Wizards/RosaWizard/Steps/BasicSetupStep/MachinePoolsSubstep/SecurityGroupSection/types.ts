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

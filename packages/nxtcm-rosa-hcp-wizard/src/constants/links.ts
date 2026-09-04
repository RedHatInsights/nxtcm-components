const redHatDocsBaseUrl = 'https://docs.redhat.com/en/documentation';
const redHatBaseUrl = 'https://access.redhat.com/';
const redHatSecurityBaseUrl = `${redHatBaseUrl}security/`;

type linksType = {
  IAM_RESOURCES: string;
  CONFIGURE_PRIVATE_CONNECTIONS: string;
  ROSA_AWS_ACCOUNT_ASSOCIATION: string;
  ROSA_SERVICE_ETCD_ENCRYPTION: string;
  CIDR_RANGE_DEFINITIONS_ROSA: string;
  CIDR_MACHINE: string;
  CIDR_SERVICE: string;
  CIDR_POD: string;
  CIDR_HOST_PREFIX: string;
  CONFIGURE_PROXY_URL: string;
  ROSA_Z_STREAM: string;
  ROSA_LIFE_CYCLE: string;
  ROSA_CLUSTER_AUTOSCALING: string;
  ROSA_WORKER_NODE_COUNT: string;
  ROSA_INSTANCE_TYPES: string;
  ROSA_SHARED_VPC: string;
  ROSA_ROLES_LEARN_MORE: string;
  ROSA_OIDC_LEARN_MORE: string;
  ROSA_SECURITY_GROUPS: string;
};

const links: linksType = {
  IAM_RESOURCES: `/introduction_to_rosa/rosa-hcp-about-iam-resources`,
  CONFIGURE_PRIVATE_CONNECTIONS: `/cluster_administration/configuring-private-connections#rosa-configuring-private-connections`,
  ROSA_AWS_ACCOUNT_ASSOCIATION: `/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  ROSA_SERVICE_ETCD_ENCRYPTION: `/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-etcd-encryption_rosa-hcp-service-definition`,
  CIDR_RANGE_DEFINITIONS_ROSA: `/networking_overview/cidr-range-definitions`,
  CIDR_MACHINE: `/networking_overview/cidr-range-definitions#machine-cidr-description`,
  CIDR_SERVICE: `/networking_overview/cidr-range-definitions#service-cidr-description`,
  CIDR_POD: `/networking_overview/cidr-range-definitions#pod-cidr-description`,
  CIDR_HOST_PREFIX: `/networking_overview/cidr-range-definitions#host-prefix-description`,
  CONFIGURE_PROXY_URL: `/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  ROSA_Z_STREAM: `/introduction_to_rosa/policies-and-service-definition#rosa-patch-versions_rosa-hcp-life-cycle`,
  ROSA_LIFE_CYCLE: `/introduction_to_rosa/policies-and-service-definition#life-cycle-overview_rosa-life-cycle`,
  ROSA_CLUSTER_AUTOSCALING: `/cluster_administration/rosa-cluster-autoscaling-hcp`,
  ROSA_WORKER_NODE_COUNT: `/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-compute_rosa-service-definition`,
  ROSA_INSTANCE_TYPES: `/introduction_to_rosa/policies-and-service-definition#rosa-hcp-instance-types`,
  ROSA_SHARED_VPC: `/install_clusters/rosa-hcp-shared-vpc-config`,
  ROSA_ROLES_LEARN_MORE: `/introduction_to_rosa/rosa-hcp-about-iam-resources`,
  ROSA_OIDC_LEARN_MORE: `/introduction_to_rosa/rosa-hcp-about-iam-resources#rosa-sts-oidc-provider-requirements-for-operators_rosa-sts-about-iam-resources`,
  ROSA_SECURITY_GROUPS: `/prepare_your_environment/rosa-hcp-prereqs#rosa-security-groups_rosa-hcp-prereqs`,
};

export const securityLinks = {
  SECURITY_CLASSIFICATION_CRITICAL: `${redHatSecurityBaseUrl}updates/classification/#critical`,
};

export const awsLinks = {
  AWS_CLI_GETTING_STARTED_MANUAL:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
  AWS_CONSOLE_ROSA_HOME: 'https://console.aws.amazon.com/rosa/home',
  AWS_DATA_PROTECTION: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/data-protection.html',
  AWS_REGIONS:
    'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html',
  AWS_CONSOLE_SECURITY_GROUPS: 'https://console.aws.amazon.com/ec2/home#SecurityGroups',
};

export const useDocsVersion = (clusterVersion?: string) => {
  const docsVersion = clusterVersion ? clusterVersion.split('.')[0] : '4';
  const redHatRosaDocsBaseUrl = `${redHatDocsBaseUrl}/red_hat_openshift_service_on_aws/${docsVersion}/html`;

  const updatedLinks = Object.fromEntries(
    Object.entries(links).map(([key, value]) => [key, redHatRosaDocsBaseUrl + value])
  );

  return updatedLinks;
};

import { useDocsVersions } from '../ROSAHCPWizardDocsVersionProvider';

const redHatDocsBaseUrl = 'https://docs.redhat.com/en/documentation';
const redHatBaseUrl = 'https://access.redhat.com/';
const redHatSecurityBaseUrl = `${redHatBaseUrl}security/`;

type LinksType = {
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

const FALLBACK_DOCS_MAJOR = '4';
// has to be a hook to satisfy eslint
export const useGetDocsVersion = (clusterVersion?: string): LinksType => {
  const publishedDocs = useDocsVersions();

  const PUBLISHED_DOCS_MAJORS = new Set([FALLBACK_DOCS_MAJOR, ...publishedDocs]);
  const requestedDocsClusterVersion = clusterVersion ? clusterVersion.split('.')[0] : '4';
  const docsVersion =
    requestedDocsClusterVersion && PUBLISHED_DOCS_MAJORS.has(requestedDocsClusterVersion)
      ? requestedDocsClusterVersion
      : FALLBACK_DOCS_MAJOR;
  const redHatRosaDocsBaseUrl = `${redHatDocsBaseUrl}/red_hat_openshift_service_on_aws/${docsVersion}/html`;

  return {
    IAM_RESOURCES: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/rosa-hcp-about-iam-resources`,
    CONFIGURE_PRIVATE_CONNECTIONS: `${redHatRosaDocsBaseUrl}/cluster_administration/configuring-private-connections#rosa-configuring-private-connections`,
    ROSA_AWS_ACCOUNT_ASSOCIATION: `${redHatRosaDocsBaseUrl}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
    ROSA_SERVICE_ETCD_ENCRYPTION: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-etcd-encryption_rosa-hcp-service-definition`,
    CIDR_RANGE_DEFINITIONS_ROSA: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions`,
    CIDR_MACHINE: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions#machine-cidr-description`,
    CIDR_SERVICE: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions#service-cidr-description`,
    CIDR_POD: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions#pod-cidr-description`,
    CIDR_HOST_PREFIX: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions#host-prefix-description`,
    CONFIGURE_PROXY_URL: `${redHatRosaDocsBaseUrl}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
    ROSA_Z_STREAM: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-patch-versions_rosa-hcp-life-cycle`,
    ROSA_LIFE_CYCLE: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#life-cycle-overview_rosa-life-cycle`,
    ROSA_CLUSTER_AUTOSCALING: `${redHatRosaDocsBaseUrl}/cluster_administration/rosa-cluster-autoscaling-hcp`,
    ROSA_WORKER_NODE_COUNT: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-compute_rosa-service-definition`,
    ROSA_INSTANCE_TYPES: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-hcp-instance-types`,
    ROSA_SHARED_VPC: `${redHatRosaDocsBaseUrl}/install_clusters/rosa-hcp-shared-vpc-config`,
    ROSA_ROLES_LEARN_MORE: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/rosa-hcp-about-iam-resources`,
    ROSA_OIDC_LEARN_MORE: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/rosa-hcp-about-iam-resources#rosa-sts-oidc-provider-requirements-for-operators_rosa-sts-about-iam-resources`,
    ROSA_SECURITY_GROUPS: `${redHatRosaDocsBaseUrl}/prepare_your_environment/rosa-hcp-prereqs#rosa-security-groups_rosa-hcp-prereqs`,
  };
};

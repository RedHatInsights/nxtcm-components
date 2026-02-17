const redHatDocsBaseUrl = 'https://docs.redhat.com/en/documentation';
const redHatRosaDocsBaseUrl = `${redHatDocsBaseUrl}/red_hat_openshift_service_on_aws/4/html`;
const redHatBaseUrl = 'https://access.redhat.com/';
const redHatSecurityBaseUrl = `${redHatBaseUrl}security/`;

const links = {
  AWS_CLI_GETTING_STARTED_MANUAL:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
  IAM_RESOURCES: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/rosa-hcp-about-iam-resources`,
  CONFIGURE_PRIVATE_CONNECTIONS: `${redHatRosaDocsBaseUrl}/cluster_administration/configuring-private-connections#rosa-configuring-private-connections`,
  ROSA_AWS_ACCOUNT_ASSOCIATION: `${redHatRosaDocsBaseUrl}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  AWS_CONSOLE_ROSA_HOME: 'https://console.aws.amazon.com/rosa/home',
  AWS_DATA_PROTECTION: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/data-protection.html',
  ROSA_SERVICE_ETCD_ENCRYPTION: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-etcd-encryption_rosa-hcp-service-definition`,
  CIDR_RANGE_DEFINITIONS_ROSA: `${redHatRosaDocsBaseUrl}/networking_overview/cidr-range-definitions`,
  CONFIGURE_PROXY_URL: `${redHatRosaDocsBaseUrl}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  SECURITY_CLASSIFICATION_CRITICAL: `${redHatSecurityBaseUrl}updates/classification/#critical`,
  ROSA_Z_STREAM: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-patch-versions_rosa-hcp-life-cycle`,
  ROSA_LIFE_CYCLE: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#life-cycle-overview_rosa-life-cycle`,
  ROSA_CLUSTER_AUTOSCALING: `${redHatRosaDocsBaseUrl}/cluster_administration/rosa-cluster-autoscaling-hcp`,
  ROSA_WORKER_NODE_COUNT: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-compute_rosa-service-definition`,
  ROSA_INSTANCE_TYPES: `${redHatRosaDocsBaseUrl}/introduction_to_rosa/policies-and-service-definition#rosa-hcp-instance-types`,
  ROSA_SHARED_VPC: `${redHatRosaDocsBaseUrl}/install_clusters/rosa-hcp-shared-vpc-config`,
};
export default links;

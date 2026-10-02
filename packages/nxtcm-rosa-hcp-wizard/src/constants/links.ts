import { useDocsVersions } from '../ROSAHCPWizardDocsVersionProvider';
import { getDocsLinks } from './rawLinks';

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

  return getDocsLinks(docsVersion);
};

import { ClusterNetwork } from '../../types';
import * as yaml from 'js-yaml';

export interface YamlParseResult {
  isValid: boolean;
  data?: unknown;
  error?: string;
  errorLine?: number;
}

export function parseYaml(yamlString: string): YamlParseResult {
  try {
    const data = yaml.load(yamlString);
    return {
      isValid: true,
      data,
    };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return {
        isValid: false,
        error: error.message,
        errorLine: error.mark?.line !== undefined ? error.mark.line + 1 : undefined,
      };
    }
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function prettifyYaml(yamlString: string, indent: number = 2): string {
  try {
    const data = yaml.load(yamlString);
    return yaml.dump(data, {
      indent,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  } catch {
    return yamlString;
  }
}

function cleanArrayItem(item: unknown): unknown {
  if (item === null || item === undefined) return undefined;
  if (typeof item === 'string' && item.trim() === '') return undefined;
  if (Array.isArray(item)) {
    const cleaned = item.map(cleanArrayItem).filter((v) => v !== null && v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof item === 'object') {
    return removeEmptyValues(item as Record<string, unknown>);
  }
  return item;
}

export function removeEmptyValues(
  obj: Record<string, unknown>
): Record<string, unknown> | undefined {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;

    if (Array.isArray(value)) {
      const filteredArray = value
        .map(cleanArrayItem)
        .filter((item) => item !== null && item !== undefined);
      if (filteredArray.length > 0) {
        cleaned[key] = filteredArray;
      }
    } else if (typeof value === 'object' && value !== null) {
      const nested = removeEmptyValues(value as Record<string, unknown>);
      if (nested !== undefined) {
        cleaned[key] = nested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function objectToYaml(obj: unknown, indent: number = 2): string {
  const cleanedObj =
    obj !== null && typeof obj === 'object'
      ? removeEmptyValues(obj as Record<string, unknown>)
      : undefined;
  return yaml.dump(cleanedObj ?? {}, {
    indent,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

export function isValidYaml(yamlString: string): boolean {
  try {
    yaml.load(yamlString);
    return true;
  } catch {
    return false;
  }
}

function isRosaControlPlaneYaml(obj: unknown): obj is Record<string, unknown> {
  return Boolean(
    obj && typeof obj === 'object' && (obj as Record<string, unknown>).kind === 'ROSAControlPlane'
  );
}

function mapRosaEndpointAccess(
  cluster: Record<string, unknown>,
  endpointAccess: string | undefined
): void {
  if (endpointAccess === 'Private') {
    cluster.cluster_privacy = ClusterNetwork.internal;
  } else if (endpointAccess === 'Public') {
    cluster.cluster_privacy = ClusterNetwork.external;
  }
}

function mapRosaNetworkFields(
  cluster: Record<string, unknown>,
  network: Record<string, unknown> | undefined
): void {
  if (!network) return;
  if (network.machineCIDR) cluster.network_machine_cidr = network.machineCIDR;
  if (network.serviceCIDR) cluster.network_service_cidr = network.serviceCIDR;
  if (network.podCIDR) cluster.network_pod_cidr = network.podCIDR;
  if (network.hostPrefix) cluster.network_host_prefix = `/${String(network.hostPrefix)}`;
}

function mapRosaMachinePoolFields(
  cluster: Record<string, unknown>,
  machinePoolSpec: Record<string, unknown> | undefined
): void {
  if (!machinePoolSpec) return;
  if (machinePoolSpec.instanceType) cluster.machine_type = machinePoolSpec.instanceType;
  if (machinePoolSpec.volumeSize) cluster.compute_root_volume = machinePoolSpec.volumeSize;
  const autoscaling = machinePoolSpec.autoscaling as Record<string, unknown> | undefined;
  if (!autoscaling) return;
  cluster.autoscaling = true;
  cluster.min_replicas = autoscaling.minReplicas;
  cluster.max_replicas = autoscaling.maxReplicas;
}

function mapRosaControlPlaneToCluster(parsed: Record<string, unknown>): Record<string, unknown> {
  const spec = parsed.spec as Record<string, unknown> | undefined;
  const metadata = parsed.metadata as Record<string, unknown> | undefined;
  const network = spec?.network as Record<string, unknown> | undefined;
  const machinePoolSpec = spec?.defaultMachinePoolSpec as Record<string, unknown> | undefined;

  const cluster: Record<string, unknown> = {};

  if (metadata?.name) cluster.name = metadata.name;
  if (spec?.version) cluster.cluster_version = spec.version;
  if (spec?.region) cluster.region = spec.region;
  if (spec?.billingAccount) cluster.billing_account_id = spec.billingAccount;

  mapRosaEndpointAccess(cluster, spec?.endpointAccess as string | undefined);

  if (spec?.installerRoleARN) cluster.installer_role_arn = spec.installerRoleARN;
  if (spec?.supportRoleARN) cluster.support_role_arn = spec.supportRoleARN;
  if (spec?.workerRoleARN) cluster.worker_role_arn = spec.workerRoleARN;
  if (spec?.oidcID) cluster.byo_oidc_config_id = spec.oidcID;

  mapRosaNetworkFields(cluster, network);
  mapRosaMachinePoolFields(cluster, machinePoolSpec);

  if (spec?.etcdEncryptionKMSARN) {
    cluster.etcd_encryption = true;
    cluster.etcd_key_arn = spec.etcdEncryptionKMSARN;
  }

  return cluster;
}

export function parseRosaControlPlaneYaml(yamlStr: string): Record<string, unknown> | null {
  try {
    const obj = yaml.load(yamlStr);
    if (!isRosaControlPlaneYaml(obj)) {
      return null;
    }
    return { cluster: mapRosaControlPlaneToCluster(obj) };
  } catch {
    return null;
  }
}

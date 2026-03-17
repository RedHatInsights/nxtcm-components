import * as yaml from 'js-yaml';

export interface YamlParseResult {
  isValid: boolean;
  data?: any;
  error?: string;
  errorLine?: number;
}

/**
 * Parse and validate YAML string
 * @param yamlString The YAML string to parse
 * @returns Parse result with validity status, data, and error information
 */
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
        errorLine: error.mark?.line ? error.mark.line + 1 : undefined,
      };
    }
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format YAML with consistent indentation
 * @param yamlString The YAML string to prettify
 * @param indent Number of spaces for indentation (default: 2)
 * @returns Formatted YAML string, or original string if invalid
 */
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

export function removeEmptyValues(obj: Record<string, any>): Record<string, any> | undefined {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;

    if (Array.isArray(value)) {
      const filteredArray = value.filter((item) => item !== null && item !== undefined);
      if (filteredArray.length > 0) {
        cleaned[key] = filteredArray;
      }
    } else if (typeof value === 'object') {
      const nested = removeEmptyValues(value);
      if (nested !== undefined) {
        cleaned[key] = nested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * Convert a JavaScript object to YAML string
 * @param obj The object to convert
 * @param indent Number of spaces for indentation (default: 2)
 * @returns YAML string representation
 */
export function objectToYaml(obj: any, indent: number = 2): string {
  const cleanedObj = removeEmptyValues(obj);
  return yaml.dump(cleanedObj ?? {}, {
    indent,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Quick validation check for YAML string
 * @param yamlString The YAML string to validate
 * @returns true if valid, false otherwise
 */
export function isValidYaml(yamlString: string): boolean {
  try {
    yaml.load(yamlString);
    return true;
  } catch {
    return false;
  }
}

export function parseMultiDocYaml(yamlStr: string): Record<string, unknown> | null {
  try {
    const docs = yamlStr.split(/^---$/m).filter((doc) => doc.trim());
    if (docs.length === 0) return null;

    const rosaCP = docs.find((doc) => doc.includes('kind: ROSAControlPlane'));
    if (!rosaCP) return null;

    const parsed = yaml.load(rosaCP) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;

    const spec = parsed.spec as Record<string, unknown> | undefined;
    const metadata = parsed.metadata as Record<string, unknown> | undefined;
    const network = spec?.network as Record<string, unknown> | undefined;
    const machinePoolSpec = spec?.defaultMachinePoolSpec as Record<string, unknown> | undefined;
    const autoscaling = machinePoolSpec?.autoscaling as Record<string, unknown> | undefined;

    const cluster: Record<string, unknown> = {};

    if (metadata?.name) cluster.name = metadata.name;
    if (spec?.version) cluster.cluster_version = spec.version;
    if (spec?.region) cluster.region = spec.region;
    if (spec?.billingAccount) cluster.billing_account_id = spec.billingAccount;

    const endpointAccess = spec?.endpointAccess as string | undefined;
    cluster.cluster_privacy = endpointAccess === 'Private' ? 'internal' : 'external';

    if (spec?.installerRoleARN) cluster.installer_role_arn = spec.installerRoleARN;
    if (spec?.supportRoleARN) cluster.support_role_arn = spec.supportRoleARN;
    if (spec?.workerRoleARN) cluster.worker_role_arn = spec.workerRoleARN;
    if (spec?.oidcID) cluster.byo_oidc_config_id = spec.oidcID;

    if (network) {
      if (network.machineCIDR) cluster.network_machine_cidr = network.machineCIDR;
      if (network.serviceCIDR) cluster.network_service_cidr = network.serviceCIDR;
      if (network.podCIDR) cluster.network_pod_cidr = network.podCIDR;
      if (network.hostPrefix) cluster.network_host_prefix = `/${String(network.hostPrefix)}`;
    }

    if (machinePoolSpec) {
      if (machinePoolSpec.instanceType) cluster.machine_type = machinePoolSpec.instanceType;
      if (machinePoolSpec.volumeSize) cluster.compute_root_volume = machinePoolSpec.volumeSize;
      if (autoscaling) {
        cluster.autoscaling = true;
        cluster.nodes_compute_min = autoscaling.minReplicas;
        cluster.nodes_compute_max = autoscaling.maxReplicas;
      }
    }

    if (spec?.etcdEncryptionKMSARN) {
      cluster.etcd_encryption = true;
      cluster.etcd_key_arn = spec.etcdEncryptionKMSARN;
    }

    return { cluster };
  } catch {
    return null;
  }
}

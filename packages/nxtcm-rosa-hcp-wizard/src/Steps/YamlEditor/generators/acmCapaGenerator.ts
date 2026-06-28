import Handlebars from 'handlebars';

import { parseRosaControlPlaneYaml } from '../yamlUtils';
import type { YamlResourceGenerator, ResourceSchema } from '../types';
import type { ROSAHCPCluster } from '../../../types';
import { createTemplateBasedGenerator } from './createTemplateBasedGenerator';
import rosaHcpTemplateRaw from '../templates/rosa-hcp-template.hbs?raw';

const eqHelper: Handlebars.HelperDelegate = function (
  this: unknown,
  a: unknown,
  b: unknown,
  options: Handlebars.HelperOptions
) {
  return a === b ? options.fn(this) : options.inverse(this);
};

const stripSlashHelper: Handlebars.HelperDelegate = function (value: string) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value.slice(1);
  }
  return value;
};

export const ACM_CAPA_FORM_FIELDS = [
  'name',
  'cluster_version',
  'region',
  'billing_account_id',
  'cluster_privacy',
  'installer_role_arn',
  'support_role_arn',
  'worker_role_arn',
  'byo_oidc_config_id',
  'network_machine_cidr',
  'network_service_cidr',
  'network_pod_cidr',
  'network_host_prefix',
  'machine_type',
  'compute_root_volume',
  'autoscaling',
  'min_replicas',
  'max_replicas',
  'etcd_encryption',
  'etcd_key_arn',
] as const satisfies ReadonlyArray<keyof ROSAHCPCluster>;

export function createAcmCapaGenerator(resourceSchemas: ResourceSchema[]): YamlResourceGenerator {
  return createTemplateBasedGenerator({
    template: rosaHcpTemplateRaw,
    resourceSchemas,
    parseYamlToForm: parseRosaControlPlaneYaml,
    formFields: ACM_CAPA_FORM_FIELDS,
    helpers: {
      eq: eqHelper,
      stripSlash: stripSlashHelper,
    },
  });
}

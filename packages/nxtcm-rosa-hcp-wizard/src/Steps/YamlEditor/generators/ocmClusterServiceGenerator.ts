import * as yaml from 'js-yaml';

import type { YamlResourceGenerator, ValidationError } from '../types';
import type { ROSAHCPCluster } from '../../../types';

export function createOcmClusterServiceGenerator(): YamlResourceGenerator {
  return {
    renderYaml(formValues) {
      // TODO: replace with a Handlebars template or structured builder once
      // the ClusterService CRD / OCM API shape is confirmed.
      const manifest = {
        apiVersion: 'clusters.clusteropenshift.io/v1',
        kind: 'ClusterService',
        metadata: {
          name: formValues.name ?? '',
        },
        spec: {
          region: formValues.region ?? '',
          version: formValues.cluster_version ?? '',
          ...(formValues.network_machine_cidr
            ? {
                network: {
                  machineCIDR: formValues.network_machine_cidr,
                  serviceCIDR: formValues.network_service_cidr,
                  podCIDR: formValues.network_pod_cidr,
                },
              }
            : {}),
        },
      };

      try {
        return yaml.dump(manifest, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false });
      } catch {
        return '';
      }
    },

    validateYaml(yamlStr): ValidationError[] {
      // TODO: add schema validation once the ClusterService JSON Schema is available.
      // For now only parse-level errors are reported.
      try {
        const docs = yaml.loadAll(yamlStr);
        const hasService = docs.some(
          (doc) =>
            doc !== null &&
            typeof doc === 'object' &&
            (doc as Record<string, unknown>).kind === 'ClusterService'
        );
        if (!hasService) {
          return [
            { message: 'Missing ClusterService document', line: 1, column: 1, severity: 'error' },
          ];
        }
        return [];
      } catch (e) {
        if (e instanceof yaml.YAMLException) {
          return [
            {
              message: e.message.split('\n')[0],
              line: (e.mark?.line ?? 0) + 1,
              column: (e.mark?.column ?? 0) + 1,
              severity: 'error',
            },
          ];
        }
        return [];
      }
    },

    parseYamlToForm(yamlStr): Record<string, unknown> | null {
      // TODO: expand field mapping once the ClusterService spec is stable.
      try {
        const docs = yaml.loadAll(yamlStr);
        const service = docs.find(
          (doc) =>
            doc !== null &&
            typeof doc === 'object' &&
            (doc as Record<string, unknown>).kind === 'ClusterService'
        ) as Record<string, unknown> | undefined;

        if (!service) return null;

        const metadata = service.metadata as Record<string, unknown> | undefined;
        const spec = service.spec as Record<string, unknown> | undefined;

        const cluster: Record<string, unknown> = {};
        if (metadata?.name) cluster.name = metadata.name;
        if (spec?.region) cluster.region = spec.region;
        if (spec?.version) cluster.cluster_version = spec.version;

        return { cluster };
      } catch {
        return null;
      }
    },

    formFields: ['name', 'region', 'cluster_version'] as const satisfies ReadonlyArray<
      keyof ROSAHCPCluster
    >,

    // monacoSchema intentionally omitted until the ClusterService JSON Schema is available.
  };
}

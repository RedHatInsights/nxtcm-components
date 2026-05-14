import clusterSchema from './clusterSchema.json';
import rosaClusterSchema from './rosaClusterSchema.json';
import rosaControlPlaneSchema from './rosaControlPlaneSchema.json';
import rosaNetworkSchema from './rosaNetworkSchema.json';
import machinePoolSchema from './machinePoolSchema.json';
import rosaMachinePoolSchema from './rosaMachinePoolSchema.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Schema = Record<string, any>;

function buildIfThen(
  schema: Schema
): { if: Record<string, unknown>; then: { properties: Record<string, unknown> } } | null {
  const kindConst = schema.properties?.kind?.const as string | undefined;
  if (!kindConst) return null;

  const thenProps: Record<string, unknown> = {};

  if (schema.properties?.apiVersion?.const) {
    thenProps.apiVersion = { const: schema.properties.apiVersion.const };
  }
  if (schema.properties?.spec) {
    thenProps.spec = schema.properties.spec;
  }
  if (schema.properties?.status) {
    thenProps.status = schema.properties.status;
  }

  return {
    if: {
      properties: { kind: { const: kindConst } },
      required: ['kind'],
    },
    then: { properties: thenProps },
  };
}

const allSchemas: Schema[] = [
  clusterSchema,
  rosaClusterSchema,
  rosaControlPlaneSchema,
  rosaNetworkSchema,
  machinePoolSchema,
  rosaMachinePoolSchema,
];

const ifThenRules = allSchemas
  .map(buildIfThen)
  .filter((rule): rule is NonNullable<typeof rule> => rule !== null);

const kindValues = allSchemas
  .map((s) => s.properties?.kind?.const as string | undefined)
  .filter((k): k is string => Boolean(k));

export const combinedSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    apiVersion: {
      description:
        'APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values.',
      type: 'string',
    },
    kind: {
      description:
        'Kind is a string value representing the REST resource this object represents. Cannot be updated.',
      type: 'string',
      enum: kindValues,
    },
    metadata: {
      description: 'Standard Kubernetes object metadata.',
      type: 'object',
      properties: {
        name: { description: 'Name of the resource.', type: 'string' },
        namespace: { description: 'Namespace of the resource.', type: 'string' },
        labels: {
          description: 'Map of string keys and values for organizing and categorizing objects.',
          type: 'object',
          additionalProperties: { type: 'string' },
        },
        annotations: {
          description: 'Annotations is an unstructured key value map stored with a resource.',
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
    spec: { type: 'object' },
    status: { type: 'object' },
  },
  allOf: ifThenRules,
};

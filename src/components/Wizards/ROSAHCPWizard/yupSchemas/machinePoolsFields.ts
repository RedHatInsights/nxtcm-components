import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx } from './helpers';

export const selectedVpcSchema = yup
  .mixed()
  .required()
  .meta({
    id: 'selected_vpc',
    labelKey: 'machinePools.vpcLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    reviewLabel: 'Install to selected VPC',
  } satisfies WizardFieldMeta);

export const machinePoolsSubnetsSchema = yup
  .array()
  .default([])
  .required()
  .meta({
    id: 'machine_pools_subnets',
    labelKey: 'machinePools.subnetLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    reviewLabel: 'Machine pools',
  } satisfies WizardFieldMeta);

export const machineTypeSchema = yup
  .string()
  .required()
  .meta({
    id: 'machine_type',
    labelKey: 'machinePools.instanceTypeLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const autoscalingSchema = yup
  .boolean()
  .default(false)
  .optional()
  .meta({
    id: 'autoscaling',
    labelKey: 'autoscaling.enableLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'checkbox',
  } satisfies WizardFieldMeta);

export const nodesComputeSchema = yup
  .number()
  .default(2)
  .optional()
  .meta({
    id: 'nodes_compute',
    labelKey: 'autoscaling.computeCountLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'number',
  } satisfies WizardFieldMeta)
  .test('compute-nodes', '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs } = ctx(this);
    if (!Number.isInteger(value)) {
      return this.createError({ message: msgs.replicas.notInteger });
    }
    if (value <= 0) {
      return this.createError({ message: msgs.replicas.notPositive });
    }
    return true;
  });

export const minReplicasSchema = yup
  .number()
  .optional()
  .meta({
    id: 'min_replicas',
    labelKey: 'autoscaling.minLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'number',
  } satisfies WizardFieldMeta)
  .test('min-replicas', '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs, machinePoolsNumber } = ctx(this);
    if (!Number.isInteger(value)) {
      return this.createError({ message: msgs.replicas.notInteger });
    }
    if (value <= 0) {
      return this.createError({ message: msgs.replicas.notPositive });
    }
    if (value > 500) {
      return this.createError({ message: msgs.replicas.maxNodes(500) });
    }
    const maxReplicas = this.parent?.max_replicas as number | undefined;
    if (maxReplicas !== undefined && value > maxReplicas) {
      return this.createError({ message: msgs.replicas.minGreaterThanMax });
    }
    if (machinePoolsNumber < 2 && value < 2) {
      return this.createError({ message: msgs.replicas.computeMinTwo });
    }
    return true;
  });

export const maxReplicasSchema = yup
  .number()
  .optional()
  .meta({
    id: 'max_replicas',
    labelKey: 'autoscaling.maxLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'number',
  } satisfies WizardFieldMeta)
  .test('max-replicas', '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs, maxAutoscalingNodes } = ctx(this);
    if (!Number.isInteger(value)) {
      return this.createError({ message: msgs.replicas.notInteger });
    }
    if (value <= 0) {
      return this.createError({ message: msgs.replicas.notPositive });
    }
    if (value > maxAutoscalingNodes) {
      return this.createError({ message: msgs.replicas.maxNodes(maxAutoscalingNodes) });
    }
    const minReplicas = this.parent?.min_replicas as number | undefined;
    if (minReplicas !== undefined && value < minReplicas) {
      return this.createError({ message: msgs.replicas.maxLessThanMin });
    }
    return true;
  });

export const computeRootVolumeSchema = yup
  .number()
  .default(300)
  .optional()
  .meta({
    id: 'compute_root_volume',
    labelKey: 'machinePools.rootDiskLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'number',
    unit: 'GiB',
    advanced: true,
  } satisfies WizardFieldMeta)
  .test('root-disk-size', '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs, maxRootDiskSize } = ctx(this);
    if (!Number.isInteger(value)) {
      return this.createError({ message: msgs.rootDisk.notInteger });
    }
    if (value < 75) {
      return this.createError({ message: msgs.rootDisk.tooSmall });
    }
    if (value > maxRootDiskSize && maxRootDiskSize === 1024) {
      return this.createError({ message: msgs.rootDisk.tooLargeOldOpenshift });
    }
    if (value > maxRootDiskSize && maxRootDiskSize === 16384) {
      return this.createError({ message: msgs.rootDisk.tooLargeNewOpenshift });
    }
    return true;
  });

export const imdsSchema = yup
  .string()
  .optional()
  .meta({
    id: 'imds',
    labelKey: 'machinePools.imdsLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'radio',
    advanced: true,
  } satisfies WizardFieldMeta);

export const machinePoolsFields = {
  selected_vpc: selectedVpcSchema,
  machine_pools_subnets: machinePoolsSubnetsSchema,
  machine_type: machineTypeSchema,
  autoscaling: autoscalingSchema,
  nodes_compute: nodesComputeSchema,
  min_replicas: minReplicasSchema,
  max_replicas: maxReplicasSchema,
  compute_root_volume: computeRootVolumeSchema,
  imds: imdsSchema,
};

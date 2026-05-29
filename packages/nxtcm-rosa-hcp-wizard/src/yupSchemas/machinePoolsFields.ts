import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx, rosaCommonRequiredNonEmptyTest } from './helpers';
import { validateSecurityGroups } from '../validators';

export const selectedVpcSchema = yup
  .mixed()
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'selected_vpc',
    labelKey: 'machinePools.vpcLabel',
    placeholderKey: 'machinePools.vpcPlaceholder',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    reviewLabel: 'Install to selected VPC',
    resetsFieldsToDefaultOnChange: ['machine_pools_subnets', 'security_groups_worker'],
    derivedFieldsSyncOnChange: 'vpcSecurityGroupsWorkerSelection',
  } satisfies WizardFieldMeta);

/** One machine pool row; array shape is required for API / review even when the UI shows a single subnet. */
export const machinePoolSubnetEntrySchema = yup.object({
  machine_pool_subnet: yup
    .string()
    .required()
    .meta({
      id: 'machine_pool_subnet',
      labelKey: 'machinePools.subnetLabel',
      placeholderKey: 'machinePools.subnetPlaceholder',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'select',
    } satisfies WizardFieldMeta),
});

/** Default single-subnet row for the machine pools UI (`machine_pools_subnets.0`). */
export const DEFAULT_MACHINE_POOL_SUBNETS = [{ machine_pool_subnet: '' }] as const;

export const machinePoolsSubnetsSchema = yup
  .array()
  .of(machinePoolSubnetEntrySchema)
  .default([...DEFAULT_MACHINE_POOL_SUBNETS])
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'machine_pools_subnets',
    labelKey: 'machinePools.subnetLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
  } satisfies WizardFieldMeta);

export const machineTypeSchema = yup
  .string()
  .test(rosaCommonRequiredNonEmptyTest)
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
    hideInReview: true,
    syncsFieldsOnChange: [
      {
        when: true,
        setDefaults: ['min_replicas', 'max_replicas'],
        clear: ['nodes_compute'],
      },
      {
        when: false,
        setDefaults: ['nodes_compute'],
        clear: ['min_replicas', 'max_replicas'],
      },
    ],
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
  .default(2)
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
  .default(4)
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

export const securityGroupsWorkerSchema = yup
  .array()
  .of(yup.string())
  .default([])
  .optional()
  .test('security-groups-worker', '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs } = ctx(this);
    const error = validateSecurityGroups(value as string[], msgs.securityGroups);
    if (error) {
      return this.createError({ message: error });
    }
    return true;
  })
  .meta({
    id: 'security_groups_worker',
    labelKey: 'securityGroups.formLabel',
    stepId: STEP_IDS.MACHINE_POOLS,
    fieldType: 'select',
    /** Pruned to IDs still present on the resolved selected VPC when VPC list data changes. */
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
  security_groups_worker: securityGroupsWorkerSchema,
};

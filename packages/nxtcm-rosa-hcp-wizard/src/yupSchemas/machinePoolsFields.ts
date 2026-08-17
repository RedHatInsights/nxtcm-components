import * as yup from 'yup';

import {
  MIN_ROOT_DISK_SIZE_GIB,
  MAX_ROOT_DISK_SIZE_OLD_OPENSHIFT,
  MAX_ROOT_DISK_SIZE_NEW_OPENSHIFT,
} from '../constants';
import type { WizardFieldMeta } from './types';
import {
  ctx,
  rosaRequiredArrayField,
  rosaRequiredMixedField,
  rosaRequiredStringField,
} from './helpers';
import { validateSecurityGroups } from '../validators';
import { YUP } from './constants';
import { FIELD_NAME } from '../constants';

export const selectedVpcSchema = rosaRequiredMixedField().meta({
  id: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.ID,
  labelKey: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.LABEL_KEY,
  placeholderKey: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.PLACEHOLDER_KEY,
  stepId: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.STEP_ID,
  fieldType: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.FIELD_TYPE,
  noEditAfterSubmit: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  reviewLabel: YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.REVIEW_LABEL,
  optionsWizardDataResource:
    YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  refetchesResourcesOnChange:
    YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.REFETCHES_RESOURCES_ON_CHANGE,
  reconcileValueWithOptions:
    YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  resetsFieldsToDefaultOnChange:
    YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  derivedFieldsSyncOnChange:
    YUP.MACHINE_POOLS.SELECTED_VPC_SCHEMA.META.DERIVED_FIELDS_SYNC_ON_CHANGE,
} satisfies WizardFieldMeta);

/** One machine pool row; array shape is required for API / review even when the UI shows a single subnet. */
export const machinePoolSubnetEntrySchema = yup.object({
  machine_pool_subnet: rosaRequiredStringField().meta({
    id: YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.LABEL_KEY,
    placeholderKey: YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.PLACEHOLDER_KEY,
    stepId: YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.FIELD_TYPE,
    optionsWizardDataResource:
      YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
    reconcileValueWithOptions:
      YUP.MACHINE_POOLS.MACHINE_POOL_SUBNET_ENTRY_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  } satisfies WizardFieldMeta),
});

/** Default single-subnet row for the machine pools UI (`machine_pools_subnets.0`). */
export const DEFAULT_MACHINE_POOL_SUBNETS = [{ machine_pool_subnet: '' }] as const;

export const machinePoolsSubnetsSchema = rosaRequiredArrayField(machinePoolSubnetEntrySchema, [
  ...DEFAULT_MACHINE_POOL_SUBNETS,
]).meta({
  id: YUP.MACHINE_POOLS.MACHINE_POOLS_SUBNETS_SCHEMA.META.ID,
  labelKey: YUP.MACHINE_POOLS.MACHINE_POOLS_SUBNETS_SCHEMA.META.LABEL_KEY,
  stepId: YUP.MACHINE_POOLS.MACHINE_POOLS_SUBNETS_SCHEMA.META.STEP_ID,
  fieldType: YUP.MACHINE_POOLS.MACHINE_POOLS_SUBNETS_SCHEMA.META.FIELD_TYPE,
  noEditAfterSubmit: YUP.MACHINE_POOLS.MACHINE_POOLS_SUBNETS_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
} satisfies WizardFieldMeta);

export const machineTypeSchema = rosaRequiredStringField().meta({
  id: YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.ID,
  labelKey: YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.LABEL_KEY,
  stepId: YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.STEP_ID,
  fieldType: YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.FIELD_TYPE,
  noEditAfterSubmit: YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  optionsWizardDataResource:
    YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  reconcileValueWithOptions:
    YUP.MACHINE_POOLS.MACHINE_TYPE_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
} satisfies WizardFieldMeta);

export const autoscalingSchema = yup
  .boolean()
  .default(YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.FIELD_TYPE,
    hideInReview: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.HIDE_IN_REVIEW,
    syncsFieldsOnChange: YUP.MACHINE_POOLS.AUTOSCALING_SCHEMA.META.SYNCS_FIELDS_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const nodesComputeSchema = yup
  .number()
  .default(YUP.MACHINE_POOLS.NODES_COMPUTE_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.NODES_COMPUTE_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.NODES_COMPUTE_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.NODES_COMPUTE_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.NODES_COMPUTE_SCHEMA.META.FIELD_TYPE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.NODES_COMPUTE, '', function (value) {
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
  .default(YUP.MACHINE_POOLS.MIN_REPLICAS_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.MIN_REPLICAS_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.MIN_REPLICAS_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.MIN_REPLICAS_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.MIN_REPLICAS_SCHEMA.META.FIELD_TYPE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.MIN_REPLICAS, '', function (value) {
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
  .default(YUP.MACHINE_POOLS.MAX_REPLICAS_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.MAX_REPLICAS_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.MAX_REPLICAS_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.MAX_REPLICAS_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.MAX_REPLICAS_SCHEMA.META.FIELD_TYPE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.MAX_REPLICAS, '', function (value) {
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
  .default(YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    unit: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.UNIT,
    advanced: YUP.MACHINE_POOLS.COMPUTE_ROOT_VOLUME_SCHEMA.META.ADVANCED,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.COMPUTE_ROOT_VOLUME, '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs, maxRootDiskSize } = ctx(this);
    if (!Number.isInteger(value)) {
      return this.createError({ message: msgs.rootDisk.notInteger });
    }
    if (value < MIN_ROOT_DISK_SIZE_GIB) {
      return this.createError({ message: msgs.rootDisk.tooSmall });
    }
    if (value > maxRootDiskSize && maxRootDiskSize === MAX_ROOT_DISK_SIZE_OLD_OPENSHIFT) {
      return this.createError({ message: msgs.rootDisk.tooLargeOldOpenshift });
    }
    if (value > maxRootDiskSize && maxRootDiskSize === MAX_ROOT_DISK_SIZE_NEW_OPENSHIFT) {
      return this.createError({ message: msgs.rootDisk.tooLargeNewOpenshift });
    }
    return true;
  });

export const imdsSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    advanced: YUP.MACHINE_POOLS.IMDS_SCHEMA.META.ADVANCED,
  } satisfies WizardFieldMeta);

export const securityGroupsWorkerSchema = yup
  .array()
  .of(yup.string())
  .default([...YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.DEFAULT])
  .optional()
  .test(FIELD_NAME.SECURITY_GROUPS_WORKER, '', function (value) {
    if (value === undefined || value === null) return true;
    const { msgs } = ctx(this);
    const error = validateSecurityGroups(value as string[], msgs.securityGroups);
    if (error) {
      return this.createError({ message: error });
    }
    return true;
  })
  .meta({
    id: YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.ID,
    labelKey: YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.LABEL_KEY,
    stepId: YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.STEP_ID,
    fieldType: YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    reconcileValueWithOptions:
      YUP.MACHINE_POOLS.SECURITY_GROUPS_WORKER_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
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

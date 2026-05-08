import * as yup from 'yup';
import { overlapCidr, containsCidr } from 'cidr-tools';
import IPCIDR from 'ip-cidr';

import {
  AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX,
  AWS_KMS_SERVICE_ACCOUNT_REGEX,
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MIN,
  BASE_DOMAIN_REGEXP,
  CIDR_REGEXP,
  DNS_LABEL_REGEXP,
  HOST_PREFIX_MAX,
  HOST_PREFIX_MIN,
  HOST_PREFIX_REGEXP,
  MAX_CA_SIZE_BYTES,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
  STEP_IDS,
} from './constants';
import { parseCIDRSubnetLength, stringToArray } from './helpers';
import type { ClusterFormData, CIDRSubnet } from '../types';
import type { RosaHcpWizardValidatorStrings } from './stringsProvider/rosaHcpWizardStrings';

// ---------------------------------------------------------------------------
// Meta type
// ---------------------------------------------------------------------------

/** Static metadata attached to each field via `.meta()`. */
export type WizardFieldMeta = {
  /** Unique field identifier (matches the schema path). */
  id: string;
  /** Dot-path key into the strings provider for resolving label, placeholder, and helper text at runtime. */
  labelKey: string;
  /** Which wizard step this field belongs to. */
  stepId: string;
  /** If true, field is read-only after the cluster is created / submitted. */
  noEditAfterSubmit?: boolean;
  /** If true, field appears in the review summary. */
  showInReview?: boolean;
  /** Override label for the review step (when different from form label). */
  reviewLabel?: string;
  /** Hint for which component type to render. */
  fieldType?: 'text' | 'select' | 'radio' | 'checkbox' | 'number' | 'textarea' | 'typeahead';
  /** Whether the field lives behind an "Advanced" toggle. */
  advanced?: boolean;
  /** Display unit for the review step. */
  unit?: string;
};

// ---------------------------------------------------------------------------
// Validation context (runtime values)
// ---------------------------------------------------------------------------

/**
 * Context object passed at validation time via `schema.validate(data, { context })`.
 * All runtime-dependent values live here instead of in a factory closure.
 */
export type ValidationSchemaContext = {
  /** Localized validation error messages. */
  msgs: RosaHcpWizardValidatorStrings;
  /** Maximum root disk size in GiB (version-dependent: 1024 or 16384). */
  maxRootDiskSize: number;
  /** Maximum autoscaling node count (version-dependent: 90 or 500). */
  maxAutoscalingNodes: number;
  /** Number of machine pools currently configured (affects min-replica lower bound). */
  machinePoolsNumber: number;
  /** VPC subnets currently selected (for CIDR containment checks). */
  selectedSubnets?: CIDRSubnet[];
  /**
   * Async callback that checks whether a cluster name is already in use.
   * Returns `null` when the name is available, or an error message string
   * when it is taken / the check fails.
   */
  checkClusterNameUniqueness?: (name: string, region?: string) => Promise<string | null>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';

function ctx(testContext: yup.TestContext): ValidationSchemaContext {
  return testContext.options.context as ValidationSchemaContext;
}

function isValidCidr(value: string): boolean {
  return CIDR_REGEXP.test(value);
}

function isCidrSubnetAddress(value: string): boolean {
  const parts = value.split('/');
  const binaryStr = parts[0]
    .split('.')
    .map((octet) => Number(octet).toString(2).padEnd(8, '0'))
    .join('');
  const maskBits = parseInt(parts[1], 10);
  const masked = binaryStr.slice(0, maskBits).padEnd(32, '0');
  return masked === binaryStr;
}

function getStartingIP(cidr: string): string {
  const ip = new IPCIDR(cidr);
  return ip.start().toString();
}

function validateClusterNameSync(
  value: string,
  msgs: RosaHcpWizardValidatorStrings['clusterName']
): string | undefined {
  if (!value) return undefined;
  if (value.length > 54) return msgs.maxLength;
  for (const char of value) {
    if (!LOWERCASE_ALPHANUMERIC.includes(char) && char !== '-' && char !== '.') {
      return msgs.invalidChars;
    }
  }
  if (!LOWERCASE_ALPHANUMERIC.includes(value[0])) return msgs.mustStartAlphanumeric;
  if (/^[0-9]/.test(value[0])) return msgs.mustNotStartNumber;
  if (!LOWERCASE_ALPHANUMERIC.includes(value[value.length - 1])) return msgs.mustEndAlphanumeric;
  return undefined;
}

function findOverlappingCidrFields(
  value: string,
  fieldName: string,
  formData: Partial<ClusterFormData>,
  msgs: RosaHcpWizardValidatorStrings['disjointSubnets']
): string[] {
  const fieldLabels: Record<string, string> = {
    network_machine_cidr: msgs.fieldLabelMachine,
    network_service_cidr: msgs.fieldLabelService,
    network_pod_cidr: msgs.fieldLabelPod,
  };
  delete fieldLabels[fieldName];

  const overlapping: string[] = [];
  Object.entries(fieldLabels).forEach(([name, label]) => {
    const fieldValue = (formData as Record<string, string | undefined>)[name];
    try {
      if (fieldValue && overlapCidr(value, fieldValue)) {
        overlapping.push(label);
      }
    } catch {
      // parse error — ignore
    }
  });
  return overlapping;
}

// ---------------------------------------------------------------------------
// Metadata accessor
// ---------------------------------------------------------------------------

/**
 * Retrieves the {@link WizardFieldMeta} for a given field path in the schema.
 *
 * @example
 * ```ts
 * const meta = wizardFieldMetaByPath('name');
 * // => { id: 'name', labelKey: 'details.clusterNameLabel', stepId: 'details-substep', ... }
 * ```
 */
export function wizardFieldMetaByPath(path: string): WizardFieldMeta | undefined {
  try {
    const fieldSchema = yup.reach(clusterValidationSchemaWithMeta, path) as yup.Schema;
    return fieldSchema.describe().meta as WizardFieldMeta;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * A single, statically-defined Yup schema for `ClusterFormData` with
 * `.meta()` on every field.
 *
 * - **Validation:** runtime values come from `this.options.context`.
 * - **Metadata:** static field info (label, step, review flags) lives in `.meta()`.
 *
 * ```ts
 * // Validate
 * clusterValidationSchemaWithMeta.validate(formData, { context });
 *
 * // Read meta
 * wizardFieldMetaByPath('name'); // => { id, labelKey, stepId, ... }
 * ```
 */
export const clusterValidationSchemaWithMeta = yup.object({
  // =========================================================================
  // Details
  // =========================================================================

  name: yup
    .string()
    .required()
    .meta({
      id: 'name',
      labelKey: 'details.clusterNameLabel',
      stepId: STEP_IDS.DETAILS,
      fieldType: 'text',
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('cluster-name-sync', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      const error = validateClusterNameSync(value, msgs.clusterName);
      return error ? this.createError({ message: error }) : true;
    })
    .test('cluster-name-unique', '', async function (value) {
      if (!value) return true;
      const { msgs, checkClusterNameUniqueness } = ctx(this);
      if (!checkClusterNameUniqueness) return true;
      if (validateClusterNameSync(value, msgs.clusterName)) return true;

      const region = (this.parent as Partial<ClusterFormData>).region;
      const error = await checkClusterNameUniqueness(value, region);
      return error ? this.createError({ message: error }) : true;
    }),

  cluster_version: yup
    .string()
    .required()
    .meta({
      id: 'cluster_version',
      labelKey: 'details.openShiftVersionLabel',
      stepId: STEP_IDS.DETAILS,
      fieldType: 'select',
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta),

  associated_aws_id: yup
    .string()
    .required()
    .meta({
      id: 'associated_aws_id',
      labelKey: 'details.awsInfraLabel',
      stepId: STEP_IDS.DETAILS,
      fieldType: 'select',
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta),

  billing_account_id: yup
    .string()
    .required()
    .meta({
      id: 'billing_account_id',
      labelKey: 'details.billingLabel',
      stepId: STEP_IDS.DETAILS,
      fieldType: 'select',
      showInReview: true,
      reviewLabel: 'AWS billing account',
    } satisfies WizardFieldMeta),

  region: yup
    .string()
    .required()
    .meta({
      id: 'region',
      labelKey: 'details.regionLabel',
      stepId: STEP_IDS.DETAILS,
      fieldType: 'select',
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta),

  // =========================================================================
  // Roles & policies
  // =========================================================================

  installer_role_arn: yup
    .string()
    .required()
    .meta({
      id: 'installer_role_arn',
      labelKey: 'rolesAndPolicies.installerRoleLabel',
      stepId: STEP_IDS.ROLES_AND_POLICIES,
      fieldType: 'select',
      showInReview: true,
    } satisfies WizardFieldMeta),

  support_role_arn: yup
    .string()
    .required()
    .meta({
      id: 'support_role_arn',
      labelKey: 'rolesAndPolicies.supportRoleLabel',
      stepId: STEP_IDS.ROLES_AND_POLICIES,
      fieldType: 'select',
    } satisfies WizardFieldMeta),

  worker_role_arn: yup
    .string()
    .required()
    .meta({
      id: 'worker_role_arn',
      labelKey: 'rolesAndPolicies.workerRoleLabel',
      stepId: STEP_IDS.ROLES_AND_POLICIES,
      fieldType: 'select',
    } satisfies WizardFieldMeta),

  byo_oidc_config_id: yup
    .string()
    .required()
    .meta({
      id: 'byo_oidc_config_id',
      labelKey: 'rolesAndPolicies.oidcLabel',
      stepId: STEP_IDS.ROLES_AND_POLICIES,
      fieldType: 'select',
      showInReview: true,
    } satisfies WizardFieldMeta),

  custom_operator_roles_prefix: yup
    .string()
    .required()
    .meta({
      id: 'custom_operator_roles_prefix',
      labelKey: 'rolesAndPolicies.operatorPrefixLabel',
      stepId: STEP_IDS.ROLES_AND_POLICIES,
      fieldType: 'text',
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('operator-roles-prefix', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      const label = msgs.operatorRolesPrefix.fieldLabel;
      if (!DNS_LABEL_REGEXP.test(value)) {
        return this.createError({ message: msgs.operatorRolesPrefix.invalidFormat(label, value) });
      }
      if (value.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH) {
        return this.createError({
          message: msgs.operatorRolesPrefix.tooLong(label, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH),
        });
      }
      return true;
    }),

  // =========================================================================
  // Machine pools
  // =========================================================================

  selected_vpc: yup
    .mixed()
    .required()
    .meta({
      id: 'selected_vpc',
      labelKey: 'machinePools.vpcLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'select',
      noEditAfterSubmit: true,
      showInReview: true,
      reviewLabel: 'Install to selected VPC',
    } satisfies WizardFieldMeta),

  machine_pools_subnets: yup
    .array()
    .required()
    .meta({
      id: 'machine_pools_subnets',
      labelKey: 'machinePools.subnetLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      showInReview: true,
      reviewLabel: 'Machine pools',
    } satisfies WizardFieldMeta),

  machine_type: yup
    .string()
    .required()
    .meta({
      id: 'machine_type',
      labelKey: 'machinePools.instanceTypeLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'select',
      showInReview: true,
    } satisfies WizardFieldMeta),

  autoscaling: yup
    .boolean()
    .optional()
    .meta({
      id: 'autoscaling',
      labelKey: 'autoscaling.enableLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'checkbox',
    } satisfies WizardFieldMeta),

  nodes_compute: yup
    .number()
    .optional()
    .meta({
      id: 'nodes_compute',
      labelKey: 'autoscaling.computeCountLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'number',
      showInReview: true,
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
    }),

  min_replicas: yup
    .number()
    .optional()
    .meta({
      id: 'min_replicas',
      labelKey: 'autoscaling.minLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'number',
      showInReview: true,
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
    }),

  max_replicas: yup
    .number()
    .optional()
    .meta({
      id: 'max_replicas',
      labelKey: 'autoscaling.maxLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'number',
      showInReview: true,
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
    }),

  compute_root_volume: yup
    .number()
    .optional()
    .meta({
      id: 'compute_root_volume',
      labelKey: 'machinePools.rootDiskLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'number',
      unit: 'GiB',
      advanced: true,
      showInReview: true,
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
    }),

  imds: yup
    .string()
    .optional()
    .meta({
      id: 'imds',
      labelKey: 'machinePools.imdsLabel',
      stepId: STEP_IDS.MACHINE_POOLS,
      fieldType: 'radio',
      advanced: true,
    } satisfies WizardFieldMeta),

  // =========================================================================
  // Networking
  // =========================================================================

  cluster_privacy: yup
    .string()
    .required()
    .meta({
      id: 'cluster_privacy',
      labelKey: 'networking.sectionLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'radio',
      noEditAfterSubmit: true,
    } satisfies WizardFieldMeta),

  cluster_privacy_public_subnet_id: yup
    .string()
    .optional()
    .meta({
      id: 'cluster_privacy_public_subnet_id',
      labelKey: 'networking.publicSubnetLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'select',
      showInReview: true,
    } satisfies WizardFieldMeta),

  cidr_default: yup
    .boolean()
    .optional()
    .meta({
      id: 'cidr_default',
      labelKey: 'networking.useDefaultsLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'checkbox',
      advanced: true,
    } satisfies WizardFieldMeta),

  network_machine_cidr: yup
    .string()
    .optional()
    .meta({
      id: 'network_machine_cidr',
      labelKey: 'networking.machineCidrLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'text',
      advanced: true,
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('machine-cidr', '', function (value) {
      if (!value) return true;
      const { msgs, selectedSubnets } = ctx(this);

      if (!isValidCidr(value)) {
        return this.createError({ message: msgs.cidr.invalidNotation(value) });
      }
      if (!isCidrSubnetAddress(value)) {
        return this.createError({ message: msgs.validateRange.notSubnetAddress });
      }

      const prefixLength = parseCIDRSubnetLength(value);
      const formData = this.parent as Partial<ClusterFormData>;
      const isMultiAz = formData.multi_az === 'true';

      if (prefixLength != null) {
        if (prefixLength < AWS_MACHINE_CIDR_MIN) {
          return this.createError({
            message: msgs.awsMachineCidr.maskTooLarge(AWS_MACHINE_CIDR_MIN),
          });
        }
        if (
          (isMultiAz || formData.hypershift === 'true') &&
          prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ
        ) {
          return this.createError({
            message: msgs.awsMachineCidr.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ),
          });
        }
        if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
          return this.createError({
            message: msgs.awsMachineCidr.maskTooSmallSingleAz(AWS_MACHINE_CIDR_MAX_SINGLE_AZ),
          });
        }
      }

      if (selectedSubnets && selectedSubnets.length > 0) {
        for (const subnet of selectedSubnets) {
          if (
            CIDR_REGEXP.test(subnet.cidr_block) &&
            !containsCidr(value, getStartingIP(subnet.cidr_block))
          ) {
            const subnetLabel = subnet.name || subnet.subnet_id;
            return this.createError({
              message: msgs.subnetCidrs.machineDoesNotIncludeStartIp(
                getStartingIP(subnet.cidr_block),
                subnetLabel
              ),
            });
          }
        }
      }

      const overlapping = findOverlappingCidrFields(
        value,
        'network_machine_cidr',
        formData,
        msgs.disjointSubnets
      );
      if (overlapping.length > 0) {
        return this.createError({
          message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
        });
      }

      return true;
    }),

  network_service_cidr: yup
    .string()
    .optional()
    .meta({
      id: 'network_service_cidr',
      labelKey: 'networking.serviceCidrLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'text',
      advanced: true,
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('service-cidr', '', function (value) {
      if (!value) return true;
      const { msgs, selectedSubnets } = ctx(this);

      if (!isValidCidr(value)) {
        return this.createError({ message: msgs.cidr.invalidNotation(value) });
      }
      if (!isCidrSubnetAddress(value)) {
        return this.createError({ message: msgs.validateRange.notSubnetAddress });
      }

      const prefixLength = parseCIDRSubnetLength(value);
      if (prefixLength != null && prefixLength > SERVICE_CIDR_MAX) {
        const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
        return this.createError({
          message: msgs.serviceCidr.maskTooSmall(SERVICE_CIDR_MAX, maxServices),
        });
      }

      const parts = value.split('/');
      const maskBits = parseInt(parts[1], 10);
      if (maskBits > SERVICE_CIDR_MAX || maskBits < 1) {
        return this.createError({
          message: msgs.serviceCidr.subnetMaskBetweenOneAnd(SERVICE_CIDR_MAX),
        });
      }

      const formData = this.parent as Partial<ClusterFormData>;

      if (selectedSubnets && selectedSubnets.length > 0) {
        for (const subnet of selectedSubnets) {
          if (CIDR_REGEXP.test(subnet.cidr_block)) {
            const subnetLabel = subnet.name || subnet.subnet_id;
            if (containsCidr(value, getStartingIP(subnet.cidr_block))) {
              return this.createError({
                message: msgs.subnetCidrs.serviceIncludesStartIp(
                  getStartingIP(subnet.cidr_block),
                  subnetLabel
                ),
              });
            }
            if (overlapCidr(value, subnet.cidr_block)) {
              return this.createError({
                message: msgs.subnetCidrs.serviceOverlaps(subnetLabel, subnet.cidr_block),
              });
            }
          }
        }
      }

      const overlapping = findOverlappingCidrFields(
        value,
        'network_service_cidr',
        formData,
        msgs.disjointSubnets
      );
      if (overlapping.length > 0) {
        return this.createError({
          message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
        });
      }

      return true;
    }),

  network_pod_cidr: yup
    .string()
    .optional()
    .meta({
      id: 'network_pod_cidr',
      labelKey: 'networking.podCidrLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'text',
      advanced: true,
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('pod-cidr', '', function (value) {
      if (!value) return true;
      const { msgs, selectedSubnets } = ctx(this);

      if (!isValidCidr(value)) {
        return this.createError({ message: msgs.cidr.invalidNotation(value) });
      }
      if (!isCidrSubnetAddress(value)) {
        return this.createError({ message: msgs.validateRange.notSubnetAddress });
      }

      const formData = this.parent as Partial<ClusterFormData>;
      const prefixLength = parseCIDRSubnetLength(value);

      if (prefixLength != null) {
        if (prefixLength > POD_CIDR_MAX) {
          return this.createError({ message: msgs.podCidr.maskTooSmall(POD_CIDR_MAX) });
        }

        const hostPrefixLen = parseCIDRSubnetLength(formData.network_host_prefix) || 23;
        const maxPodIPs = 2 ** (32 - hostPrefixLen);
        const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
        if (maxPodNodes < POD_NODES_MIN) {
          return this.createError({ message: msgs.podCidr.notEnoughNodes(prefixLength) });
        }
      }

      if (selectedSubnets && selectedSubnets.length > 0) {
        for (const subnet of selectedSubnets) {
          if (CIDR_REGEXP.test(subnet.cidr_block)) {
            const subnetLabel = subnet.name || subnet.subnet_id;
            if (containsCidr(value, getStartingIP(subnet.cidr_block))) {
              return this.createError({
                message: msgs.subnetCidrs.podIncludesStartIp(
                  getStartingIP(subnet.cidr_block),
                  subnetLabel
                ),
              });
            }
            if (overlapCidr(value, subnet.cidr_block)) {
              return this.createError({
                message: msgs.subnetCidrs.podOverlaps(subnetLabel, subnet.cidr_block),
              });
            }
          }
        }
      }

      const overlapping = findOverlappingCidrFields(
        value,
        'network_pod_cidr',
        formData,
        msgs.disjointSubnets
      );
      if (overlapping.length > 0) {
        return this.createError({
          message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
        });
      }

      return true;
    }),

  network_host_prefix: yup
    .string()
    .optional()
    .meta({
      id: 'network_host_prefix',
      labelKey: 'networking.hostPrefixLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'text',
      advanced: true,
      noEditAfterSubmit: true,
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('host-prefix', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);

      if (!HOST_PREFIX_REGEXP.test(value)) {
        return this.createError({ message: msgs.hostPrefix.invalidMaskFormat(value) });
      }

      const prefixLength = parseCIDRSubnetLength(value);
      if (prefixLength != null) {
        if (prefixLength < HOST_PREFIX_MIN) {
          const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
          return this.createError({
            message: msgs.hostPrefix.maskTooLarge(HOST_PREFIX_MIN, maxPodIPs),
          });
        }
        if (prefixLength > HOST_PREFIX_MAX) {
          const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
          return this.createError({
            message: msgs.hostPrefix.maskTooSmall(HOST_PREFIX_MAX, maxPodIPs),
          });
        }
      }
      return true;
    }),

  configure_proxy: yup
    .boolean()
    .optional()
    .meta({
      id: 'configure_proxy',
      labelKey: 'networking.proxyCheckboxLabel',
      stepId: STEP_IDS.NETWORKING,
      fieldType: 'checkbox',
      advanced: true,
    } satisfies WizardFieldMeta),

  multi_az: yup
    .string()
    .optional()
    .meta({
      id: 'multi_az',
      labelKey: 'networking.multiAzLabel',
      stepId: STEP_IDS.NETWORKING,
    } satisfies WizardFieldMeta),

  hypershift: yup
    .string()
    .optional()
    .meta({
      id: 'hypershift',
      labelKey: 'networking.hypershiftLabel',
      stepId: STEP_IDS.NETWORKING,
    } satisfies WizardFieldMeta),

  // =========================================================================
  // Cluster-wide proxy
  // =========================================================================

  http_proxy_url: yup
    .string()
    .optional()
    .meta({
      id: 'http_proxy_url',
      labelKey: 'clusterWideProxy.httpLabel',
      stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
      fieldType: 'text',
    } satisfies WizardFieldMeta)
    .test('http-proxy-url', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      let parsed: URL;
      try {
        parsed = new URL(value);
      } catch {
        return this.createError({ message: msgs.url.invalid });
      }
      const scheme = parsed.protocol.slice(0, -1);
      if (scheme !== 'http') {
        return this.createError({ message: msgs.url.schemePrefix('http://') });
      }
      return true;
    }),

  https_proxy_url: yup
    .string()
    .optional()
    .meta({
      id: 'https_proxy_url',
      labelKey: 'clusterWideProxy.httpsLabel',
      stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
      fieldType: 'text',
    } satisfies WizardFieldMeta)
    .test('https-proxy-url', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      let parsed: URL;
      try {
        parsed = new URL(value);
      } catch {
        return this.createError({ message: msgs.url.invalid });
      }
      const scheme = parsed.protocol.slice(0, -1);
      if (!['http', 'https'].includes(scheme)) {
        return this.createError({ message: msgs.url.schemePrefix('http://, https://') });
      }
      return true;
    }),

  no_proxy_domains: yup
    .string()
    .optional()
    .meta({
      id: 'no_proxy_domains',
      labelKey: 'clusterWideProxy.noProxyLabel',
      stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
      fieldType: 'text',
    } satisfies WizardFieldMeta)
    .test('no-proxy-domains', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      const domains = stringToArray(value);
      if (domains && domains.length > 0) {
        const invalid = domains.filter((d) => !!d && !BASE_DOMAIN_REGEXP.test(d));
        if (invalid.length > 0) {
          return this.createError({
            message: msgs.noProxyDomains.invalidDomains(invalid.join(', '), invalid.length > 1),
          });
        }
      }
      return true;
    }),

  additional_trust_bundle: yup
    .string()
    .optional()
    .meta({
      id: 'additional_trust_bundle',
      labelKey: 'clusterWideProxy.trustBundleLabel',
      stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
      fieldType: 'textarea',
    } satisfies WizardFieldMeta)
    .test('trust-bundle', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);

      if (value.length > MAX_CA_SIZE_BYTES) {
        return this.createError({ message: msgs.ca.fileTooLarge });
      }

      const pemRegex =
        /-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/;
      if (!pemRegex.test(value)) {
        return this.createError({ message: msgs.ca.invalidPem });
      }
      return true;
    }),

  // =========================================================================
  // Encryption
  // =========================================================================

  encryption_keys: yup
    .string()
    .optional()
    .meta({
      id: 'encryption_keys',
      labelKey: 'encryption.keysLabel',
      stepId: STEP_IDS.ENCRYPTION,
      fieldType: 'radio',
      showInReview: true,
    } satisfies WizardFieldMeta),

  kms_key_arn: yup
    .string()
    .optional()
    .meta({
      id: 'kms_key_arn',
      labelKey: 'encryption.kmsKeyArnLabel',
      stepId: STEP_IDS.ENCRYPTION,
      fieldType: 'text',
      showInReview: true,
    } satisfies WizardFieldMeta)
    .test('kms-key-arn', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      if (/\s/.test(value)) {
        return this.createError({ message: msgs.kmsKeyArn.noWhitespace });
      }
      if (
        value.includes(':key/mrk-')
          ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
          : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
      ) {
        return this.createError({ message: msgs.kmsKeyArn.invalidArn });
      }
      const region = (this.parent as Partial<ClusterFormData>).region;
      const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
      if (kmsRegion !== region) {
        return this.createError({ message: msgs.kmsKeyArn.wrongRegion });
      }
      return true;
    }),

  etcd_encryption: yup
    .boolean()
    .optional()
    .meta({
      id: 'etcd_encryption',
      labelKey: 'encryption.etcdEncryptionLabel',
      stepId: STEP_IDS.ENCRYPTION,
      fieldType: 'checkbox',
      showInReview: true,
      reviewLabel: 'Additional etcd encryption',
    } satisfies WizardFieldMeta),

  etcd_key_arn: yup
    .string()
    .optional()
    .meta({
      id: 'etcd_key_arn',
      labelKey: 'encryption.etcdKeyArnLabel',
      stepId: STEP_IDS.ENCRYPTION,
      fieldType: 'text',
    } satisfies WizardFieldMeta)
    .test('etcd-key-arn', '', function (value) {
      if (!value) return true;
      const { msgs } = ctx(this);
      if (/\s/.test(value)) {
        return this.createError({ message: msgs.kmsKeyArn.noWhitespace });
      }
      if (
        value.includes(':key/mrk-')
          ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
          : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
      ) {
        return this.createError({ message: msgs.kmsKeyArn.invalidArn });
      }
      const region = (this.parent as Partial<ClusterFormData>).region;
      const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
      if (kmsRegion !== region) {
        return this.createError({ message: msgs.kmsKeyArn.wrongRegion });
      }
      return true;
    }),

  // =========================================================================
  // Cluster updates
  // =========================================================================

  upgrade_policy: yup
    .string()
    .optional()
    .meta({
      id: 'upgrade_policy',
      labelKey: 'clusterUpdates.upgradePolicyLabel',
      stepId: STEP_IDS.CLUSTER_UPDATES,
      fieldType: 'radio',
      showInReview: true,
    } satisfies WizardFieldMeta),

  upgrade_schedule: yup
    .string()
    .optional()
    .meta({
      id: 'upgrade_schedule',
      labelKey: 'clusterUpdates.upgradeScheduleLabel',
      stepId: STEP_IDS.CLUSTER_UPDATES,
    } satisfies WizardFieldMeta),
}) as yup.ObjectSchema<Partial<ClusterFormData>>;

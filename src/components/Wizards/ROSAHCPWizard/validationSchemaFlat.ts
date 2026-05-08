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
} from './constants';
import { parseCIDRSubnetLength, stringToArray } from './helpers';
import type { ClusterFormData, CIDRSubnet } from '../types';
import type { RosaHcpWizardValidatorStrings } from './stringsProvider/rosaHcpWizardStrings';

const LOWERCASE_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';

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
// Flat schema — runtime values come from `this.options.context`
// ---------------------------------------------------------------------------

/**
 * A single, statically-defined Yup schema for `ClusterFormData`.
 *
 * Runtime-dependent values (i18n messages, version-dependent limits,
 * selected subnets, async uniqueness callback) are read from the
 * validation context at execution time:
 *
 * ```ts
 * clusterValidationSchema.validate(formData, { context: myContext });
 * ```
 *
 * @see {@link ValidationSchemaContext} for the shape of the context object.
 */
export const clusterValidationSchema = yup.object({
  // -- Details ---------------------------------------------------------------

  name: yup
    .string()
    .required()
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

  cluster_version: yup.string().required(),
  associated_aws_id: yup.string().required(),
  billing_account_id: yup.string().required(),
  region: yup.string().required(),

  // -- Roles & policies ------------------------------------------------------

  installer_role_arn: yup.string().required(),
  support_role_arn: yup.string().required(),
  worker_role_arn: yup.string().required(),
  byo_oidc_config_id: yup.string().required(),

  custom_operator_roles_prefix: yup
    .string()
    .required()
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

  // -- Machine pools ---------------------------------------------------------

  selected_vpc: yup.mixed().required(),
  machine_pools_subnets: yup.array().required(),
  machine_type: yup.string().required(),
  autoscaling: yup.boolean().optional(),

  nodes_compute: yup
    .number()
    .optional()
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

  imds: yup.string().optional(),

  // -- Networking ------------------------------------------------------------

  cluster_privacy: yup.string().required(),
  cluster_privacy_public_subnet_id: yup.string().optional(),
  cidr_default: yup.boolean().optional(),

  network_machine_cidr: yup
    .string()
    .optional()
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

  configure_proxy: yup.boolean().optional(),
  multi_az: yup.string().optional(),
  hypershift: yup.string().optional(),

  // -- Cluster-wide proxy ----------------------------------------------------

  http_proxy_url: yup
    .string()
    .optional()
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

  // -- Encryption ------------------------------------------------------------

  encryption_keys: yup.string().optional(),

  kms_key_arn: yup
    .string()
    .optional()
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

  etcd_encryption: yup.boolean().optional(),

  etcd_key_arn: yup
    .string()
    .optional()
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

  // -- Cluster updates -------------------------------------------------------

  upgrade_policy: yup.string().optional(),
  upgrade_schedule: yup.string().optional(),
}) as yup.ObjectSchema<Partial<ClusterFormData>>;

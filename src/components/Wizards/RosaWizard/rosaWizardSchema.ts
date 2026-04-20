import { z } from 'zod';

import {
  AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX,
  AWS_KMS_SERVICE_ACCOUNT_REGEX,
  AWS_MACHINE_CIDR_MIN,
  BASE_DOMAIN_REGEXP,
  CIDR_REGEXP,
  DNS_LABEL_REGEXP,
  HOST_PREFIX_MAX,
  HOST_PREFIX_MIN,
  HOST_PREFIX_REGEXP,
  MAX_CA_SIZE_BYTES,
  MAX_CLUSTER_NAME_LENGTH,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
} from './constants';
import { parseCIDRSubnetLength, stringToArray } from './helpers';
import {
  defaultRosaWizardValidatorStrings,
  type RosaWizardValidatorStrings,
} from './rosaWizardStrings';
import {
  ClusterEncryptionKeys,
  type RosaWizardFormData,
} from '../types';

const LOWERCASE_ALPHANUM = 'abcdefghijklmnopqrstuvwxyz1234567890';

/**
 * Builds the Zod validation schema for the entire ROSA wizard form.
 *
 * All validation rules — required checks, format checks, and cross-field
 * dependencies — live inside a single `.superRefine()` block on the cluster
 * object so that Zod collects every error in one pass (matching the original
 * Yup `abortEarly: false` behaviour).
 *
 * @param msgs - Localised validation error messages.
 * @param requiredMsg - "This field is required" message used for required fields.
 */
export function buildClusterFormSchema(
  msgs: RosaWizardValidatorStrings = defaultRosaWizardValidatorStrings,
  requiredMsg = 'This field is required',
) {
  const cn = msgs.clusterName;
  const op = msgs.operatorRolesPrefix;
  const kmsMsg = msgs.kmsKeyArn;
  const np = msgs.noProxyDomains;
  const ca = msgs.ca;
  const urlMsg = msgs.url;
  const hp = msgs.hostPrefix;
  const cidrMsgs = msgs.cidr;
  const vr = msgs.validateRange;
  const am = msgs.awsMachineCidr;
  const sc = msgs.serviceCidr;
  const pc = msgs.podCidr;
  const rep = msgs.replicas;
  const rd = msgs.rootDisk;
  const sg = msgs.securityGroups;

  const clusterSchema = z
    .object({
      /* Details */
      name: z.string().optional(),
      cluster_version: z.string().optional(),
      associated_aws_id: z.string().optional(),
      billing_account_id: z.string().optional(),
      region: z.string().optional(),

      /* Roles & policies */
      installer_role_arn: z.string().optional(),
      support_role_arn: z.string().optional(),
      worker_role_arn: z.string().optional(),
      byo_oidc_config_id: z.string().optional(),
      custom_operator_roles_prefix: z.string().optional(),

      /* Machine pools */
      selected_vpc: z.any(),
      machine_pools_subnets: z
        .array(z.object({ machine_pool_subnet: z.string().optional() }))
        .optional(),
      machine_type: z.string().optional(),
      autoscaling: z.boolean().optional(),
      nodes_compute: z.number().optional(),
      min_replicas: z.number().optional(),
      max_replicas: z.number().optional(),
      compute_root_volume: z.number().optional(),
      security_groups_worker: z.array(z.string()).optional(),
      imds: z.string().optional(),

      /* Networking */
      cluster_privacy: z.string().optional(),
      cluster_privacy_public_subnet_id: z.string().optional(),
      cidr_default: z.boolean().optional(),
      network_machine_cidr: z.string().optional(),
      network_service_cidr: z.string().optional(),
      network_pod_cidr: z.string().optional(),
      network_host_prefix: z.string().optional(),
      configure_proxy: z.boolean().optional(),
      multi_az: z.string().optional(),
      hypershift: z.string().optional(),

      /* Proxy */
      http_proxy_url: z.string().optional(),
      https_proxy_url: z.string().optional(),
      no_proxy_domains: z.string().optional(),
      additional_trust_bundle: z.string().optional(),

      /* Encryption */
      encryption_keys: z.string().optional(),
      kms_key_arn: z.string().optional(),
      etcd_encryption: z.boolean().optional(),
      etcd_key_arn: z.string().optional(),

      /* Cluster updates */
      upgrade_policy: z.string().optional(),
      upgrade_schedule: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const issue = (path: string, message: string): void => {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
      };

      const requireString = (path: string, value: string | undefined): boolean => {
        if (!value) {
          issue(path, requiredMsg);
          return false;
        }
        return true;
      };

      /* ------------------------------------------------------------------ */
      /*  Details                                                           */
      /* ------------------------------------------------------------------ */

      if (requireString('name', data.name)) {
        const name = data.name!;
        if (name.length > MAX_CLUSTER_NAME_LENGTH) issue('name', cn.maxLength);
        if (![...name].every((c) => LOWERCASE_ALPHANUM.includes(c) || c === '-' || c === '.'))
          issue('name', cn.invalidChars);
        if (!LOWERCASE_ALPHANUM.includes(name[0])) issue('name', cn.mustStartAlphanumeric);
        if (/^[0-9]/.test(name[0])) issue('name', cn.mustNotStartNumber);
        if (!LOWERCASE_ALPHANUM.includes(name[name.length - 1]))
          issue('name', cn.mustEndAlphanumeric);
      }

      requireString('cluster_version', data.cluster_version);
      requireString('associated_aws_id', data.associated_aws_id);
      requireString('billing_account_id', data.billing_account_id);
      requireString('region', data.region);

      /* ------------------------------------------------------------------ */
      /*  Roles & policies                                                  */
      /* ------------------------------------------------------------------ */

      requireString('installer_role_arn', data.installer_role_arn);
      requireString('support_role_arn', data.support_role_arn);
      requireString('worker_role_arn', data.worker_role_arn);
      requireString('byo_oidc_config_id', data.byo_oidc_config_id);

      if (requireString('custom_operator_roles_prefix', data.custom_operator_roles_prefix)) {
        const prefix = data.custom_operator_roles_prefix!;
        if (!DNS_LABEL_REGEXP.test(prefix))
          issue('custom_operator_roles_prefix', op.invalidFormat(op.fieldLabel, ''));
        if (prefix.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH)
          issue(
            'custom_operator_roles_prefix',
            op.tooLong(op.fieldLabel, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH),
          );
      }

      /* ------------------------------------------------------------------ */
      /*  Machine pools                                                     */
      /* ------------------------------------------------------------------ */

      if (data.selected_vpc == null) issue('selected_vpc', requiredMsg);

      if (data.machine_pools_subnets) {
        if (data.machine_pools_subnets.length < 1) {
          issue('machine_pools_subnets', 'At least one machine pool subnet is required');
        }
        for (let i = 0; i < data.machine_pools_subnets.length; i++) {
          if (!data.machine_pools_subnets[i].machine_pool_subnet) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['machine_pools_subnets', i, 'machine_pool_subnet'],
              message: requiredMsg,
            });
          }
        }
      }

      requireString('machine_type', data.machine_type);

      /* -- Autoscaling -- */
      if (!data.autoscaling) {
        if (data.nodes_compute == null) {
          issue('nodes_compute', requiredMsg);
        } else {
          if (!Number.isInteger(data.nodes_compute)) issue('nodes_compute', rep.notInteger);
          if (data.nodes_compute <= 0) issue('nodes_compute', rep.notPositive);
        }
      } else {
        if (data.min_replicas == null) {
          issue('min_replicas', requiredMsg);
        } else {
          if (!Number.isInteger(data.min_replicas)) issue('min_replicas', rep.notInteger);
          if (data.min_replicas <= 0) issue('min_replicas', rep.notPositive);
          if (data.min_replicas > 500) issue('min_replicas', rep.maxNodes(500));
          if (data.max_replicas != null && data.min_replicas > data.max_replicas)
            issue('min_replicas', rep.minGreaterThanMax);
        }
        if (data.max_replicas == null) {
          issue('max_replicas', requiredMsg);
        } else {
          if (!Number.isInteger(data.max_replicas)) issue('max_replicas', rep.notInteger);
          if (data.max_replicas <= 0) issue('max_replicas', rep.notPositive);
          if (data.min_replicas != null && data.max_replicas < data.min_replicas)
            issue('max_replicas', rep.maxLessThanMin);
        }
      }

      /* -- Root volume -- */
      if (data.compute_root_volume != null) {
        if (!Number.isInteger(data.compute_root_volume))
          issue('compute_root_volume', rd.notInteger);
        if (data.compute_root_volume < 75) issue('compute_root_volume', rd.tooSmall);
        if (data.compute_root_volume > 16384)
          issue('compute_root_volume', rd.tooLargeNewOpenshift);
      }

      /* -- Security groups -- */
      if (data.security_groups_worker && data.security_groups_worker.length > 10) {
        issue('security_groups_worker', sg.maxExceeded(10));
      }

      /* ------------------------------------------------------------------ */
      /*  Networking                                                        */
      /* ------------------------------------------------------------------ */

      validateCidr(data.network_machine_cidr, 'network_machine_cidr', ctx, cidrMsgs, vr, (prefix) => {
        if (prefix < AWS_MACHINE_CIDR_MIN)
          issue('network_machine_cidr', am.maskTooLarge(AWS_MACHINE_CIDR_MIN));
      });

      validateCidr(data.network_service_cidr, 'network_service_cidr', ctx, cidrMsgs, vr, (prefix) => {
        if (prefix > SERVICE_CIDR_MAX)
          issue(
            'network_service_cidr',
            sc.maskTooSmall(SERVICE_CIDR_MAX, 2 ** (32 - SERVICE_CIDR_MAX) - 2),
          );
      });

      validateCidr(data.network_pod_cidr, 'network_pod_cidr', ctx, cidrMsgs, vr, (prefix) => {
        if (prefix > POD_CIDR_MAX) issue('network_pod_cidr', pc.maskTooSmall(POD_CIDR_MAX));
      });

      /* Pod CIDR capacity (cross-field with network_host_prefix) */
      if (data.network_pod_cidr && CIDR_REGEXP.test(data.network_pod_cidr)) {
        const podPrefix = parseCIDRSubnetLength(data.network_pod_cidr);
        if (podPrefix != null) {
          const hostPrefixLen = parseCIDRSubnetLength(data.network_host_prefix) ?? 23;
          const maxPodIPs = 2 ** (32 - hostPrefixLen);
          const maxPodNodes = Math.floor(2 ** (32 - podPrefix) / maxPodIPs);
          if (maxPodNodes < POD_NODES_MIN) issue('network_pod_cidr', pc.notEnoughNodes(podPrefix));
        }
      }

      /* Host prefix */
      if (data.network_host_prefix) {
        if (!HOST_PREFIX_REGEXP.test(data.network_host_prefix)) {
          issue('network_host_prefix', hp.invalidMaskFormat(data.network_host_prefix));
        } else {
          const prefix = parseCIDRSubnetLength(data.network_host_prefix);
          if (prefix != null && prefix < HOST_PREFIX_MIN)
            issue(
              'network_host_prefix',
              hp.maskTooLarge(HOST_PREFIX_MIN, 2 ** (32 - HOST_PREFIX_MIN) - 2),
            );
          if (prefix != null && prefix > HOST_PREFIX_MAX)
            issue(
              'network_host_prefix',
              hp.maskTooSmall(HOST_PREFIX_MAX, 2 ** (32 - HOST_PREFIX_MAX) - 2),
            );
        }
      }

      /* ------------------------------------------------------------------ */
      /*  Proxy                                                             */
      /* ------------------------------------------------------------------ */

      if (data.http_proxy_url && !isValidUrl(data.http_proxy_url, ['http']))
        issue('http_proxy_url', urlMsg.invalid);
      if (data.https_proxy_url && !isValidUrl(data.https_proxy_url, ['http', 'https']))
        issue('https_proxy_url', urlMsg.invalid);

      if (data.configure_proxy) {
        if (!data.http_proxy_url && !data.https_proxy_url && !data.additional_trust_bundle) {
          issue('http_proxy_url', msgs.proxyConfigureAtLeastOne);
          issue('https_proxy_url', msgs.proxyConfigureAtLeastOne);
          issue('additional_trust_bundle', msgs.proxyConfigureAtLeastOne);
        }
      }

      if (data.no_proxy_domains) {
        const domains = stringToArray(data.no_proxy_domains);
        if (domains && domains.length > 0) {
          const invalid = domains.filter((d) => !!d && !BASE_DOMAIN_REGEXP.test(d));
          if (invalid.length > 0)
            issue('no_proxy_domains', np.invalidDomains(invalid.join(', '), invalid.length > 1));
        }
      }

      if (data.additional_trust_bundle) {
        if (data.additional_trust_bundle.length > MAX_CA_SIZE_BYTES)
          issue('additional_trust_bundle', ca.fileTooLarge);
        if (
          !/-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/.test(
            data.additional_trust_bundle,
          )
        )
          issue('additional_trust_bundle', ca.invalidPem);
      }

      /* ------------------------------------------------------------------ */
      /*  Encryption                                                        */
      /* ------------------------------------------------------------------ */

      if (data.encryption_keys === ClusterEncryptionKeys.custom)
        validateKmsArn(data.kms_key_arn, 'kms_key_arn', data.region, ctx, kmsMsg);
      if (data.etcd_encryption)
        validateKmsArn(data.etcd_key_arn, 'etcd_key_arn', data.region, ctx, kmsMsg);
    });

  return z.object({
    cluster: clusterSchema,
  });
}

/** Pre-built schema with default English messages. */
export const rosaWizardSchema = buildClusterFormSchema();

/**
 * Form-level validator function compatible with TanStack Form v1.
 * Runs the full Zod schema against the form values and maps errors
 * to individual field paths via `GlobalFormValidationError`.
 */
export function validateFormWithSchema({
  value,
}: {
  value: RosaWizardFormData;
}): { fields: Partial<Record<string, string>> } | undefined {
  const result = rosaWizardSchema.safeParse(value);
  if (result.success) return undefined;

  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = zodPathToFieldPath(issue.path);
    if (path && !fields[path]) {
      fields[path] = issue.message;
    }
  }
  return Object.keys(fields).length > 0 ? { fields } : undefined;
}

/* ---------- internal helpers ---------- */

/**
 * Converts a Zod issue path array to a dot/bracket field path string
 * compatible with TanStack Form field naming (e.g. `cluster.items[0].name`).
 */
function zodPathToFieldPath(segments: readonly PropertyKey[]): string {
  return segments
    .map((segment, i) => {
      if (typeof segment === 'number') return `[${segment}]`;
      const str = String(segment);
      return i === 0 ? str : `.${str}`;
    })
    .join('');
}

/**
 * Checks that the CIDR host portion equals the masked prefix
 * (i.e. the value is an actual subnet address, not an arbitrary IP).
 */
function isSubnetAddress(value: string): boolean {
  const parts = value.split('/');
  const binaryStr = parts[0]
    .split('.')
    .map((octet) => Number(octet).toString(2).padStart(8, '0'))
    .join('');
  const maskBits = parseInt(parts[1], 10);
  const masked = binaryStr.slice(0, maskBits).padEnd(32, '0');
  return masked === binaryStr;
}

/** Validates whether `value` is a parseable URL with one of the allowed schemes. */
function isValidUrl(value: string, protocols: string[]): boolean {
  try {
    const parsed = new URL(value);
    const scheme = parsed.protocol.slice(0, -1);
    return protocols.includes(scheme);
  } catch {
    return false;
  }
}

/** Shared CIDR format + subnet-address validation used by machine/service/pod CIDR fields. */
function validateCidr(
  value: string | undefined,
  path: string,
  ctx: z.RefinementCtx,
  cidrMsgs: { invalidNotation: (v: string) => string },
  vr: { notSubnetAddress: string },
  prefixCheck?: (prefix: number) => void,
): void {
  if (!value) return;
  if (!CIDR_REGEXP.test(value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: cidrMsgs.invalidNotation(value) });
    return;
  }
  if (!isSubnetAddress(value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: vr.notSubnetAddress });
  }
  const prefix = parseCIDRSubnetLength(value);
  if (prefix != null && prefixCheck) prefixCheck(prefix);
}

/** Shared KMS ARN validation used by both kms_key_arn and etcd_key_arn. */
function validateKmsArn(
  value: string | undefined,
  path: string,
  region: string | undefined,
  ctx: z.RefinementCtx,
  kmsMsg: { required: string; noWhitespace: string; invalidArn: string; wrongRegion: string },
): void {
  if (!value) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: kmsMsg.required });
    return;
  }
  if (/\s/.test(value))
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: kmsMsg.noWhitespace });

  const isMultiRegion = value.includes(':key/mrk-');
  const arnValid = isMultiRegion
    ? AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
    : AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value);
  if (!arnValid)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: kmsMsg.invalidArn });

  const arnRegion = value.split('kms:')?.pop()?.split(':')[0];
  if (arnRegion !== region)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: kmsMsg.wrongRegion });
}

/* ---------- per-field helper for wizard integration ---------- */

/**
 * Validates a single field path against the Zod schema.
 * Returns the first error message string, or `undefined` if the field is valid.
 */
export function validateField(
  schema: z.ZodType,
  fieldPath: string,
  value: unknown,
  context?: Record<string, unknown>,
): string | undefined {
  const result = schema.safeParse({
    cluster: { ...context, [fieldPath.replace('cluster.', '')]: value },
  });
  if (result.success) return undefined;
  const matched = result.error.issues.find(
    (i) => zodPathToFieldPath(i.path as (string | number)[]) === fieldPath,
  );
  return matched?.message;
}

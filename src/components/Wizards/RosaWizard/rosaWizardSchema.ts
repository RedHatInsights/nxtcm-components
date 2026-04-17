import * as yup from 'yup';
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
  ClusterNetwork,
  ClusterUpgrade,
  type RosaWizardFormData,
} from '../types';

const LOWERCASE_ALPHANUM = 'abcdefghijklmnopqrstuvwxyz1234567890';

/**
 * Builds the Yup validation schema for the entire ROSA wizard form.
 * Accepts an optional validator-strings bundle so that every error message
 * matches the host application's i18n. Falls back to the built-in defaults.
 *
 * @param msgs - Localised validation error messages.
 * @param requiredMsg - "This field is required" message used for required fields.
 */
export function buildClusterFormSchema(
  msgs: RosaWizardValidatorStrings = defaultRosaWizardValidatorStrings,
  requiredMsg = 'This field is required'
): yup.ObjectSchema<RosaWizardFormData> {
  const cn = msgs.clusterName;
  const op = msgs.operatorRolesPrefix;
  const kms = msgs.kmsKeyArn;
  const np = msgs.noProxyDomains;
  const ca = msgs.ca;
  const url = msgs.url;
  const hp = msgs.hostPrefix;
  const cidrMsgs = msgs.cidr;
  const vr = msgs.validateRange;
  const am = msgs.awsMachineCidr;
  const sc = msgs.serviceCidr;
  const pc = msgs.podCidr;
  const rep = msgs.replicas;
  const rd = msgs.rootDisk;
  const sg = msgs.securityGroups;

  const clusterSchema = yup.object({
    /* ------------------------------------------------------------------ */
    /*  Details                                                           */
    /* ------------------------------------------------------------------ */

    name: yup
      .string()
      .required(requiredMsg)
      .test('max-length', cn.maxLength, (v) => !v || v.length <= MAX_CLUSTER_NAME_LENGTH)
      .test('valid-chars', cn.invalidChars, (v) => {
        if (!v) return true;
        return [...v].every((c) => LOWERCASE_ALPHANUM.includes(c) || c === '-' || c === '.');
      })
      .test(
        'starts-alpha',
        cn.mustStartAlphanumeric,
        (v) => !v || LOWERCASE_ALPHANUM.includes(v[0])
      )
      .test('no-digit-start', cn.mustNotStartNumber, (v) => !v || !/^[0-9]/.test(v[0]))
      .test(
        'ends-alphanum',
        cn.mustEndAlphanumeric,
        (v) => !v || LOWERCASE_ALPHANUM.includes(v[v.length - 1])
      ),

    cluster_version: yup.string().required(requiredMsg),

    associated_aws_id: yup.string().required(requiredMsg),

    billing_account_id: yup.string().required(requiredMsg),

    region: yup.string().required(requiredMsg),

    /* ------------------------------------------------------------------ */
    /*  Roles & policies                                                  */
    /* ------------------------------------------------------------------ */

    installer_role_arn: yup.string().required(requiredMsg),

    support_role_arn: yup.string().required(requiredMsg),

    worker_role_arn: yup.string().required(requiredMsg),

    byo_oidc_config_id: yup.string().required(requiredMsg),

    custom_operator_roles_prefix: yup
      .string()
      .required(requiredMsg)
      .test(
        'dns-label',
        () => op.invalidFormat(op.fieldLabel, ''),
        (v) => {
          if (!v) return true;
          return DNS_LABEL_REGEXP.test(v);
        }
      )
      .test(
        'max-prefix-length',
        () => op.tooLong(op.fieldLabel, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH),
        (v) => !v || v.length <= MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH
      ),

    /* ------------------------------------------------------------------ */
    /*  Machine pools                                                     */
    /* ------------------------------------------------------------------ */

    selected_vpc: yup.mixed().required(requiredMsg),

    machine_pools_subnets: yup
      .array()
      .of(
        yup.object({
          machine_pool_subnet: yup.string().required(requiredMsg),
        })
      )
      .min(1, 'At least one machine pool subnet is required'),

    machine_type: yup.string().required(requiredMsg),

    autoscaling: yup.boolean().optional(),

    nodes_compute: yup
      .number()
      .optional()
      .when('autoscaling', {
        is: (v: unknown) => !v,
        then: (schema) =>
          schema.integer(rep.notInteger).positive(rep.notPositive).required(requiredMsg),
        otherwise: (schema) => schema.strip(),
      }),

    min_replicas: yup
      .number()
      .optional()
      .when('autoscaling', {
        is: true,
        then: (schema) =>
          schema
            .integer(rep.notInteger)
            .positive(rep.notPositive)
            .max(500, rep.maxNodes(500))
            .required(requiredMsg)
            .test('min-le-max', rep.minGreaterThanMax, function (v) {
              const max = this.parent.max_replicas;
              if (v == null || max == null) return true;
              return v <= max;
            }),
        otherwise: (schema) => schema.strip(),
      }),

    max_replicas: yup
      .number()
      .optional()
      .when('autoscaling', {
        is: true,
        then: (schema) =>
          schema
            .integer(rep.notInteger)
            .positive(rep.notPositive)
            .required(requiredMsg)
            .test('max-ge-min', rep.maxLessThanMin, function (v) {
              const min = this.parent.min_replicas;
              if (v == null || min == null) return true;
              return v >= min;
            }),
        otherwise: (schema) => schema.strip(),
      }),

    compute_root_volume: yup
      .number()
      .optional()
      .integer(rd.notInteger)
      .min(75, rd.tooSmall)
      .test('root-disk-max', rd.tooLargeNewOpenshift, function (v) {
        if (v == null) return true;
        return v <= 16384;
      }),

    security_groups_worker: yup
      .array()
      .of(yup.string().required())
      .optional()
      .max(10, sg.maxExceeded(10)),

    imds: yup.string().optional().oneOf(['imdsv1andimdsv2', 'imdsv2only', undefined]),

    /* ------------------------------------------------------------------ */
    /*  Networking                                                        */
    /* ------------------------------------------------------------------ */

    cluster_privacy: yup
      .string()
      .optional()
      .oneOf([ClusterNetwork.external, ClusterNetwork.internal]),

    cluster_privacy_public_subnet_id: yup.string().optional(),

    cidr_default: yup.boolean().optional(),

    network_machine_cidr: yup
      .string()
      .optional()
      .test(
        'cidr-format',
        (v) => cidrMsgs.invalidNotation(v ?? ''),
        (v) => {
          if (!v) return true;
          return CIDR_REGEXP.test(v);
        }
      )
      .test('subnet-address', vr.notSubnetAddress, (v) => {
        if (!v || !CIDR_REGEXP.test(v)) return true;
        return isSubnetAddress(v);
      })
      .test(
        'aws-machine-mask',
        (_v) => am.maskTooLarge(AWS_MACHINE_CIDR_MIN),
        (v) => {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          return prefix == null || prefix >= AWS_MACHINE_CIDR_MIN;
        }
      ),

    network_service_cidr: yup
      .string()
      .optional()
      .test(
        'cidr-format',
        (v) => cidrMsgs.invalidNotation(v ?? ''),
        (v) => {
          if (!v) return true;
          return CIDR_REGEXP.test(v);
        }
      )
      .test('subnet-address', vr.notSubnetAddress, (v) => {
        if (!v || !CIDR_REGEXP.test(v)) return true;
        return isSubnetAddress(v);
      })
      .test(
        'service-cidr-max',
        () => sc.maskTooSmall(SERVICE_CIDR_MAX, 2 ** (32 - SERVICE_CIDR_MAX) - 2),
        (v) => {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          return prefix == null || prefix <= SERVICE_CIDR_MAX;
        }
      ),

    network_pod_cidr: yup
      .string()
      .optional()
      .test(
        'cidr-format',
        (v) => cidrMsgs.invalidNotation(v ?? ''),
        (v) => {
          if (!v) return true;
          return CIDR_REGEXP.test(v);
        }
      )
      .test('subnet-address', vr.notSubnetAddress, (v) => {
        if (!v || !CIDR_REGEXP.test(v)) return true;
        return isSubnetAddress(v);
      })
      .test(
        'pod-cidr-max',
        () => pc.maskTooSmall(POD_CIDR_MAX),
        (v) => {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          return prefix == null || prefix <= POD_CIDR_MAX;
        }
      )
      .test(
        'pod-capacity',
        (v) => pc.notEnoughNodes(parseCIDRSubnetLength(v ?? '') ?? 0),
        function (v) {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          if (prefix == null) return true;
          const hostPrefixLen = parseCIDRSubnetLength(this.parent.network_host_prefix) ?? 23;
          const maxPodIPs = 2 ** (32 - hostPrefixLen);
          const maxPodNodes = Math.floor(2 ** (32 - prefix) / maxPodIPs);
          return maxPodNodes >= POD_NODES_MIN;
        }
      ),

    network_host_prefix: yup
      .string()
      .optional()
      .test(
        'host-prefix-format',
        (v) => hp.invalidMaskFormat(v ?? ''),
        (v) => {
          if (!v) return true;
          return HOST_PREFIX_REGEXP.test(v);
        }
      )
      .test(
        'host-prefix-min',
        () => hp.maskTooLarge(HOST_PREFIX_MIN, 2 ** (32 - HOST_PREFIX_MIN) - 2),
        (v) => {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          return prefix == null || prefix >= HOST_PREFIX_MIN;
        }
      )
      .test(
        'host-prefix-max',
        () => hp.maskTooSmall(HOST_PREFIX_MAX, 2 ** (32 - HOST_PREFIX_MAX) - 2),
        (v) => {
          if (!v) return true;
          const prefix = parseCIDRSubnetLength(v);
          return prefix == null || prefix <= HOST_PREFIX_MAX;
        }
      ),

    configure_proxy: yup.boolean().optional(),
    multi_az: yup.string().optional(),
    hypershift: yup.string().optional(),

    /* ------------------------------------------------------------------ */
    /*  Proxy                                                             */
    /* ------------------------------------------------------------------ */

    http_proxy_url: yup
      .string()
      .optional()
      .test('valid-url-http', url.invalid, (v) => {
        if (!v) return true;
        return isValidUrl(v, ['http']);
      })
      .when('configure_proxy', {
        is: true,
        then: (schema) =>
          schema.test('at-least-one-proxy', msgs.proxyConfigureAtLeastOne, function (v) {
            return !!v || !!this.parent.https_proxy_url || !!this.parent.additional_trust_bundle;
          }),
      }),

    https_proxy_url: yup
      .string()
      .optional()
      .test('valid-url-https', url.invalid, (v) => {
        if (!v) return true;
        return isValidUrl(v, ['http', 'https']);
      })
      .when('configure_proxy', {
        is: true,
        then: (schema) =>
          schema.test('at-least-one-proxy', msgs.proxyConfigureAtLeastOne, function (v) {
            return !!v || !!this.parent.http_proxy_url || !!this.parent.additional_trust_bundle;
          }),
      }),

    no_proxy_domains: yup
      .string()
      .optional()
      .test('valid-domains', '', function (v) {
        const domains = stringToArray(v);
        if (!domains || domains.length === 0) return true;
        const invalid = domains.filter((d) => !!d && !BASE_DOMAIN_REGEXP.test(d));
        if (invalid.length > 0) {
          return this.createError({
            message: np.invalidDomains(invalid.join(', '), invalid.length > 1),
          });
        }
        return true;
      }),

    additional_trust_bundle: yup
      .string()
      .optional()
      .test('ca-size', ca.fileTooLarge, (v) => !v || v.length <= MAX_CA_SIZE_BYTES)
      .test(
        'ca-pem',
        ca.invalidPem,
        (v) =>
          !v ||
          /-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/.test(
            v
          )
      )
      .when('configure_proxy', {
        is: true,
        then: (schema) =>
          schema.test('at-least-one-proxy', msgs.proxyConfigureAtLeastOne, function (v) {
            return !!v || !!this.parent.http_proxy_url || !!this.parent.https_proxy_url;
          }),
      }),

    /* ------------------------------------------------------------------ */
    /*  Encryption                                                        */
    /* ------------------------------------------------------------------ */

    encryption_keys: yup
      .string()
      .optional()
      .oneOf([ClusterEncryptionKeys.default, ClusterEncryptionKeys.custom]),

    kms_key_arn: yup
      .string()
      .optional()
      .when('encryption_keys', {
        is: ClusterEncryptionKeys.custom,
        then: (schema) =>
          schema
            .required(kms.required)
            .test('no-whitespace', kms.noWhitespace, (v) => !v || !/\s/.test(v))
            .test('arn-format', kms.invalidArn, (v) => {
              if (!v) return true;
              return v.includes(':key/mrk-')
                ? AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(v)
                : AWS_KMS_SERVICE_ACCOUNT_REGEX.test(v);
            })
            .test('arn-region', kms.wrongRegion, function (v) {
              if (!v) return true;
              const arnRegion = v.split('kms:')?.pop()?.split(':')[0];
              return arnRegion === this.parent.region;
            }),
      }),

    etcd_encryption: yup.boolean().optional(),

    etcd_key_arn: yup
      .string()
      .optional()
      .when('etcd_encryption', {
        is: true,
        then: (schema) =>
          schema
            .required(kms.required)
            .test('no-whitespace', kms.noWhitespace, (v) => !v || !/\s/.test(v))
            .test('arn-format', kms.invalidArn, (v) => {
              if (!v) return true;
              return v.includes(':key/mrk-')
                ? AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(v)
                : AWS_KMS_SERVICE_ACCOUNT_REGEX.test(v);
            })
            .test('arn-region', kms.wrongRegion, function (v) {
              if (!v) return true;
              const arnRegion = v.split('kms:')?.pop()?.split(':')[0];
              return arnRegion === this.parent.region;
            }),
      }),

    /* ------------------------------------------------------------------ */
    /*  Cluster updates                                                   */
    /* ------------------------------------------------------------------ */

    upgrade_policy: yup
      .string()
      .optional()
      .oneOf([ClusterUpgrade.automatic, ClusterUpgrade.manual]),

    upgrade_schedule: yup.string().optional(),
  });

  return yup.object({
    cluster: clusterSchema,
  }) as unknown as yup.ObjectSchema<RosaWizardFormData>;
}

/** Pre-built schema with default English messages. */
export const rosaWizardSchema = buildClusterFormSchema();

/**
 * Form-level validator function compatible with TanStack Form v1.
 * Runs the full Yup schema against the form values and maps errors
 * to individual field paths via `GlobalFormValidationError`.
 */
export function validateFormWithSchema({
  value,
}: {
  value: RosaWizardFormData;
}): { fields: Partial<Record<string, string>> } | undefined {
  try {
    rosaWizardSchema.validateSync(value, { abortEarly: false });
    return undefined;
  } catch (err) {
    if (err instanceof yup.ValidationError && err.inner.length > 0) {
      const fields: Record<string, string> = {};
      for (const inner of err.inner) {
        if (inner.path && !fields[inner.path]) {
          fields[inner.path] = inner.message;
        }
      }
      return { fields };
    }
    return undefined;
  }
}

/* ---------- internal helpers ---------- */

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

/* ---------- per-field helper for wizard integration ---------- */

/**
 * Validates a single field path against the Yup schema.
 * Returns the first error message string, or `undefined` if the field is valid.
 *
 * Usage with PatternFly Labs form wizard `validation` prop:
 * ```
 * <WizTextInput
 *   validation={(value) => validateField('name', value)}
 *   ...
 * />
 * ```
 */
export async function validateField(
  schema: yup.ObjectSchema<RosaWizardFormData>,
  fieldPath: string,
  value: unknown,
  context?: Record<string, unknown>
): Promise<string | undefined> {
  try {
    await schema.validateAt(fieldPath, {
      cluster: { ...context, [fieldPath.replace('cluster.', '')]: value },
    });
    return undefined;
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return err.message;
    }
    return undefined;
  }
}

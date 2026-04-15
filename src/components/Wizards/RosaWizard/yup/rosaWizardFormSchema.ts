import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';
import type { ClusterFormData, RosaWizardFormData } from '../../types';
import { ClusterEncryptionKeys } from '../../types';
import type { WizardFooterStrings } from '../wizardFooterStrings';
import type { RosaWizardValidatorStrings } from '../rosaWizardStrings';
import {
  checkNoProxyDomains,
  validateAWSKMSKeyARN,
  validateCA,
  validateClusterName,
  validateComputeNodes,
  validateCustomOperatorRolesPrefix,
  validateMaxReplicas,
  validateMinReplicas,
  validateRootDiskSize,
  validateUrl,
} from '../validators';
import { getWorkerNodeVolumeSizeMaxGiB } from '../helpers';
import { getAutoscalingMaxNodes } from '../Steps/BasicSetupStep/MachinePoolsSubstep/Autoscaling/AutoscalingField';
import {
  validateClusterNetworkHostPrefix,
  validateClusterNetworkMachineCidr,
  validateClusterNetworkPodCidr,
  validateClusterNetworkServiceCidr,
  validateProxyAtLeastOne,
} from './clusterFieldValidators';
import { yupValidationErrorToFieldErrors } from './yupValidationErrorToFieldErrors';

export type RosaWizardYupContext = {
  validators: RosaWizardValidatorStrings;
  requiredMessage: string;
  /** Full cluster snapshot for cross-field checks when Yup `pick` narrows `this.parent`. */
  fullCluster: ClusterFormData;
  fullForm: RosaWizardFormData;
};

export type RosaWizardYupSchemaArgs = {
  validators: RosaWizardValidatorStrings;
  footerStrings: WizardFooterStrings;
};

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function requiredMixed(message: string) {
  return yup.mixed().test('required', message, (value) => !isEmpty(value));
}

function requiredString(message: string) {
  return yup.string().required(message);
}

function ctxOf(this: yup.TestContext): RosaWizardYupContext {
  return this.options.context as RosaWizardYupContext;
}

function buildClusterFieldShapes(args: RosaWizardYupSchemaArgs): Record<string, yup.Schema> {
  const { validators, footerStrings } = args;
  const req = footerStrings.required;

  const machinePoolsNumber = (c: ClusterFormData) => c.machine_pools_subnets?.length ?? 0;

  const scaleMinNodesOnMachinePoolNumber = (n: number) => (n > 1 ? 1 : 2);

  return {
    associated_aws_id: requiredMixed(req),
    billing_account_id: requiredMixed(req),
    name: yup
      .string()
      .required(req)
      .test('cluster-name-format', function (value) {
        const err = validateClusterName(value ?? '', undefined, validators.clusterName);
        return err ? this.createError({ message: err }) : true;
      }),
    cluster_version: requiredMixed(req),
    region: requiredMixed(req),

    installer_role_arn: requiredMixed(req),
    support_role_arn: requiredMixed(req),
    worker_role_arn: requiredMixed(req),
    byo_oidc_config_id: requiredMixed(req),
    custom_operator_roles_prefix: yup
      .string()
      .required(req)
      .test('operator-prefix', function (value) {
        const err = validateCustomOperatorRolesPrefix(value ?? '', undefined, validators.operatorRolesPrefix);
        return err ? this.createError({ message: err }) : true;
      }),

    selected_vpc: requiredMixed(req),
    machine_pools_subnets: yup
      .array()
      .of(
        yup.object({
          machine_pool_subnet: yup.string().optional(),
        })
      )
      .test('machine-pools-subnets', function (arr) {
        const list = (arr ?? []) as { machine_pool_subnet?: string }[];
        if (list.length < 1) return this.createError({ message: req });
        if (list.some((r) => !String(r?.machine_pool_subnet ?? '').trim())) {
          return this.createError({ message: req });
        }
        return true;
      }),
    machine_type: requiredMixed(req),
    autoscaling: yup.boolean().optional(),
    min_replicas: yup.number().when('autoscaling', {
      is: (a: boolean | undefined) => a === true,
      then: (schema) =>
        schema
          .required(req)
          .test('min-replicas', function (value) {
            const c = ctxOf.call(this).fullCluster;
            const err = validateMinReplicas(
              value as number | undefined,
              { cluster: c },
              machinePoolsNumber(c),
              validators.replicas
            );
            return err ? this.createError({ message: err }) : true;
          }),
      otherwise: (schema) => schema.optional().nullable(),
    }),
    max_replicas: yup.number().when('autoscaling', {
      is: (a: boolean | undefined) => a === true,
      then: (schema) =>
        schema
          .required(req)
          .test('max-replicas', function (value) {
            const c = ctxOf.call(this).fullCluster;
            const maxNodes = getAutoscalingMaxNodes(c.cluster_version);
            const err = validateMaxReplicas(
              value as number | undefined,
              { cluster: c },
              maxNodes,
              validators.replicas
            );
            return err ? this.createError({ message: err }) : true;
          }),
      otherwise: (schema) => schema.optional().nullable(),
    }),
    nodes_compute: yup.number().when('autoscaling', {
      is: (a: boolean | undefined) => !a,
      then: (schema) =>
        schema
          .required(req)
          .test('nodes-compute', function (value) {
            const err = validateComputeNodes(value as number | undefined, validators.replicas);
            return err ? this.createError({ message: err }) : true;
          }),
      otherwise: (schema) => schema.optional().nullable(),
    }),
    compute_root_volume: yup.number().optional().test('root-disk', function (value) {
      if (value === undefined || value === null) return true;
      const c = ctxOf.call(this).fullCluster;
      const max = getWorkerNodeVolumeSizeMaxGiB(String(c.cluster_version ?? ''));
      const err = validateRootDiskSize(value as number, validators.rootDisk, max);
      return err ? this.createError({ message: err }) : true;
    }),
    imds: yup.mixed().optional(),

    cluster_privacy: yup.mixed().optional(),
    cluster_privacy_public_subnet_id: yup.mixed().optional(),
    configure_proxy: yup.boolean().optional(),
    cidr_default: yup.boolean().optional(),
    network_machine_cidr: yup.string().optional().test('machine-cidr', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err = validateClusterNetworkMachineCidr(value, c, validators);
      return err ? this.createError({ message: err }) : true;
    }),
    network_service_cidr: yup.string().optional().test('service-cidr', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err = validateClusterNetworkServiceCidr(value, c, validators);
      return err ? this.createError({ message: err }) : true;
    }),
    network_pod_cidr: yup.string().optional().test('pod-cidr', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err = validateClusterNetworkPodCidr(value, c, validators);
      return err ? this.createError({ message: err }) : true;
    }),
    network_host_prefix: yup.string().optional().test('host-prefix', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err = validateClusterNetworkHostPrefix(value, c, validators);
      return err ? this.createError({ message: err }) : true;
    }),

    http_proxy_url: yup.string().optional().test('http-proxy', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err =
        validateUrl(value ?? '', 'http', validators.url) ||
        validateProxyAtLeastOne({ ...c, http_proxy_url: value ?? '' }, validators.proxyConfigureAtLeastOne);
      return err ? this.createError({ message: err }) : true;
    }),
    https_proxy_url: yup.string().optional().test('https-proxy', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err =
        validateUrl(value ?? '', ['http', 'https'], validators.url) ||
        validateProxyAtLeastOne({ ...c, https_proxy_url: value ?? '' }, validators.proxyConfigureAtLeastOne);
      return err ? this.createError({ message: err }) : true;
    }),
    no_proxy_domains: yup.string().optional().test('no-proxy', function (value) {
      const err = checkNoProxyDomains(value, validators.noProxyDomains);
      return err ? this.createError({ message: err }) : true;
    }),
    additional_trust_bundle: yup.string().optional().test('trust-bundle', function (value) {
      const c = ctxOf.call(this).fullCluster;
      const err =
        validateCA(value ?? '', validators.ca) ||
        validateProxyAtLeastOne({ ...c, additional_trust_bundle: value ?? '' }, validators.proxyConfigureAtLeastOne);
      return err ? this.createError({ message: err }) : true;
    }),

    encryption_keys: yup.mixed().optional(),
    kms_key_arn: yup.string().when('encryption_keys', {
      is: (v: unknown) => v === ClusterEncryptionKeys.custom,
      then: (schema) =>
        schema
          .required(req)
          .test('kms-arn', function (value) {
            const c = ctxOf.call(this).fullCluster;
            const err = validateAWSKMSKeyARN(value ?? '', c.region, validators.kmsKeyArn);
            return err ? this.createError({ message: err }) : true;
          }),
      otherwise: (schema) => schema.optional(),
    }),
    etcd_encryption: yup.boolean().optional(),
    etcd_key_arn: yup.string().when('etcd_encryption', {
      is: true,
      then: (schema) =>
        schema
          .required(req)
          .test('etcd-arn', function (value) {
            const c = ctxOf.call(this).fullCluster;
            const err = validateAWSKMSKeyARN(value ?? '', c.region, validators.kmsKeyArn);
            return err ? this.createError({ message: err }) : true;
          }),
      otherwise: (schema) => schema.optional(),
    }),

    upgrade_policy: yup.mixed().optional(),
    upgrade_schedule: yup.string().optional(),
  };
}

function buildRootSchema(args: RosaWizardYupSchemaArgs) {
  const shapes = buildClusterFieldShapes(args);
  return yup.object({
    cluster: yup.object(shapes).required(),
  }) as yup.ObjectSchema<RosaWizardFormData>;
}

function clusterKeysFromFieldPaths(names: (string | undefined)[]): string[] {
  const out = new Set<string>();
  for (const n of names) {
    if (!n) continue;
    const s = String(n);
    if (s.startsWith('cluster.')) out.add(s.slice('cluster.'.length));
  }
  return [...out];
}

/** `yup.when('autoscaling', …)` needs siblings present when validating a subset via `pick`. */
function expandPickedClusterKeys(keys: string[]): string[] {
  const set = new Set(keys);
  if (set.has('min_replicas') || set.has('max_replicas') || set.has('nodes_compute')) {
    set.add('autoscaling');
  }
  if (set.has('kms_key_arn')) {
    set.add('encryption_keys');
  }
  if (set.has('etcd_key_arn')) {
    set.add('etcd_encryption');
  }
  return [...set];
}

/**
 * Yup-backed resolver with partial validation: `trigger(['cluster.name'])` validates only those
 * cluster keys (plus shared context via `fullCluster`) so step navigation keeps working.
 */
export function createRosaWizardYupResolver(args: RosaWizardYupSchemaArgs): Resolver<RosaWizardFormData> {
  const fullSchema = buildRootSchema(args);
  const clusterFieldShapes = buildClusterFieldShapes(args);

  return async (values, _ctx, options) => {
    const names = options.names as string[] | undefined;
    const yupCtx: RosaWizardYupContext = {
      validators: args.validators,
      requiredMessage: args.footerStrings.required,
      fullCluster: values.cluster,
      fullForm: values,
    };

    let schemaToRun: yup.ObjectSchema<RosaWizardFormData> = fullSchema;

    if (names?.length) {
      const keys = expandPickedClusterKeys(clusterKeysFromFieldPaths(names)).filter(
        (k) => k in clusterFieldShapes
      );
      if (keys.length > 0) {
        const picked = Object.fromEntries(keys.map((k) => [k, clusterFieldShapes[k]]));
        schemaToRun = yup.object({
          cluster: yup.object(picked).required(),
        }) as yup.ObjectSchema<RosaWizardFormData>;
      }
    }

    try {
      await schemaToRun.validate(values, { abortEarly: false, context: yupCtx });
      return { values, errors: {} };
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        return {
          values: {} as Record<string, never>,
          errors: yupValidationErrorToFieldErrors(e, options),
        };
      }
      throw e;
    }
  };
}

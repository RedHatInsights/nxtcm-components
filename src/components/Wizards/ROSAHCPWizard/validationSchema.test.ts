import * as yup from 'yup';

// cidr-tools uses ip-bigint which relies on BigInt ** operator; babel transpiles
// that to Math.pow which blows up at runtime. Mock with simple helpers instead.
jest.mock('cidr-tools', () => ({
  overlapCidr: (a: string, b: string): boolean => {
    const parse = (cidr: string): [number, number, number] => {
      const [ip, mask] = cidr.split('/');
      const bits = parseInt(mask, 10);
      const num = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
      const maskVal = bits === 0 ? 0 : -(1 << (32 - bits));
      return [num, bits, maskVal];
    };
    const [numA, , maskA] = parse(a);
    const [numB, , maskB] = parse(b);
    const startA = numA & maskA;
    const startB = numB & maskB;
    const wider = maskA > maskB ? maskA : maskB;
    return (startA & wider) === (startB & wider);
  },
  containsCidr: (parent: string, child: string): boolean => {
    const [parentIp, parentMask] = parent.split('/');
    const parentBits = parseInt(parentMask, 10);
    const parentNum = parentIp
      .split('.')
      .reduce((acc: number, o: string) => (acc << 8) + parseInt(o, 10), 0);
    const maskVal = parentBits === 0 ? 0 : -(1 << (32 - parentBits));
    // child can be a plain IP or a CIDR
    const childIp = child.split('/')[0];
    const childNum = childIp
      .split('.')
      .reduce((acc: number, o: string) => (acc << 8) + parseInt(o, 10), 0);
    return (childNum & maskVal) === (parentNum & maskVal);
  },
}));

jest.mock('ip-cidr', () => {
  return class IPCIDR {
    private ip: string;
    constructor(cidr: string) {
      this.ip = cidr.split('/')[0];
    }
    start(): { toString(): string } {
      const { ip } = this;
      return { toString: () => ip };
    }
  };
});

import { createClusterValidationSchema, ValidationSchemaOptions } from './validationSchema';
import { defaultRosaHcpWizardValidatorStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import type { ClusterFormData, CIDRSubnet } from '../types';
import {
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  HOST_PREFIX_MIN,
  HOST_PREFIX_MAX,
  AWS_MACHINE_CIDR_MIN,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  SERVICE_CIDR_MAX,
  POD_CIDR_MAX,
  MAX_CA_SIZE_BYTES,
} from './constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const msgs = defaultRosaHcpWizardValidatorStrings;

function buildOptions(overrides: Partial<ValidationSchemaOptions> = {}): ValidationSchemaOptions {
  return {
    msgs,
    maxRootDiskSize: 16384,
    maxAutoscalingNodes: 500,
    machinePoolsNumber: 1,
    ...overrides,
  };
}

function buildFormData(overrides: Partial<ClusterFormData> = {}): Partial<ClusterFormData> {
  return {
    name: 'mycluster',
    cluster_version: '4.15.0',
    associated_aws_id: 'aws-123',
    billing_account_id: 'billing-123',
    region: 'us-east-1',
    installer_role_arn: 'arn:aws:iam::role/installer',
    support_role_arn: 'arn:aws:iam::role/support',
    worker_role_arn: 'arn:aws:iam::role/worker',
    byo_oidc_config_id: 'oidc-123',
    custom_operator_roles_prefix: 'mycluster-a1b2',
    selected_vpc: 'vpc-123',
    machine_pools_subnets: [],
    machine_type: 'm5.xlarge',
    cluster_privacy: 'external' as ClusterFormData['cluster_privacy'],
    network_machine_cidr: '10.0.0.0/16',
    network_service_cidr: '172.30.0.0/16',
    network_pod_cidr: '10.128.0.0/14',
    network_host_prefix: '/23',
    ...overrides,
  };
}

async function validateField(
  options: ValidationSchemaOptions,
  data: Partial<ClusterFormData>,
  field: keyof ClusterFormData
): Promise<string | null> {
  const schema = createClusterValidationSchema(options);
  try {
    await schema.validateAt(field, data);
    return null;
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return err.message;
    }
    throw err;
  }
}

async function validate(
  options: ValidationSchemaOptions,
  data: Partial<ClusterFormData>,
  field: keyof ClusterFormData
): Promise<string | null> {
  return validateField(options, data, field);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createClusterValidationSchema', () => {
  // -----------------------------------------------------------------------
  // Cluster name
  // -----------------------------------------------------------------------
  describe('name', () => {
    const field = 'name' as const;

    it('accepts a valid cluster name', async () => {
      const error = await validate(buildOptions(), buildFormData(), field);
      expect(error).toBeNull();
    });

    it('rejects empty name (required)', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: '' }), field);
      expect(error).toBeTruthy();
    });

    it('rejects name longer than 54 characters', async () => {
      const longName = 'a'.repeat(55);
      const error = await validate(buildOptions(), buildFormData({ name: longName }), field);
      expect(error).toBe(msgs.clusterName.maxLength);
    });

    it('accepts name exactly 54 characters', async () => {
      const name = 'a'.repeat(54);
      const error = await validate(buildOptions(), buildFormData({ name }), field);
      expect(error).toBeNull();
    });

    it('rejects name with uppercase characters', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: 'MyCluster' }), field);
      expect(error).toBe(msgs.clusterName.invalidChars);
    });

    it('rejects name with underscores', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: 'my_cluster' }), field);
      expect(error).toBe(msgs.clusterName.invalidChars);
    });

    it('rejects name starting with a hyphen', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: '-mycluster' }), field);
      expect(error).toBe(msgs.clusterName.mustStartAlphanumeric);
    });

    it('rejects name starting with a number', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: '1mycluster' }), field);
      expect(error).toBe(msgs.clusterName.mustNotStartNumber);
    });

    it('rejects name ending with a hyphen', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: 'mycluster-' }), field);
      expect(error).toBe(msgs.clusterName.mustEndAlphanumeric);
    });

    it('accepts name with dots and hyphens', async () => {
      const error = await validate(buildOptions(), buildFormData({ name: 'my-cluster.v1' }), field);
      expect(error).toBeNull();
    });

    it('calls async uniqueness check when provided', async () => {
      const checkClusterNameUniqueness = jest.fn().mockResolvedValue('Name is taken');
      const error = await validate(
        buildOptions({ checkClusterNameUniqueness }),
        buildFormData({ name: 'mycluster', region: 'us-east-1' }),
        field
      );
      expect(checkClusterNameUniqueness).toHaveBeenCalledWith('mycluster', 'us-east-1');
      expect(error).toBe('Name is taken');
    });

    it('passes when async uniqueness check returns null', async () => {
      const checkClusterNameUniqueness = jest.fn().mockResolvedValue(null);
      const error = await validate(
        buildOptions({ checkClusterNameUniqueness }),
        buildFormData({ name: 'mycluster' }),
        field
      );
      expect(error).toBeNull();
    });

    it('skips async check when sync validation fails', async () => {
      const checkClusterNameUniqueness = jest.fn().mockResolvedValue('taken');
      await validate(
        buildOptions({ checkClusterNameUniqueness }),
        buildFormData({ name: 'MY_BAD' }),
        field
      );
      expect(checkClusterNameUniqueness).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Required detail fields
  // -----------------------------------------------------------------------
  describe('required detail fields', () => {
    const requiredFields: (keyof ClusterFormData)[] = [
      'cluster_version',
      'associated_aws_id',
      'billing_account_id',
      'region',
    ];

    it.each(requiredFields)('%s rejects empty string', async (field) => {
      const error = await validate(buildOptions(), buildFormData({ [field]: '' }), field);
      expect(error).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Roles & policies
  // -----------------------------------------------------------------------
  describe('required role fields', () => {
    const roleFields: (keyof ClusterFormData)[] = [
      'installer_role_arn',
      'support_role_arn',
      'worker_role_arn',
      'byo_oidc_config_id',
    ];

    it.each(roleFields)('%s rejects empty string', async (field) => {
      const error = await validate(buildOptions(), buildFormData({ [field]: '' }), field);
      expect(error).toBeTruthy();
    });
  });

  describe('custom_operator_roles_prefix', () => {
    const field = 'custom_operator_roles_prefix' as const;

    it('accepts a valid DNS label prefix', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: 'my-prefix-a1b2' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects empty prefix (required)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: '' }),
        field
      );
      expect(error).toBeTruthy();
    });

    it('rejects prefix with invalid DNS label format', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: '1starts-with-number' }),
        field
      );
      expect(error).toContain("isn't valid");
    });

    it('rejects prefix with uppercase characters', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: 'MyPrefix' }),
        field
      );
      expect(error).toContain("isn't valid");
    });

    it('rejects prefix exceeding max length', async () => {
      const longPrefix = 'a' + '-a'.repeat(MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH);
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: longPrefix }),
        field
      );
      expect(error).toContain('may not exceed');
    });

    it('accepts prefix at exactly max length', async () => {
      const prefix = 'a' + 'b'.repeat(MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH - 1);
      const error = await validate(
        buildOptions(),
        buildFormData({ custom_operator_roles_prefix: prefix }),
        field
      );
      expect(error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Root disk
  // -----------------------------------------------------------------------
  describe('compute_root_volume', () => {
    const field = 'compute_root_volume' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ compute_root_volume: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid disk size (200)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ compute_root_volume: 200 }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts minimum valid disk size (75)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ compute_root_volume: 75 }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects non-integer value', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ compute_root_volume: 100.5 }),
        field
      );
      expect(error).toBe(msgs.rootDisk.notInteger);
    });

    it('rejects value below 75 GiB', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ compute_root_volume: 50 }),
        field
      );
      expect(error).toBe(msgs.rootDisk.tooSmall);
    });

    it('rejects value exceeding 1024 when maxRootDiskSize=1024', async () => {
      const error = await validate(
        buildOptions({ maxRootDiskSize: 1024 }),
        buildFormData({ compute_root_volume: 2000 }),
        field
      );
      expect(error).toBe(msgs.rootDisk.tooLargeOldOpenshift);
    });

    it('rejects value exceeding 16384 when maxRootDiskSize=16384', async () => {
      const error = await validate(
        buildOptions({ maxRootDiskSize: 16384 }),
        buildFormData({ compute_root_volume: 20000 }),
        field
      );
      expect(error).toBe(msgs.rootDisk.tooLargeNewOpenshift);
    });

    it('accepts value at exactly maxRootDiskSize=1024', async () => {
      const error = await validate(
        buildOptions({ maxRootDiskSize: 1024 }),
        buildFormData({ compute_root_volume: 1024 }),
        field
      );
      expect(error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Compute nodes
  // -----------------------------------------------------------------------
  describe('nodes_compute', () => {
    const field = 'nodes_compute' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ nodes_compute: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts a valid positive integer', async () => {
      const error = await validate(buildOptions(), buildFormData({ nodes_compute: 3 }), field);
      expect(error).toBeNull();
    });

    it('rejects non-integer value', async () => {
      const error = await validate(buildOptions(), buildFormData({ nodes_compute: 2.5 }), field);
      expect(error).toBe(msgs.replicas.notInteger);
    });

    it('rejects zero', async () => {
      const error = await validate(buildOptions(), buildFormData({ nodes_compute: 0 }), field);
      expect(error).toBe(msgs.replicas.notPositive);
    });

    it('rejects negative value', async () => {
      const error = await validate(buildOptions(), buildFormData({ nodes_compute: -1 }), field);
      expect(error).toBe(msgs.replicas.notPositive);
    });
  });

  // -----------------------------------------------------------------------
  // Min replicas
  // -----------------------------------------------------------------------
  describe('min_replicas', () => {
    const field = 'min_replicas' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid min replicas', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: 2, max_replicas: 10 }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects non-integer value', async () => {
      const error = await validate(buildOptions(), buildFormData({ min_replicas: 2.5 }), field);
      expect(error).toBe(msgs.replicas.notInteger);
    });

    it('rejects zero', async () => {
      const error = await validate(buildOptions(), buildFormData({ min_replicas: 0 }), field);
      expect(error).toBe(msgs.replicas.notPositive);
    });

    it('rejects value exceeding maxAutoscalingNodes', async () => {
      const error = await validate(
        buildOptions({ maxAutoscalingNodes: 500 }),
        buildFormData({ min_replicas: 501 }),
        field
      );
      expect(error).toBe(msgs.replicas.maxNodes(500));
    });

    it('rejects min greater than max', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: 10, max_replicas: 5 }),
        field
      );
      expect(error).toBe(msgs.replicas.minGreaterThanMax);
    });

    it('rejects less than 2 when machinePoolsNumber < 2', async () => {
      const error = await validate(
        buildOptions({ machinePoolsNumber: 1 }),
        buildFormData({ min_replicas: 1, max_replicas: 10 }),
        field
      );
      expect(error).toBe(msgs.replicas.computeMinTwo);
    });

    it('accepts 1 when machinePoolsNumber >= 2', async () => {
      const error = await validate(
        buildOptions({ machinePoolsNumber: 2 }),
        buildFormData({ min_replicas: 1, max_replicas: 10 }),
        field
      );
      expect(error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Max replicas
  // -----------------------------------------------------------------------
  describe('max_replicas', () => {
    const field = 'max_replicas' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ max_replicas: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid max replicas', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: 2, max_replicas: 10 }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects non-integer value', async () => {
      const error = await validate(buildOptions(), buildFormData({ max_replicas: 5.5 }), field);
      expect(error).toBe(msgs.replicas.notInteger);
    });

    it('rejects zero', async () => {
      const error = await validate(buildOptions(), buildFormData({ max_replicas: 0 }), field);
      expect(error).toBe(msgs.replicas.notPositive);
    });

    it('rejects value exceeding maxAutoscalingNodes', async () => {
      const error = await validate(
        buildOptions({ maxAutoscalingNodes: 500 }),
        buildFormData({ max_replicas: 501 }),
        field
      );
      expect(error).toBe(msgs.replicas.maxNodes(500));
    });

    it('rejects max less than min', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: 10, max_replicas: 5 }),
        field
      );
      expect(error).toBe(msgs.replicas.maxLessThanMin);
    });

    it('accepts max equal to min', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ min_replicas: 5, max_replicas: 5 }),
        field
      );
      expect(error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Machine CIDR
  // -----------------------------------------------------------------------
  describe('network_machine_cidr', () => {
    const field = 'network_machine_cidr' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_machine_cidr: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts a valid machine CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_machine_cidr: '10.0.0.0/16' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid CIDR notation', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_machine_cidr: 'not-a-cidr' }),
        field
      );
      expect(error).toContain("isn't valid CIDR notation");
    });

    it('rejects non-subnet address', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_machine_cidr: '10.0.0.1/16' }),
        field
      );
      expect(error).toBe(msgs.validateRange.notSubnetAddress);
    });

    it('rejects mask smaller than min (/16)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_machine_cidr: '10.0.0.0/15' }),
        field
      );
      expect(error).toBe(msgs.awsMachineCidr.maskTooLarge(AWS_MACHINE_CIDR_MIN));
    });

    it('rejects mask larger than single-AZ max (/25)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '10.0.0.0/26',
          multi_az: 'false',
          hypershift: 'false',
        }),
        field
      );
      expect(error).toBe(msgs.awsMachineCidr.maskTooSmallSingleAz(AWS_MACHINE_CIDR_MAX_SINGLE_AZ));
    });

    it('rejects mask larger than multi-AZ max (/24) when multi_az', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '10.0.0.0/25',
          multi_az: 'true',
        }),
        field
      );
      expect(error).toBe(msgs.awsMachineCidr.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ));
    });

    it('rejects mask larger than multi-AZ max when hypershift=true', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '10.0.0.0/25',
          hypershift: 'true',
          multi_az: 'false',
        }),
        field
      );
      expect(error).toBe(msgs.awsMachineCidr.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ));
    });

    it('rejects when machine CIDR does not include subnet starting IP', async () => {
      const subnets: CIDRSubnet[] = [
        {
          cidr_block: '192.168.1.0/24',
          name: 'my-subnet',
          subnet_id: 'sub-1',
          availability_zone: 'us-east-1a',
        },
      ];
      const error = await validate(
        buildOptions({ selectedSubnets: subnets }),
        buildFormData({ network_machine_cidr: '10.0.0.0/16' }),
        field
      );
      expect(error).toContain('Machine CIDR does not include the starting IP');
    });

    it('rejects when machine CIDR overlaps with service CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '10.0.0.0/16',
          network_service_cidr: '10.0.0.0/24',
          network_pod_cidr: '172.16.0.0/14',
        }),
        field
      );
      expect(error).toContain('overlaps');
    });
  });

  // -----------------------------------------------------------------------
  // Service CIDR
  // -----------------------------------------------------------------------
  describe('network_service_cidr', () => {
    const field = 'network_service_cidr' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_service_cidr: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts a valid service CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_service_cidr: '172.30.0.0/16' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid CIDR notation', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_service_cidr: 'invalid' }),
        field
      );
      expect(error).toContain("isn't valid CIDR notation");
    });

    it('rejects non-subnet address', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_service_cidr: '172.30.0.1/16' }),
        field
      );
      expect(error).toBe(msgs.validateRange.notSubnetAddress);
    });

    it('rejects mask smaller than max (/24)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_service_cidr: '172.30.0.0/25' }),
        field
      );
      expect(error).toContain("can't be smaller than");
    });

    it('rejects when service CIDR includes subnet starting IP', async () => {
      const subnets: CIDRSubnet[] = [
        {
          cidr_block: '172.30.0.0/24',
          name: 'svc-subnet',
          subnet_id: 'sub-2',
          availability_zone: 'us-east-1a',
        },
      ];
      const error = await validate(
        buildOptions({ selectedSubnets: subnets }),
        buildFormData({ network_service_cidr: '172.30.0.0/16' }),
        field
      );
      expect(error).toContain('Service CIDR includes the starting IP');
    });

    it('rejects when service CIDR overlaps with pod CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '192.168.0.0/16',
          network_service_cidr: '10.0.0.0/16',
          network_pod_cidr: '10.0.0.0/14',
        }),
        field
      );
      expect(error).toContain('overlaps');
    });
  });

  // -----------------------------------------------------------------------
  // Pod CIDR
  // -----------------------------------------------------------------------
  describe('network_pod_cidr', () => {
    const field = 'network_pod_cidr' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_pod_cidr: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts a valid pod CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_pod_cidr: '10.128.0.0/14' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid CIDR notation', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_pod_cidr: 'garbage' }),
        field
      );
      expect(error).toContain("isn't valid CIDR notation");
    });

    it('rejects non-subnet address', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_pod_cidr: '10.128.0.1/14' }),
        field
      );
      expect(error).toBe(msgs.validateRange.notSubnetAddress);
    });

    it(`rejects mask smaller than /${POD_CIDR_MAX}`, async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_pod_cidr: '10.128.0.0/22' }),
        field
      );
      expect(error).toBe(msgs.podCidr.maskTooSmall(POD_CIDR_MAX));
    });

    it('rejects when pod CIDR does not allow enough nodes', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_pod_cidr: '10.128.0.0/21',
          network_host_prefix: '/21',
        }),
        field
      );
      expect(error).toContain('does not allow for enough nodes');
    });

    it('rejects when pod CIDR includes subnet starting IP', async () => {
      const subnets: CIDRSubnet[] = [
        {
          cidr_block: '10.128.0.0/24',
          name: 'pod-subnet',
          subnet_id: 'sub-3',
          availability_zone: 'us-east-1a',
        },
      ];
      const error = await validate(
        buildOptions({ selectedSubnets: subnets }),
        buildFormData({ network_pod_cidr: '10.128.0.0/14' }),
        field
      );
      expect(error).toContain('Pod CIDR includes the starting IP');
    });

    it('rejects when pod CIDR overlaps with machine CIDR', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({
          network_machine_cidr: '10.128.0.0/16',
          network_service_cidr: '172.30.0.0/16',
          network_pod_cidr: '10.128.0.0/14',
        }),
        field
      );
      expect(error).toContain('overlaps');
    });
  });

  // -----------------------------------------------------------------------
  // Host prefix
  // -----------------------------------------------------------------------
  describe('network_host_prefix', () => {
    const field = 'network_host_prefix' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid host prefix /23', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: '/23' }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid host prefix 25 (without slash)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: '25' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid format', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: 'abc' }),
        field
      );
      expect(error).toContain("isn't a valid subnet mask");
    });

    it(`rejects prefix smaller than /${HOST_PREFIX_MIN}`, async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: '/22' }),
        field
      );
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
      expect(error).toBe(msgs.hostPrefix.maskTooLarge(HOST_PREFIX_MIN, maxPodIPs));
    });

    it(`rejects prefix larger than /${HOST_PREFIX_MAX}`, async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ network_host_prefix: '/27' }),
        field
      );
      const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
      expect(error).toBe(msgs.hostPrefix.maskTooSmall(HOST_PREFIX_MAX, maxPodIPs));
    });
  });

  // -----------------------------------------------------------------------
  // HTTP proxy URL
  // -----------------------------------------------------------------------
  describe('http_proxy_url', () => {
    const field = 'http_proxy_url' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ http_proxy_url: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts empty string', async () => {
      const error = await validate(buildOptions(), buildFormData({ http_proxy_url: '' }), field);
      expect(error).toBeNull();
    });

    it('accepts valid http URL', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ http_proxy_url: 'http://proxy.example.com:8080' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid URL', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ http_proxy_url: 'not-a-url' }),
        field
      );
      expect(error).toBe(msgs.url.invalid);
    });

    it('rejects https scheme', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ http_proxy_url: 'https://proxy.example.com:8080' }),
        field
      );
      expect(error).toBe(msgs.url.schemePrefix('http://'));
    });

    it('rejects ftp scheme', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ http_proxy_url: 'ftp://proxy.example.com' }),
        field
      );
      expect(error).toBe(msgs.url.schemePrefix('http://'));
    });
  });

  // -----------------------------------------------------------------------
  // HTTPS proxy URL
  // -----------------------------------------------------------------------
  describe('https_proxy_url', () => {
    const field = 'https_proxy_url' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ https_proxy_url: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid http URL', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ https_proxy_url: 'http://proxy.example.com:8080' }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid https URL', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ https_proxy_url: 'https://proxy.example.com:443' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid URL', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ https_proxy_url: 'xyz://notvalid' }),
        field
      );
      expect(error).toBe(msgs.url.schemePrefix('http://, https://'));
    });

    it('rejects ftp scheme', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ https_proxy_url: 'ftp://proxy.example.com' }),
        field
      );
      expect(error).toBe(msgs.url.schemePrefix('http://, https://'));
    });
  });

  // -----------------------------------------------------------------------
  // No-proxy domains
  // -----------------------------------------------------------------------
  describe('no_proxy_domains', () => {
    const field = 'no_proxy_domains' as const;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ no_proxy_domains: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid domains', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ no_proxy_domains: 'example.com,sub.domain.org' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid domain names', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ no_proxy_domains: 'not_valid' }),
        field
      );
      expect(error).toContain("isn't valid");
    });

    it('rejects mixed valid and invalid domains', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ no_proxy_domains: 'example.com,BAD_DOMAIN!' }),
        field
      );
      expect(error).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Additional trust bundle
  // -----------------------------------------------------------------------
  describe('additional_trust_bundle', () => {
    const field = 'additional_trust_bundle' as const;

    const validPem = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAKHBfpHYbpHTMA0GCSqGSIb3DQEBCwUAMBExDzANBgNVBAMMBnRl
c3RjYTAeFw0yMzAxMDEwMDAwMDBaFw0yNDAxMDEwMDAwMDBaMBExDzANBgNVBAMM
BnRlc3RjYTBcMA0GCSqGSIb3DQEBAQUAAwIAATANBgkqhkiG9w0BAQsFAAMCAQA=
-----END CERTIFICATE-----`;

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ additional_trust_bundle: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts empty string', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ additional_trust_bundle: '' }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid PEM certificate', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ additional_trust_bundle: validPem }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects file exceeding max CA size', async () => {
      const hugeBundle = `-----BEGIN CERTIFICATE-----\n${'A'.repeat(MAX_CA_SIZE_BYTES + 1)}\n-----END CERTIFICATE-----`;
      const error = await validate(
        buildOptions(),
        buildFormData({ additional_trust_bundle: hugeBundle }),
        field
      );
      expect(error).toBe(msgs.ca.fileTooLarge);
    });

    it('rejects invalid PEM content', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ additional_trust_bundle: 'this is not a certificate' }),
        field
      );
      expect(error).toBe(msgs.ca.invalidPem);
    });
  });

  // -----------------------------------------------------------------------
  // KMS key ARN
  // -----------------------------------------------------------------------
  describe('kms_key_arn', () => {
    const field = 'kms_key_arn' as const;
    const validArn = 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-5678-abcd-123456789012';

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts empty string', async () => {
      const error = await validate(buildOptions(), buildFormData({ kms_key_arn: '' }), field);
      expect(error).toBeNull();
    });

    it('accepts valid KMS ARN in matching region', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: validArn, region: 'us-east-1' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects ARN with whitespace', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: validArn + ' ', region: 'us-east-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.noWhitespace);
    });

    it('rejects invalid ARN format', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: 'not-an-arn', region: 'us-east-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.invalidArn);
    });

    it('rejects ARN from wrong region', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: validArn, region: 'eu-west-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.wrongRegion);
    });

    it('accepts valid multi-region KMS ARN', async () => {
      const mrkArn = 'arn:aws:kms:us-east-1:123456789012:key/mrk-12345678901234567890123456789012';
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: mrkArn, region: 'us-east-1' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects invalid multi-region KMS ARN format', async () => {
      const badMrkArn = 'arn:aws:kms:us-east-1:123456789012:key/mrk-invalid';
      const error = await validate(
        buildOptions(),
        buildFormData({ kms_key_arn: badMrkArn, region: 'us-east-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.invalidArn);
    });
  });

  // -----------------------------------------------------------------------
  // etcd key ARN
  // -----------------------------------------------------------------------
  describe('etcd_key_arn', () => {
    const field = 'etcd_key_arn' as const;
    const validArn = 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-5678-abcd-123456789012';

    it('accepts undefined (optional)', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ etcd_key_arn: undefined }),
        field
      );
      expect(error).toBeNull();
    });

    it('accepts valid etcd key ARN in matching region', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ etcd_key_arn: validArn, region: 'us-east-1' }),
        field
      );
      expect(error).toBeNull();
    });

    it('rejects ARN with whitespace', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ etcd_key_arn: ' ' + validArn, region: 'us-east-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.noWhitespace);
    });

    it('rejects invalid ARN format', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ etcd_key_arn: 'bad-arn', region: 'us-east-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.invalidArn);
    });

    it('rejects ARN from wrong region', async () => {
      const error = await validate(
        buildOptions(),
        buildFormData({ etcd_key_arn: validArn, region: 'ap-southeast-1' }),
        field
      );
      expect(error).toBe(msgs.kmsKeyArn.wrongRegion);
    });
  });

  // -----------------------------------------------------------------------
  // Full schema – validates all required fields together
  // -----------------------------------------------------------------------
  describe('full schema validation', () => {
    it('passes with all required fields filled', async () => {
      const schema = createClusterValidationSchema(buildOptions());
      await expect(schema.validate(buildFormData(), { abortEarly: false })).resolves.toBeDefined();
    });

    it('collects multiple errors with abortEarly: false', async () => {
      const schema = createClusterValidationSchema(buildOptions());
      try {
        await schema.validate(
          buildFormData({
            name: '',
            cluster_version: '',
            region: '',
          }),
          { abortEarly: false }
        );
        fail('Expected validation to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(yup.ValidationError);
        const validationError = err as yup.ValidationError;
        expect(validationError.inner.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});

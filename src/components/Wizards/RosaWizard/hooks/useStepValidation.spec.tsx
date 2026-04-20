import { test, expect } from '@playwright/experimental-ct-react';

import {
  STEP_IDS,
  STEP_FIELDS,
  computeStepErrors,
  stepHasErrors,
  type FieldMetaLike,
} from './stepFieldsConfig';
import type { RosaWizardFormData } from '../../types';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '../../types';

/** Minimal valid form data that passes the Zod schema. */
const validFormData: RosaWizardFormData = {
  cluster: {
    name: 'my-cluster',
    cluster_version: '4.12.0',
    associated_aws_id: 'aws-account-123',
    billing_account_id: 'billing-123',
    region: 'us-east-1',
    installer_role_arn: 'arn:aws:iam::123456789012:role/Installer',
    support_role_arn: 'arn:aws:iam::123456789012:role/Support',
    worker_role_arn: 'arn:aws:iam::123456789012:role/Worker',
    byo_oidc_config_id: 'oidc-123',
    custom_operator_roles_prefix: 'my-prefix',
    selected_vpc: { id: 'vpc-123', name: 'test', aws_subnets: [] },
    machine_pools_subnets: [{ machine_pool_subnet: 'subnet-1' }],
    machine_type: 'm5a.xlarge',
    autoscaling: false,
    nodes_compute: 2,
    compute_root_volume: 300,
    cluster_privacy: ClusterNetwork.external,
    cidr_default: true,
    network_machine_cidr: '10.0.0.0/16',
    network_service_cidr: '172.30.0.0/16',
    network_pod_cidr: '10.128.0.0/14',
    network_host_prefix: '/23',
    configure_proxy: false,
    encryption_keys: ClusterEncryptionKeys.default,
    etcd_encryption: false,
    upgrade_policy: ClusterUpgrade.automatic,
  },
};

test.describe('STEP_FIELDS mapping', () => {
  test('every substep ID in STEP_IDS (except parents and review) has a STEP_FIELDS entry', () => {
    const parentOrReviewIds = new Set<string>([
      STEP_IDS.BASIC_SETUP,
      STEP_IDS.ADDITIONAL_SETUP,
      STEP_IDS.REVIEW,
    ]);
    for (const id of Object.values(STEP_IDS)) {
      if (parentOrReviewIds.has(id)) continue;
      expect(STEP_FIELDS[id], `Missing STEP_FIELDS entry for ${id}`).toBeDefined();
      expect(STEP_FIELDS[id].length).toBeGreaterThan(0);
    }
  });

  test('no field path is mapped to more than one step', () => {
    const seen = new Map<string, string>();
    for (const [stepId, fields] of Object.entries(STEP_FIELDS)) {
      for (const field of fields) {
        expect(seen.has(field), `"${field}" appears in both ${seen.get(field)} and ${stepId}`).toBe(
          false,
        );
        seen.set(field, stepId);
      }
    }
  });
});

test.describe('computeStepErrors', () => {
  test('returns empty set for valid form data', () => {
    const errors = computeStepErrors(validFormData);
    expect(errors.size).toBe(0);
  });

  test('flags Details step when cluster name is missing', () => {
    const data: RosaWizardFormData = {
      ...validFormData,
      cluster: { ...validFormData.cluster, name: undefined },
    };
    const errors = computeStepErrors(data);
    expect(errors.has(STEP_IDS.DETAILS)).toBe(true);
    expect(errors.has(STEP_IDS.ROLES_AND_POLICIES)).toBe(false);
  });

  test('flags Roles step when installer_role_arn is missing', () => {
    const data: RosaWizardFormData = {
      ...validFormData,
      cluster: { ...validFormData.cluster, installer_role_arn: undefined },
    };
    const errors = computeStepErrors(data);
    expect(errors.has(STEP_IDS.ROLES_AND_POLICIES)).toBe(true);
    expect(errors.has(STEP_IDS.DETAILS)).toBe(false);
  });

  test('flags multiple steps when multiple required fields are empty', () => {
    const data: RosaWizardFormData = {
      ...validFormData,
      cluster: {
        ...validFormData.cluster,
        name: undefined,
        installer_role_arn: undefined,
        machine_type: undefined,
      },
    };
    const errors = computeStepErrors(data);
    expect(errors.has(STEP_IDS.DETAILS)).toBe(true);
    expect(errors.has(STEP_IDS.ROLES_AND_POLICIES)).toBe(true);
    expect(errors.has(STEP_IDS.MACHINE_POOLS)).toBe(true);
  });

  test('flags Networking step for invalid CIDR', () => {
    const data: RosaWizardFormData = {
      ...validFormData,
      cluster: { ...validFormData.cluster, network_machine_cidr: 'not-a-cidr' },
    };
    const errors = computeStepErrors(data);
    expect(errors.has(STEP_IDS.NETWORKING)).toBe(true);
  });
});

test.describe('stepHasErrors (touched-aware)', () => {
  test('returns false when field has errors but is not touched', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: ['required'], isTouched: false },
    };
    expect(stepHasErrors(fieldMeta, STEP_IDS.DETAILS)).toBe(false);
  });

  test('returns true when field has errors and is touched', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: ['required'], isTouched: true },
    };
    expect(stepHasErrors(fieldMeta, STEP_IDS.DETAILS)).toBe(true);
  });

  test('returns false when field is touched but has no errors', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: [], isTouched: true },
    };
    expect(stepHasErrors(fieldMeta, STEP_IDS.DETAILS)).toBe(false);
  });

  test('returns false for an unknown step ID', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: ['required'], isTouched: true },
    };
    expect(stepHasErrors(fieldMeta, 'nonexistent-step')).toBe(false);
  });

  test('returns true when at least one field in the step is touched with errors', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: [], isTouched: true },
      'cluster.region': { errors: ['required'], isTouched: true },
      'cluster.cluster_version': { errors: ['required'], isTouched: false },
    };
    expect(stepHasErrors(fieldMeta, STEP_IDS.DETAILS)).toBe(true);
  });

  test('returns false when all errors are on untouched fields', () => {
    const fieldMeta: FieldMetaLike = {
      'cluster.name': { errors: ['required'], isTouched: false },
      'cluster.region': { errors: ['required'], isTouched: false },
    };
    expect(stepHasErrors(fieldMeta, STEP_IDS.DETAILS)).toBe(false);
  });
});

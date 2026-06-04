import { STEP_IDS } from '../../constants';
import {
  buildRosaHcpWizardReviewSections,
  getFieldPathsForWizardStepId,
} from './rosaHcpWizardReviewSections.data';

const stepLabels = {
  details: 'Details',
  rolesAndPolicies: 'Roles and policies',
  machinePools: 'Machine pools',
  networking: 'Networking',
  clusterWideProxy: 'Cluster-wide proxy',
  encryptionOptional: 'Encryption (optional)',
  clusterUpdatesOptional: 'Cluster updates (optional)',
};

describe('getFieldPathsForWizardStepId', () => {
  const sections = buildRosaHcpWizardReviewSections(stepLabels);

  it('returns field paths for a form step', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.DETAILS)).toEqual([
      'name',
      'cluster_version',
      'associated_aws_id',
      'billing_account_id',
      'region',
    ]);
  });

  it('returns field paths for machine pools step', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.MACHINE_POOLS)).toEqual([
      'selected_vpc',
      'machine_pools_subnets',
      'machine_type',
      'autoscaling',
      'nodes_compute',
      'min_replicas',
      'max_replicas',
      'compute_root_volume',
      'imds',
      'security_groups_worker',
    ]);
  });

  it('returns no paths for parent or review steps', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.BASIC_SETUP)).toEqual([]);
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.REVIEW)).toEqual([]);
  });
});

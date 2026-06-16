import { STEP_IDS } from '../../constants';
import { getFieldPathsByStepId } from '../../yupSchemas/wizardFieldMetaChangeRegistry';
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

describe('getFieldPathsByStepId', () => {
  it('includes every top-level schema field with a stepId', () => {
    const fieldPathsByStepId = getFieldPathsByStepId();
    expect(fieldPathsByStepId[STEP_IDS.DETAILS]).toEqual(
      expect.arrayContaining([
        'name',
        'cluster_version',
        'associated_aws_id',
        'billing_account_id',
        'region',
      ])
    );
    expect(fieldPathsByStepId[STEP_IDS.DETAILS]).toHaveLength(5);
  });

  it('groups networking fields including configure_proxy', () => {
    expect(getFieldPathsByStepId()[STEP_IDS.NETWORKING]).toEqual(
      expect.arrayContaining(['cluster_privacy', 'configure_proxy', 'multi_az', 'hypershift'])
    );
  });
});

describe('getFieldPathsForWizardStepId', () => {
  const sections = buildRosaHcpWizardReviewSections(stepLabels);

  it('returns Yup-derived field paths for a form step', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.DETAILS)).toEqual(
      getFieldPathsByStepId()[STEP_IDS.DETAILS]
    );
  });

  it('returns Yup-derived field paths for machine pools step', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.MACHINE_POOLS)).toEqual(
      getFieldPathsByStepId()[STEP_IDS.MACHINE_POOLS]
    );
  });

  it('returns no paths for parent or review steps', () => {
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.BASIC_SETUP)).toEqual([]);
    expect(getFieldPathsForWizardStepId(sections, STEP_IDS.REVIEW)).toEqual([]);
  });
});

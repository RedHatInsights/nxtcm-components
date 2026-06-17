import { STEP_IDS } from '../constants';
import {
  getFieldPathsByStepId,
  getWizardFieldDerivedSyncKeyForSourceField,
  getWizardFieldResetsForSourceField,
  getWizardFieldSyncsForSourceField,
  getWizardResourceRefetchesForSourceField,
  listWizardFieldDerivedSyncEntries,
  listWizardFieldMetaChangeSourceFields,
  listWizardFieldRefetchEntries,
  listWizardFieldResetEntries,
  listWizardFieldSyncEntries,
} from './wizardFieldMetaChangeRegistry';

describe('wizardFieldMetaChangeRegistry', () => {
  describe('getFieldPathsByStepId', () => {
    it('assigns each schema field to exactly one step', () => {
      const fieldPathsByStepId = getFieldPathsByStepId();
      const allPaths = Object.values(fieldPathsByStepId).flat();
      const unique = new Set(allPaths);
      expect(unique.size).toBe(allPaths.length);
      expect(allPaths.length).toBeGreaterThan(0);
    });

    it('does not include parent or review step ids', () => {
      const fieldPathsByStepId = getFieldPathsByStepId();
      expect(fieldPathsByStepId[STEP_IDS.BASIC_SETUP]).toBeUndefined();
      expect(fieldPathsByStepId[STEP_IDS.REVIEW]).toBeUndefined();
      expect(fieldPathsByStepId[STEP_IDS.OPTIONAL_SETUP]).toBeUndefined();
    });

    it('groups networking fields including configure_proxy', () => {
      expect(getFieldPathsByStepId()[STEP_IDS.NETWORKING]).toEqual(
        expect.arrayContaining(['configure_proxy', 'multi_az', 'hypershift'])
      );
    });
  });

  describe('listWizardFieldMetaChangeSourceFields', () => {
    it('includes fields that declare derivedFieldsSyncOnChange in Yup meta', () => {
      expect(listWizardFieldMetaChangeSourceFields()).toContain('installer_role_arn');
      expect(listWizardFieldMetaChangeSourceFields()).toContain('selected_vpc');
    });
  });

  describe('resets', () => {
    it('lists region-dependent resets from Yup meta', () => {
      expect(getWizardFieldResetsForSourceField('region')).toEqual(
        expect.arrayContaining([
          'selected_vpc',
          'machine_pools_subnets',
          'security_groups_worker',
          'cluster_privacy_public_subnet_id',
        ])
      );
    });

    it('returns an entry per source field with reset metadata', () => {
      const entries = listWizardFieldResetEntries();
      expect(entries.some((entry) => entry.sourceField === 'region')).toBe(true);
      expect(entries.every((entry) => entry.targetFields.length > 0)).toBe(true);
    });
  });

  describe('refetches', () => {
    it('lists region refetches from Yup meta', () => {
      expect(getWizardResourceRefetchesForSourceField('region')).toEqual(
        expect.arrayContaining([
          {
            resource: 'vpcList',
            argsFromFields: {
              account_id: 'associated_aws_id',
              role_arn: 'installer_role_arn',
              region: 'region',
            },
          },
          { resource: 'machineTypes', argFromField: 'region' },
        ])
      );
    });

    it('returns an entry per source field with refetch metadata', () => {
      const entries = listWizardFieldRefetchEntries();
      expect(entries.some((entry) => entry.sourceField === 'associated_aws_id')).toBe(true);
      expect(entries.every((entry) => entry.refetches.length > 0)).toBe(true);
    });
  });

  describe('syncs', () => {
    it('lists autoscaling dependent sync rules from Yup meta', () => {
      expect(getWizardFieldSyncsForSourceField('autoscaling')).toEqual([
        {
          when: true,
          setDefaults: ['min_replicas', 'max_replicas'],
          clear: ['nodes_compute'],
        },
        {
          when: false,
          setDefaults: ['nodes_compute'],
          clear: ['min_replicas', 'max_replicas'],
        },
      ]);
    });

    it('returns an entry per source field with sync metadata', () => {
      const entries = listWizardFieldSyncEntries();
      expect(entries.some((entry) => entry.sourceField === 'autoscaling')).toBe(true);
      expect(entries.every((entry) => entry.syncs.length > 0)).toBe(true);
    });
  });

  describe('derived sync', () => {
    it('lists installer role derived sync from Yup meta', () => {
      expect(getWizardFieldDerivedSyncKeyForSourceField('installer_role_arn')).toBe(
        'installerRoleDependentRoles'
      );
      expect(getWizardFieldDerivedSyncKeyForSourceField('selected_vpc')).toBe(
        'vpcSecurityGroupsWorkerSelection'
      );
    });

    it('returns an entry per source field with derived sync metadata', () => {
      const entries = listWizardFieldDerivedSyncEntries();
      expect(entries.some((entry) => entry.sourceField === 'installer_role_arn')).toBe(true);
      expect(entries.some((entry) => entry.sourceField === 'selected_vpc')).toBe(true);
      expect(entries.every((entry) => entry.syncKey.length > 0)).toBe(true);
    });
  });
});

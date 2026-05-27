import {
  getWizardFieldResetsForSourceField,
  listWizardFieldResetEntries,
} from './wizardFieldResetRegistry';

describe('wizardFieldResetRegistry', () => {
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

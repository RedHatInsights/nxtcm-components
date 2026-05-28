import {
  getWizardFieldDerivedSyncKeyForSourceField,
  listWizardFieldDerivedSyncEntries,
} from './wizardFieldDerivedSyncRegistry';

describe('wizardFieldDerivedSyncRegistry', () => {
  it('lists installer role derived sync from Yup meta', () => {
    expect(getWizardFieldDerivedSyncKeyForSourceField('installer_role_arn')).toBe(
      'installerRoleDependentRoles'
    );
  });

  it('returns an entry per source field with derived sync metadata', () => {
    const entries = listWizardFieldDerivedSyncEntries();
    expect(entries.some((entry) => entry.sourceField === 'installer_role_arn')).toBe(true);
    expect(entries.every((entry) => entry.syncKey.length > 0)).toBe(true);
  });
});

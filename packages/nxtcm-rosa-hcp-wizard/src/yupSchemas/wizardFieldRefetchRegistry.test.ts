import {
  getWizardResourceRefetchesForSourceField,
  listWizardFieldRefetchEntries,
} from './wizardFieldRefetchRegistry';

describe('wizardFieldRefetchRegistry', () => {
  it('lists region refetches from Yup meta', () => {
    expect(getWizardResourceRefetchesForSourceField('region')).toEqual(
      expect.arrayContaining([
        { resource: 'vpcList' },
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

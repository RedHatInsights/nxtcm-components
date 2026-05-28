import {
  getWizardFieldSyncsForSourceField,
  listWizardFieldSyncEntries,
} from './wizardFieldSyncRegistry';

describe('wizardFieldSyncRegistry', () => {
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

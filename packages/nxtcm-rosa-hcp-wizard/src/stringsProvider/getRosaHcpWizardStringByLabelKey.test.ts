import { createPartialWizardStrings } from '../ROSAHCPWizard.stories.helpers';
import { getRosaHcpWizardStringByLabelKey } from './getRosaHcpWizardStringByLabelKey';
import type { RosaHcpWizardStrings } from './rosaHcpWizardStrings.types';

describe('getRosaHcpWizardStringByLabelKey', () => {
  const minimalStrings = createPartialWizardStrings({
    details: {
      billingLabel: 'Associated AWS billing account',
      openShiftVersionGroups: { latestRelease: 'Latest' },
    },
    networking: { sectionLabel: 'Networking' },
  });

  it('returns nested string for a valid labelKey path', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.billingLabel')).toBe(
      'Associated AWS billing account'
    );
  });

  it('returns undefined when the path does not exist', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.noSuchKey')).toBeUndefined();
  });

  it('returns undefined when the path ends on a non-string leaf', () => {
    expect(
      getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.openShiftVersionGroups')
    ).toBeUndefined();
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details')).toBeUndefined();
  });

  it('returns undefined for empty or invalid labelKey', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, '')).toBeUndefined();
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, '...')).toBeUndefined();
  });
});

import type { RosaHcpWizardStrings } from './rosaHcpWizardStrings.types';
import { getRosaHcpWizardStringByLabelKey } from './getRosaHcpWizardStringByLabelKey';

describe('getRosaHcpWizardStringByLabelKey', () => {
  const minimalStrings = {
    details: {
      billingLabel: 'Associated AWS billing account',
      other: 42,
    },
    networking: {
      sectionLabel: 'Networking',
    },
  } as unknown as RosaHcpWizardStrings;

  it('returns nested string for a valid labelKey path', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.billingLabel')).toBe(
      'Associated AWS billing account'
    );
  });

  it('returns undefined when the path does not exist', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.noSuchKey')).toBeUndefined();
  });

  it('returns undefined when the path ends on a non-string leaf', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details.other')).toBeUndefined();
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, 'details')).toBeUndefined();
  });

  it('returns undefined for empty or invalid labelKey', () => {
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, '')).toBeUndefined();
    expect(getRosaHcpWizardStringByLabelKey(minimalStrings, '...')).toBeUndefined();
  });
});

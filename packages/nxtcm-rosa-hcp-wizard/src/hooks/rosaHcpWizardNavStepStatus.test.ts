import type { FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import type { RosaHcpWizardReviewSection } from '../Steps/Review/rosaHcpWizardReviewSections.data';

import {
  buildRosaHcpWizardNavStepStatuses,
  buildVisibleWizardStepIds,
  stepHasVisibleValidationErrors,
} from './rosaHcpWizardNavStepStatus';

const visibleStepIds = buildVisibleWizardStepIds(false);

const mockGetFieldState = (
  impl: (path: string) => { invalid: boolean; isTouched: boolean }
): UseFormGetFieldState<FieldValues> =>
  jest.fn((path: string) => ({
    invalid: impl(path).invalid,
    isTouched: impl(path).isTouched,
    isDirty: false,
    isValidating: false,
    error: undefined,
  })) as UseFormGetFieldState<FieldValues>;

const sections: RosaHcpWizardReviewSection[] = [
  { id: STEP_IDS.DETAILS, label: 'Details', fieldPaths: ['name'] },
  { id: STEP_IDS.NETWORKING, label: 'Networking', fieldPaths: ['region'] },
  { id: STEP_IDS.ENCRYPTION, label: 'Encryption', fieldPaths: ['etcd_key_arn'] },
];

describe('buildVisibleWizardStepIds', () => {
  it('omits cluster-wide proxy when not enabled', () => {
    const ids = buildVisibleWizardStepIds(false);

    expect(ids.has(STEP_IDS.CLUSTER_WIDE_PROXY)).toBe(false);
    expect(ids.has(STEP_IDS.NETWORKING)).toBe(true);
    expect(ids.has(STEP_IDS.ENCRYPTION)).toBe(true);
  });

  it('includes cluster-wide proxy when enabled', () => {
    expect(buildVisibleWizardStepIds(true).has(STEP_IDS.CLUSTER_WIDE_PROXY)).toBe(true);
  });
});

describe('stepHasVisibleValidationErrors', () => {
  it('returns true for touched invalid fields', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'name',
      isTouched: path === 'name',
    }));

    expect(
      stepHasVisibleValidationErrors(['name'], STEP_IDS.DETAILS, getFieldState, new Set())
    ).toBe(true);
  });

  it('returns false for invalid fields that are not touched or revealed', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: true, isTouched: false }));

    expect(
      stepHasVisibleValidationErrors(['name'], STEP_IDS.DETAILS, getFieldState, new Set())
    ).toBe(false);
  });

  it('returns true when validation was attempted on the step', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: true, isTouched: false }));

    expect(
      stepHasVisibleValidationErrors(
        ['name'],
        STEP_IDS.DETAILS,
        getFieldState,
        new Set([STEP_IDS.DETAILS])
      )
    ).toBe(true);
  });
});

describe('buildRosaHcpWizardNavStepStatuses', () => {
  it('marks steps with visible errors and their parent groups', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'name',
      isTouched: path === 'name',
    }));

    const statuses = buildRosaHcpWizardNavStepStatuses({
      sections,
      getFieldState,
      validationAttemptedStepIds: new Set(),
      visibleStepIds,
    });

    expect(statuses[STEP_IDS.DETAILS]).toBe('error');
    expect(statuses[STEP_IDS.BASIC_SETUP]).toBe('error');
    expect(statuses[STEP_IDS.NETWORKING]).toBe('default');
    expect(statuses[STEP_IDS.OPTIONAL_SETUP]).toBe('default');
  });

  it('marks Additional setup when an optional step has a revealed validation error', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: true, isTouched: false }));

    const statuses = buildRosaHcpWizardNavStepStatuses({
      sections,
      getFieldState,
      validationAttemptedStepIds: new Set([STEP_IDS.ENCRYPTION]),
      visibleStepIds,
    });

    expect(statuses[STEP_IDS.ENCRYPTION]).toBe('error');
    expect(statuses[STEP_IDS.OPTIONAL_SETUP]).toBe('error');
    expect(statuses[STEP_IDS.BASIC_SETUP]).toBe('default');
  });
});

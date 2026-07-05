import type { FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import {
  buildRosaHcpWizardReviewSections,
  type RosaHcpWizardReviewSection,
} from '../Steps/Review/rosaHcpWizardReviewSections.data';

import {
  buildOrderedWizardNavStepIds,
  buildRosaHcpWizardNavStepDisabledByValidation,
  buildRosaHcpWizardNavStepStatuses,
  buildVisibleWizardStepIds,
  findActiveWizardNavStepIndexWithPendingValidation,
  findFirstWizardNavStepIndexWithBlockingErrors,
  stepHasAsyncValidationInProgress,
  stepHasNavBlockingValidationErrors,
  stepHasPendingAsyncValidation,
  stepHasVisibleValidationErrors,
} from './rosaHcpWizardNavStepStatus';

const reviewStepLabels = {
  details: 'Details',
  rolesAndPolicies: 'Roles and policies',
  machinePools: 'Machine pools',
  networking: 'Networking',
  clusterWideProxy: 'Cluster-wide proxy',
  encryptionOptional: 'Encryption (optional)',
  clusterUpdatesOptional: 'Cluster updates (optional)',
};

const allReviewSections = buildRosaHcpWizardReviewSections(reviewStepLabels);
const visibleStepIds = buildVisibleWizardStepIds(allReviewSections, false);

const mockGetFieldState = (
  impl: (path: string) => { invalid: boolean; isTouched: boolean; isValidating?: boolean }
): UseFormGetFieldState<FieldValues> =>
  jest.fn((path: string) => ({
    invalid: impl(path).invalid,
    isTouched: impl(path).isTouched,
    isDirty: false,
    isValidating: impl(path).isValidating ?? false,
    error: undefined,
  })) as UseFormGetFieldState<FieldValues>;

const sections: RosaHcpWizardReviewSection[] = [
  { id: STEP_IDS.DETAILS, label: 'Details', fieldPaths: ['name'] },
  { id: STEP_IDS.NETWORKING, label: 'Networking', fieldPaths: ['region'] },
  { id: STEP_IDS.ENCRYPTION, label: 'Encryption', fieldPaths: ['etcd_key_arn'] },
];

describe('buildOrderedWizardNavStepIds', () => {
  it('orders leaf steps ending with Review', () => {
    const ids = buildOrderedWizardNavStepIds(allReviewSections, false);

    expect(ids[0]).toBe(STEP_IDS.DETAILS);
    expect(ids.at(-1)).toBe(STEP_IDS.REVIEW);
    expect(ids).not.toContain(STEP_IDS.CLUSTER_WIDE_PROXY);
  });

  it('includes cluster-wide proxy before optional setup when enabled', () => {
    const ids = buildOrderedWizardNavStepIds(allReviewSections, true);
    const networkingIndex = ids.indexOf(STEP_IDS.NETWORKING);
    const proxyIndex = ids.indexOf(STEP_IDS.CLUSTER_WIDE_PROXY);
    const encryptionIndex = ids.indexOf(STEP_IDS.ENCRYPTION);

    expect(proxyIndex).toBeGreaterThan(networkingIndex);
    expect(encryptionIndex).toBeGreaterThan(proxyIndex);
  });
});

describe('buildVisibleWizardStepIds', () => {
  it('omits cluster-wide proxy when not enabled', () => {
    const ids = buildVisibleWizardStepIds(allReviewSections, false);

    expect(ids.has(STEP_IDS.CLUSTER_WIDE_PROXY)).toBe(false);
    expect(ids.has(STEP_IDS.NETWORKING)).toBe(true);
    expect(ids.has(STEP_IDS.ENCRYPTION)).toBe(true);
  });

  it('includes cluster-wide proxy when enabled', () => {
    expect(
      buildVisibleWizardStepIds(allReviewSections, true).has(STEP_IDS.CLUSTER_WIDE_PROXY)
    ).toBe(true);
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

  it('returns false for touched invalid selects before validation is revealed', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'region',
      isTouched: path === 'region',
    }));

    expect(
      stepHasVisibleValidationErrors(['region'], STEP_IDS.DETAILS, getFieldState, new Set())
    ).toBe(false);
  });

  it('defers nav-visible errors for machine_pools_subnets until validation is revealed', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'machine_pools_subnets',
      isTouched: path === 'machine_pools_subnets',
    }));

    expect(
      stepHasVisibleValidationErrors(
        ['machine_pools_subnets'],
        STEP_IDS.MACHINE_POOLS,
        getFieldState,
        new Set()
      )
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

describe('stepHasNavBlockingValidationErrors', () => {
  it('returns true for touched invalid selects before validation is revealed', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'region',
      isTouched: path === 'region',
    }));

    expect(
      stepHasNavBlockingValidationErrors(['region'], STEP_IDS.DETAILS, getFieldState, new Set())
    ).toBe(true);
  });
});

describe('stepHasPendingAsyncValidation', () => {
  it('returns true when any field on the step is validating', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: false,
      isTouched: false,
      isValidating: path === 'name',
    }));

    expect(stepHasPendingAsyncValidation(['name'], getFieldState)).toBe(true);
  });

  it('returns false when no fields on the step are validating', () => {
    const getFieldState = mockGetFieldState(() => ({
      invalid: false,
      isTouched: false,
      isValidating: false,
    }));

    expect(stepHasPendingAsyncValidation(['name'], getFieldState)).toBe(false);
  });
});

describe('stepHasAsyncValidationInProgress', () => {
  it('returns true when the step is tracked in asyncValidatingStepIds', () => {
    const getFieldState = mockGetFieldState(() => ({
      invalid: false,
      isTouched: false,
      isValidating: false,
    }));

    expect(
      stepHasAsyncValidationInProgress(
        STEP_IDS.DETAILS,
        ['name'],
        getFieldState,
        new Set([STEP_IDS.DETAILS])
      )
    ).toBe(true);
  });

  it('falls back to RHF isValidating when the step is not tracked in context', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: false,
      isTouched: false,
      isValidating: path === 'name',
    }));

    expect(
      stepHasAsyncValidationInProgress(STEP_IDS.DETAILS, ['name'], getFieldState, new Set())
    ).toBe(true);
  });
});

describe('findActiveWizardNavStepIndexWithPendingValidation', () => {
  it('returns the active step index when that step has pending async validation', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: false,
      isTouched: false,
      isValidating: path === 'name',
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    expect(
      findActiveWizardNavStepIndexWithPendingValidation({
        orderedStepIds,
        sections,
        getFieldState,
        activeStepId: STEP_IDS.DETAILS,
      })
    ).toBe(orderedStepIds.indexOf(STEP_IDS.DETAILS));
  });

  it('returns undefined when async validation is pending on a different step', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: false,
      isTouched: false,
      isValidating: path === 'name',
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    expect(
      findActiveWizardNavStepIndexWithPendingValidation({
        orderedStepIds,
        sections,
        getFieldState,
        activeStepId: STEP_IDS.NETWORKING,
      })
    ).toBeUndefined();
  });

  it('returns the active step index when async validation is tracked in context', () => {
    const getFieldState = mockGetFieldState(() => ({
      invalid: false,
      isTouched: false,
      isValidating: false,
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    expect(
      findActiveWizardNavStepIndexWithPendingValidation({
        orderedStepIds,
        sections,
        getFieldState,
        activeStepId: STEP_IDS.DETAILS,
        asyncValidatingStepIds: new Set([STEP_IDS.DETAILS]),
      })
    ).toBe(orderedStepIds.indexOf(STEP_IDS.DETAILS));
  });
});

describe('findFirstWizardNavStepIndexWithBlockingErrors', () => {
  it('returns the earliest ordered step index with a blocking select error', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'region',
      isTouched: path === 'region',
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    expect(
      findFirstWizardNavStepIndexWithBlockingErrors({
        orderedStepIds,
        sections,
        getFieldState,
        validationAttemptedStepIds: new Set(),
      })
    ).toBe(orderedStepIds.indexOf(STEP_IDS.NETWORKING));
  });
});

describe('buildRosaHcpWizardNavStepDisabledByValidation', () => {
  it('disables only steps after the earliest pending async validation from context', () => {
    const getFieldState = mockGetFieldState(() => ({
      invalid: false,
      isTouched: false,
      isValidating: false,
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    const disabled = buildRosaHcpWizardNavStepDisabledByValidation({
      orderedStepIds,
      sections,
      getFieldState,
      validationAttemptedStepIds: new Set(),
      activeStepId: STEP_IDS.DETAILS,
      asyncValidatingStepIds: new Set([STEP_IDS.DETAILS]),
    });

    expect(disabled[STEP_IDS.DETAILS]).toBe(false);
    expect(disabled[STEP_IDS.ROLES_AND_POLICIES]).toBe(true);
    expect(disabled[STEP_IDS.REVIEW]).toBe(true);
  });

  it('disables only steps after the earliest pending async validation from RHF', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: false,
      isTouched: false,
      isValidating: path === 'name',
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    const disabled = buildRosaHcpWizardNavStepDisabledByValidation({
      orderedStepIds,
      sections,
      getFieldState,
      validationAttemptedStepIds: new Set(),
      activeStepId: STEP_IDS.DETAILS,
    });

    expect(disabled[STEP_IDS.DETAILS]).toBe(false);
    expect(disabled[STEP_IDS.ROLES_AND_POLICIES]).toBe(true);
    expect(disabled[STEP_IDS.REVIEW]).toBe(true);
  });

  it('disables only steps after the earliest visible validation error', () => {
    const getFieldState = mockGetFieldState((path) => ({
      invalid: path === 'name',
      isTouched: path === 'name',
    }));
    const orderedStepIds = buildOrderedWizardNavStepIds(allReviewSections, false);

    const disabled = buildRosaHcpWizardNavStepDisabledByValidation({
      orderedStepIds,
      sections,
      getFieldState,
      validationAttemptedStepIds: new Set(),
      activeStepId: STEP_IDS.DETAILS,
    });

    expect(disabled[STEP_IDS.DETAILS]).toBe(false);
    expect(disabled[STEP_IDS.ROLES_AND_POLICIES]).toBe(true);
    expect(disabled[STEP_IDS.REVIEW]).toBe(true);
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

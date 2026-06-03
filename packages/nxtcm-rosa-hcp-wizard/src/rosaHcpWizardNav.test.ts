import type { UseFormGetFieldState, UseFormGetValues } from 'react-hook-form';

import { STEP_IDS } from './constants';
import { buildRosaHcpWizardStepLayout } from './rosaHcpWizardStepLayout';
import {
  buildOrderedNavigableStepIds,
  getNextOrderedStepId,
  isRosaHcpWizardNavStepDisabled,
} from './rosaHcpWizardNav';

const ORDERED = buildOrderedNavigableStepIds(false);

const optionalSetupChildStepIdsByParent = buildRosaHcpWizardStepLayout({
  includeClusterWideProxy: false,
}).childStepIdsByParent;

describe('getNextOrderedStepId', () => {
  it('returns the next leaf step id', () => {
    expect(getNextOrderedStepId(STEP_IDS.DETAILS, ORDERED)).toBe(STEP_IDS.ROLES_AND_POLICIES);
  });

  it('returns undefined on the last step', () => {
    expect(getNextOrderedStepId(STEP_IDS.REVIEW, ORDERED)).toBeUndefined();
  });
});

describe('isRosaHcpWizardNavStepDisabled', () => {
  it('disables future unvisited steps', () => {
    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.ROLES_AND_POLICIES,
        activeStepId: STEP_IDS.DETAILS,
        visitedStepIds: new Set([STEP_IDS.DETAILS]),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
      })
    ).toBe(true);
  });

  it('enables previous steps', () => {
    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.DETAILS,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set([STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES]),
        blockForwardNavigation: true,
        orderedStepIds: ORDERED,
      })
    ).toBe(false);
  });

  it('disables forward visited steps when forward navigation is blocked', () => {
    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.ROLES_AND_POLICIES,
        activeStepId: STEP_IDS.DETAILS,
        visitedStepIds: new Set([STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES]),
        blockForwardNavigation: true,
        orderedStepIds: ORDERED,
      })
    ).toBe(true);
  });

  it('enables forward visited steps when forward navigation is not blocked', () => {
    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.ROLES_AND_POLICIES,
        activeStepId: STEP_IDS.DETAILS,
        visitedStepIds: new Set([STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES]),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
      })
    ).toBe(false);
  });

  it('disables forward steps that were invalidated after a reset-source edit', () => {
    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.MACHINE_POOLS,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set([STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES]),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
      })
    ).toBe(true);
  });

  it('disables forward visited steps after an earlier step has validation errors', () => {
    const machinePoolsIdx = ORDERED.indexOf(STEP_IDS.MACHINE_POOLS);

    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.REVIEW,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set(ORDERED),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
        earliestInvalidStepIdx: machinePoolsIdx,
      })
    ).toBe(true);
  });

  it('allows navigating to the step that has validation errors so the user can fix them', () => {
    const machinePoolsIdx = ORDERED.indexOf(STEP_IDS.MACHINE_POOLS);

    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.MACHINE_POOLS,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set(ORDERED),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
        earliestInvalidStepIdx: machinePoolsIdx,
      })
    ).toBe(false);
  });

  it('disables the Additional setup parent when every child step is blocked', () => {
    const detailsIdx = ORDERED.indexOf(STEP_IDS.DETAILS);

    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.OPTIONAL_SETUP,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set(ORDERED),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
        earliestInvalidStepIdx: detailsIdx,
        childStepIdsByParent: optionalSetupChildStepIdsByParent,
      })
    ).toBe(true);
  });

  it('enables the Additional setup parent when the invalid child step itself is reachable', () => {
    const encryptionIdx = ORDERED.indexOf(STEP_IDS.ENCRYPTION);

    expect(
      isRosaHcpWizardNavStepDisabled({
        targetStepId: STEP_IDS.OPTIONAL_SETUP,
        activeStepId: STEP_IDS.ROLES_AND_POLICIES,
        visitedStepIds: new Set(ORDERED),
        blockForwardNavigation: false,
        orderedStepIds: ORDERED,
        earliestInvalidStepIdx: encryptionIdx,
        childStepIdsByParent: optionalSetupChildStepIdsByParent,
      })
    ).toBe(false);
  });
});

describe('findEarliestOrderedStepIndexWithValidationIssues', () => {
  const machinePoolsSection = {
    id: STEP_IDS.MACHINE_POOLS,
    fieldPaths: ['min_replicas', 'max_replicas', 'machine_type'],
  };

  const mockGetFieldState = (
    impl: Record<string, { invalid?: boolean }>
  ): UseFormGetFieldState<Record<string, unknown>> =>
    jest.fn((path: string) => ({
      invalid: impl[path]?.invalid ?? false,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      error: undefined,
    })) as unknown as UseFormGetFieldState<Record<string, unknown>>;

  it('returns the index of the earliest step with field validation errors', async () => {
    const { findEarliestOrderedStepIndexWithValidationIssues } = await import('./rosaHcpWizardNav');

    expect(
      findEarliestOrderedStepIndexWithValidationIssues({
        reviewSections: [machinePoolsSection],
        orderedStepIds: ORDERED,
        getFieldState: mockGetFieldState({ max_replicas: { invalid: true } }),
        errors: {},
      })
    ).toBe(ORDERED.indexOf(STEP_IDS.MACHINE_POOLS));
  });

  it('returns -1 when no step has validation errors', async () => {
    const { findEarliestOrderedStepIndexWithValidationIssues } = await import('./rosaHcpWizardNav');

    expect(
      findEarliestOrderedStepIndexWithValidationIssues({
        reviewSections: [machinePoolsSection],
        orderedStepIds: ORDERED,
        getFieldState: mockGetFieldState({}),
        errors: {},
      })
    ).toBe(-1);
  });
});

describe('trimVisitedStepIdsAfter', () => {
  it('removes leaf steps after the active step but keeps parent step ids', async () => {
    const { trimVisitedStepIdsAfter } = await import('./rosaHcpWizardNav');
    const visited = new Set([
      STEP_IDS.DETAILS,
      STEP_IDS.ROLES_AND_POLICIES,
      STEP_IDS.MACHINE_POOLS,
      STEP_IDS.NETWORKING,
      STEP_IDS.ENCRYPTION,
      STEP_IDS.REVIEW,
      STEP_IDS.BASIC_SETUP,
    ]);

    expect(trimVisitedStepIdsAfter(visited, STEP_IDS.DETAILS, ORDERED)).toEqual(
      new Set([STEP_IDS.DETAILS, STEP_IDS.BASIC_SETUP])
    );
  });

  it('keeps steps up to and including the active step when trimming mid-wizard', async () => {
    const { trimVisitedStepIdsAfter } = await import('./rosaHcpWizardNav');
    const visited = new Set([
      STEP_IDS.DETAILS,
      STEP_IDS.ROLES_AND_POLICIES,
      STEP_IDS.MACHINE_POOLS,
      STEP_IDS.NETWORKING,
      STEP_IDS.REVIEW,
    ]);

    expect(trimVisitedStepIdsAfter(visited, STEP_IDS.ROLES_AND_POLICIES, ORDERED)).toEqual(
      new Set([STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES])
    );
  });
});

describe('rosaHcpWizardBlockForwardNavigation', () => {
  const detailsBaseline = {
    name: 'my-cluster',
    billing_account_id: 'billing-a',
    region: 'us-east-1',
    cluster_version: '4.14.0',
    associated_aws_id: 'aws-1',
  };

  const mockGetFieldState = (
    impl: Record<
      string,
      { isDirty?: boolean; isTouched?: boolean; invalid?: boolean; isValidating?: boolean }
    >
  ): UseFormGetFieldState<Record<string, unknown>> =>
    jest.fn((path: string) => ({
      invalid: impl[path]?.invalid ?? false,
      isDirty: impl[path]?.isDirty ?? false,
      isTouched: impl[path]?.isTouched ?? false,
      isValidating: impl[path]?.isValidating ?? false,
      error: undefined,
    })) as unknown as UseFormGetFieldState<Record<string, unknown>>;

  it('does not block when the user only changes billing on a revisited details step', async () => {
    const { rosaHcpWizardBlockForwardNavigation } = await import('./rosaHcpWizardNav');
    const { clusterValidationSchema } = await import('./yupSchemas');
    const detailsFieldPaths = Object.keys(detailsBaseline);
    const getValues = jest.fn((path: string) => {
      if (path === 'billing_account_id') return 'billing-b';
      return detailsBaseline[path as keyof typeof detailsBaseline];
    }) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardBlockForwardNavigation({
        activeStepFieldPaths: detailsFieldPaths,
        getValues,
        getFieldState: mockGetFieldState({
          billing_account_id: { isDirty: true, isTouched: true },
        }),
        errors: {},
        schema: clusterValidationSchema,
        describeOptions: undefined,
        stepDependencyBaseline: detailsBaseline,
      })
    ).toBe(false);
  });

  it('blocks when the user changes a reset-source field on the active step', async () => {
    const { rosaHcpWizardBlockForwardNavigation } = await import('./rosaHcpWizardNav');
    const { clusterValidationSchema } = await import('./yupSchemas');
    const getValues = jest.fn((path: string) =>
      path === 'region' ? 'us-west-2' : detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardBlockForwardNavigation({
        activeStepFieldPaths: Object.keys(detailsBaseline),
        getValues,
        getFieldState: mockGetFieldState({
          region: { isDirty: true, isTouched: true },
        }),
        errors: {},
        schema: clusterValidationSchema,
        describeOptions: undefined,
        stepDependencyBaseline: detailsBaseline,
      })
    ).toBe(true);
  });

  it('blocks when async cluster name validation is in progress on an engaged field', async () => {
    const { rosaHcpWizardBlockForwardNavigation } = await import('./rosaHcpWizardNav');
    const { clusterValidationSchema } = await import('./yupSchemas');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? 'new-cluster' : detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardBlockForwardNavigation({
        activeStepFieldPaths: Object.keys(detailsBaseline),
        getValues,
        getFieldState: mockGetFieldState({
          name: { isDirty: true, isTouched: true, isValidating: true },
        }),
        errors: {},
        schema: clusterValidationSchema,
        describeOptions: undefined,
        stepDependencyBaseline: detailsBaseline,
      })
    ).toBe(true);
  });
});

describe('rosaHcpWizardAsyncValidationInProgress', () => {
  const detailsBaseline = {
    name: 'my-cluster',
    billing_account_id: 'billing-a',
    region: 'us-east-1',
  };

  const mockGetFieldState = (
    impl: Record<string, { isDirty?: boolean; isTouched?: boolean; isValidating?: boolean }>
  ): UseFormGetFieldState<Record<string, unknown>> =>
    jest.fn((path: string) => ({
      invalid: false,
      isDirty: impl[path]?.isDirty ?? false,
      isTouched: impl[path]?.isTouched ?? false,
      isValidating: impl[path]?.isValidating ?? false,
      error: undefined,
    })) as unknown as UseFormGetFieldState<Record<string, unknown>>;

  it('returns false when name is validating but not on the active step', async () => {
    const { rosaHcpWizardAsyncValidationInProgress } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? 'new-cluster' : detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardAsyncValidationInProgress(
        ['billing_account_id', 'region'],
        mockGetFieldState({ name: { isDirty: true, isTouched: true, isValidating: true } }),
        getValues,
        detailsBaseline
      )
    ).toBe(false);
  });

  it('returns false when name is validating but the user has not engaged the field since step entry', async () => {
    const { rosaHcpWizardAsyncValidationInProgress } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn(
      (path: string) => detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardAsyncValidationInProgress(
        ['name', 'billing_account_id', 'region'],
        mockGetFieldState({ name: { isValidating: true } }),
        getValues,
        detailsBaseline
      )
    ).toBe(false);
  });

  it('returns true when name is validating and the user engaged the field since step entry', async () => {
    const { rosaHcpWizardAsyncValidationInProgress } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? 'new-cluster' : detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardAsyncValidationInProgress(
        ['name', 'billing_account_id', 'region'],
        mockGetFieldState({ name: { isDirty: true, isTouched: true, isValidating: true } }),
        getValues,
        detailsBaseline
      )
    ).toBe(true);
  });

  it('returns true when async validation is tracked outside RHF isValidating', async () => {
    const { rosaHcpWizardAsyncValidationInProgress } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? 'new-cluster' : detailsBaseline[path as keyof typeof detailsBaseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardAsyncValidationInProgress(
        ['name', 'billing_account_id', 'region'],
        mockGetFieldState({ name: { isDirty: true, isTouched: true } }),
        getValues,
        detailsBaseline,
        new Set(['name'])
      )
    ).toBe(true);
  });
});

describe('rosaHcpWizardActiveStepHasValidationIssues', () => {
  const baseline = {
    name: 'my-cluster',
    billing_account_id: 'billing-a',
    region: 'us-east-1',
  };

  const mockGetFieldState = (
    impl: Record<string, { isDirty?: boolean; isTouched?: boolean; invalid?: boolean }>
  ): UseFormGetFieldState<Record<string, unknown>> =>
    jest.fn((path: string) => ({
      invalid: impl[path]?.invalid ?? false,
      isDirty: impl[path]?.isDirty ?? false,
      isTouched: impl[path]?.isTouched ?? false,
      isValidating: false,
      error: undefined,
    })) as unknown as UseFormGetFieldState<Record<string, unknown>>;

  it('does not block when an untouched field is invalid but the user only changed billing', async () => {
    const { rosaHcpWizardActiveStepHasValidationIssues } = await import('./rosaHcpWizardNav');
    const { clusterValidationSchema } = await import('./yupSchemas');
    const getValues = jest.fn((path: string) => {
      if (path === 'billing_account_id') return 'billing-b';
      if (path === 'name') return 'my-cluster';
      return baseline[path as keyof typeof baseline];
    }) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardActiveStepHasValidationIssues(
        ['name', 'billing_account_id', 'region'],
        getValues,
        mockGetFieldState({
          name: { invalid: true, isDirty: true, isTouched: true },
          billing_account_id: { isDirty: true, isTouched: true },
        }),
        {},
        clusterValidationSchema,
        undefined,
        baseline
      )
    ).toBe(false);
  });

  it('blocks when the user clears a required field they engaged since step entry', async () => {
    const { rosaHcpWizardActiveStepHasValidationIssues } = await import('./rosaHcpWizardNav');
    const { clusterValidationSchema } = await import('./yupSchemas');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? '' : baseline[path as keyof typeof baseline]
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardActiveStepHasValidationIssues(
        ['name', 'billing_account_id', 'region'],
        getValues,
        mockGetFieldState({ name: { isDirty: true, isTouched: true } }),
        {},
        clusterValidationSchema,
        undefined,
        baseline
      )
    ).toBe(true);
  });
});

describe('rosaHcpWizardResetSourceValuesChanged', () => {
  const mockGetFieldState = (
    impl: Record<string, { isDirty?: boolean; isTouched?: boolean }>
  ): UseFormGetFieldState<Record<string, unknown>> =>
    jest.fn((path: string) => ({
      invalid: false,
      isDirty: impl[path]?.isDirty ?? false,
      isTouched: impl[path]?.isTouched ?? false,
      isValidating: false,
      error: undefined,
    })) as unknown as UseFormGetFieldState<Record<string, unknown>>;

  it('returns false when values match the step-entry baseline', async () => {
    const { rosaHcpWizardResetSourceValuesChanged } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'region' ? 'us-east-1' : 'cluster'
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardResetSourceValuesChanged(['region', 'name'], getValues, mockGetFieldState({}), {
        region: 'us-east-1',
        name: 'cluster',
      })
    ).toBe(false);
  });

  it('returns false when a reset-source value changed programmatically without user engagement', async () => {
    const { rosaHcpWizardResetSourceValuesChanged } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'region' ? 'us-west-2' : 'cluster'
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardResetSourceValuesChanged(['region', 'name'], getValues, mockGetFieldState({}), {
        region: 'us-east-1',
        name: 'cluster',
      })
    ).toBe(false);
  });

  it('returns false when the user changed a field without resetsFieldsToDefaultOnChange meta', async () => {
    const { rosaHcpWizardResetSourceValuesChanged } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'name' ? 'new-cluster' : 'us-east-1'
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardResetSourceValuesChanged(
        ['region', 'name'],
        getValues,
        mockGetFieldState({ name: { isDirty: true } }),
        { region: 'us-east-1', name: 'old-cluster' }
      )
    ).toBe(false);
  });

  it('returns true when the user changed a reset-source field since step entry', async () => {
    const { rosaHcpWizardResetSourceValuesChanged } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'region' ? 'us-west-2' : 'cluster'
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardResetSourceValuesChanged(
        ['region', 'name'],
        getValues,
        mockGetFieldState({ region: { isDirty: true } }),
        { region: 'us-east-1', name: 'cluster' }
      )
    ).toBe(true);
  });

  it('stays true when a latched reset-source field is restored to its step-entry value', async () => {
    const { rosaHcpWizardResetSourceValuesChanged } = await import('./rosaHcpWizardNav');
    const getValues = jest.fn((path: string) =>
      path === 'region' ? 'us-east-1' : 'cluster'
    ) as unknown as UseFormGetValues<Record<string, unknown>>;

    expect(
      rosaHcpWizardResetSourceValuesChanged(
        ['region', 'name'],
        getValues,
        mockGetFieldState({ region: { isDirty: true, isTouched: true } }),
        { region: 'us-east-1', name: 'cluster' },
        new Set(['region'])
      )
    ).toBe(true);
  });
});

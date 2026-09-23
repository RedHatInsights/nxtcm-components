import type { FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import {
  isRosaHcpWizardBackDisabled,
  isRosaHcpWizardSkipToReviewVisible,
  pathsHaveValidationIssues,
} from './rosaHcpWizardFooter.utils';

const mockGetFieldState = (
  impl: (path: string) => { invalid: boolean }
): UseFormGetFieldState<FieldValues> =>
  jest.fn((path: string) => ({
    invalid: impl(path).invalid,
    isTouched: false,
    isDirty: false,
    isValidating: false,
    error: undefined,
  })) as UseFormGetFieldState<FieldValues>;

describe('isRosaHcpWizardBackDisabled', () => {
  it('disables Back on the Details step', () => {
    expect(isRosaHcpWizardBackDisabled(STEP_IDS.DETAILS)).toBe(true);
  });

  it('enables Back on later steps', () => {
    expect(isRosaHcpWizardBackDisabled(STEP_IDS.ROLES_AND_POLICIES)).toBe(false);
    expect(isRosaHcpWizardBackDisabled(STEP_IDS.NETWORKING)).toBe(false);
  });
});

describe('pathsHaveValidationIssues', () => {
  it('returns true when getFieldState reports invalid', () => {
    const getFieldState = mockGetFieldState((path) => ({ invalid: path === 'name' }));
    expect(pathsHaveValidationIssues(['name', 'region'], getFieldState, {})).toBe(true);
  });

  it('returns true when errors exist but getFieldState.invalid is false', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: false }));
    expect(
      pathsHaveValidationIssues(['name'], getFieldState, {
        name: { type: 'required', message: 'Required' },
      })
    ).toBe(true);
  });

  it('returns false when there are no field errors', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: false }));
    expect(pathsHaveValidationIssues(['name', 'region'], getFieldState, {})).toBe(false);
  });

  it('ignores stale resolver errors after a successful trigger when ignoreResolverErrors is set', () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: false }));
    expect(
      pathsHaveValidationIssues(
        ['name'],
        getFieldState,
        { name: { type: 'required', message: 'Required' } },
        { ignoreResolverErrors: true }
      )
    ).toBe(false);
  });
});

describe('isRosaHcpWizardSkipToReviewVisible', () => {
  it('shows Skip to review on Additional setup substeps only', () => {
    expect(isRosaHcpWizardSkipToReviewVisible(STEP_IDS.ENCRYPTION)).toBe(true);
    expect(isRosaHcpWizardSkipToReviewVisible(STEP_IDS.CLUSTER_UPDATES)).toBe(true);
  });

  it('hides Skip to review on other steps', () => {
    expect(isRosaHcpWizardSkipToReviewVisible(STEP_IDS.DETAILS)).toBe(false);
    expect(isRosaHcpWizardSkipToReviewVisible(STEP_IDS.REVIEW)).toBe(false);
    expect(isRosaHcpWizardSkipToReviewVisible(STEP_IDS.OPTIONAL_SETUP)).toBe(false);
  });
});

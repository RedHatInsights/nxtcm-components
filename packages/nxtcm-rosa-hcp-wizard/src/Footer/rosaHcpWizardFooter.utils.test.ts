import type { UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import { WizardFieldPath, WizardFormValues } from '../types';
import {
  findFirstInvalidFocusTarget,
  isRosaHcpWizardBackDisabled,
  isRosaHcpWizardSkipToReviewVisible,
  pathsHaveValidationIssues,
} from './rosaHcpWizardFooter.utils';

const mockGetFieldState = (
  impl: (path: WizardFieldPath) => { invalid: boolean }
): UseFormGetFieldState<WizardFormValues> =>
  jest.fn((path: WizardFieldPath) => ({
    invalid: impl(path).invalid,
    isTouched: false,
    isDirty: false,
    isValidating: false,
    error: undefined,
  }));

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

describe('findFirstInvalidFocusTarget', () => {
  const render = (html: string): HTMLElement => {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container;
  };

  it('returns the first aria-invalid control in document order', () => {
    const container = render(
      '<input id="valid" aria-invalid="false" /><input id="first" aria-invalid="true" /><input id="second" aria-invalid="true" />'
    );
    expect(findFirstInvalidFocusTarget(container)?.id).toBe('first');
  });

  it('falls back to a focusable descendant when the flag is on a wrapper', () => {
    const container = render(
      '<div aria-invalid="true"><span>label</span><button id="inner">Choose</button></div>'
    );
    expect(findFirstInvalidFocusTarget(container)?.id).toBe('inner');
  });

  it('skips invalid wrappers and disabled controls that cannot take focus', () => {
    const container = render(
      '<div aria-invalid="true"><span>nothing focusable</span></div><input id="disabled" aria-invalid="true" disabled /><input id="target" aria-invalid="true" />'
    );
    expect(findFirstInvalidFocusTarget(container)?.id).toBe('target');
  });

  it('skips invalid controls inside collapsed or inert sections', () => {
    const container = render(
      '<div hidden><input id="collapsed" aria-invalid="true" /></div><div inert><input id="inert" aria-invalid="true" /></div><input id="target" aria-invalid="true" />'
    );
    expect(findFirstInvalidFocusTarget(container)?.id).toBe('target');
  });

  it('skips a hidden focusable descendant of an invalid wrapper in favor of a visible one', () => {
    const container = render(
      '<div aria-invalid="true"><button id="hidden" hidden>Hidden</button><button id="visible">Choose</button></div>'
    );
    expect(findFirstInvalidFocusTarget(container)?.id).toBe('visible');
  });

  it('returns null when every invalid control is hidden', () => {
    expect(
      findFirstInvalidFocusTarget(render('<div hidden><input aria-invalid="true" /></div>'))
    ).toBeNull();
  });

  it('returns null when nothing is invalid', () => {
    expect(findFirstInvalidFocusTarget(render('<input aria-invalid="false" />'))).toBeNull();
  });
});

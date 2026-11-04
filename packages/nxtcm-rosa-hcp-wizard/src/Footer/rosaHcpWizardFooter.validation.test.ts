import { createFormControl, type UseFormGetFieldState } from 'react-hook-form';

import type { RosaHcpWizardReviewSection } from '../Steps/Review/rosaHcpWizardReviewSections.data';
import { WizardFieldPath, WizardFormValues } from '../types';
import {
  markSectionsWithValidationErrors,
  reconcileValidationAttemptedFlags,
  touchInvalidPaths,
} from './rosaHcpWizardFooter.validation';

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

describe('touchInvalidPaths', () => {
  it('touches only invalid paths', () => {
    const form = createFormControl<WizardFormValues>({
      defaultValues: { name: 'x', region: '' },
    });
    form.setError('name', { type: 'required' });

    const setValueSpy = jest.spyOn(form, 'setValue');

    touchInvalidPaths(['name', 'region'], form.getFieldState, form.getValues, form.setValue);

    expect(setValueSpy).toHaveBeenCalledTimes(1);
    expect(setValueSpy).toHaveBeenCalledWith('name', 'x', {
      shouldTouch: true,
      shouldValidate: false,
    });
  });
});

describe('reconcileValidationAttemptedFlags', () => {
  it('clears attempted when trigger passes even if getFieldState still reports invalid', async () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: true }));
    const clearValidationAttempted = jest.fn();
    const trigger = jest.fn().mockResolvedValue(true);

    const becameValid = await reconcileValidationAttemptedFlags({
      isReviewStep: false,
      stepIdAtStart: 'encryption-step',
      getCurrentStepId: () => 'encryption-step',
      stepFieldPaths: ['etcd_key_arn'],
      reviewSections: [],
      trigger,
      getFieldState,
      errors: {},
      clearValidationAttempted,
    });

    expect(clearValidationAttempted).toHaveBeenCalledWith('encryption-step');
    expect(becameValid).toBe(true);
  });

  it('clears attempted when trigger passes and fieldState is valid despite stale resolver errors', async () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: false }));
    const clearValidationAttempted = jest.fn();
    const trigger = jest.fn().mockResolvedValue(true);

    const becameValid = await reconcileValidationAttemptedFlags({
      isReviewStep: false,
      stepIdAtStart: 'details-step',
      getCurrentStepId: () => 'details-step',
      stepFieldPaths: ['name'],
      reviewSections: [],
      trigger,
      getFieldState,
      errors: { name: { type: 'required', message: 'Required' } },
      clearValidationAttempted,
    });

    expect(clearValidationAttempted).toHaveBeenCalledWith('details-step');
    expect(becameValid).toBe(true);
  });

  it('clears attempted when trigger fails but getFieldState is valid (ignores stale resolver errors)', async () => {
    const getFieldState = mockGetFieldState(() => ({ invalid: false }));
    const clearValidationAttempted = jest.fn();
    const trigger = jest.fn().mockResolvedValue(false);

    const becameValid = await reconcileValidationAttemptedFlags({
      isReviewStep: false,
      stepIdAtStart: 'encryption-step',
      getCurrentStepId: () => 'encryption-step',
      stepFieldPaths: ['etcd_key_arn'],
      reviewSections: [],
      trigger,
      getFieldState,
      errors: { etcd_key_arn: { type: 'required', message: 'Required' } },
      clearValidationAttempted,
    });

    expect(clearValidationAttempted).toHaveBeenCalledWith('encryption-step');
    expect(becameValid).toBe(true);
  });

  it('on Review, reconciles sections after a single form trigger without per-section trigger', async () => {
    const getFieldState = mockGetFieldState((path) => ({ invalid: path === 'name' }));
    const clearValidationAttempted = jest.fn();
    const trigger = jest.fn().mockResolvedValue(false);
    const reviewSections: RosaHcpWizardReviewSection[] = [
      { id: 'details', label: 'Details', fieldPaths: ['name'] },
      { id: 'networking', label: 'Networking', fieldPaths: ['region'] },
    ];

    await reconcileValidationAttemptedFlags({
      isReviewStep: true,
      stepIdAtStart: 'review',
      getCurrentStepId: () => 'review',
      stepFieldPaths: [],
      reviewSections,
      trigger,
      getFieldState,
      errors: {},
      clearValidationAttempted,
    });

    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith();
    expect(clearValidationAttempted).toHaveBeenCalledWith('networking');
    expect(clearValidationAttempted).not.toHaveBeenCalledWith('details');
    expect(clearValidationAttempted).not.toHaveBeenCalledWith('review');
  });
});

describe('markSectionsWithValidationErrors', () => {
  const sections: RosaHcpWizardReviewSection[] = [
    { id: 'details', label: 'Details', fieldPaths: ['name'] },
    { id: 'networking', label: 'Networking', fieldPaths: ['region'] },
  ];

  it('marks sections with invalid fields and an optional review step', () => {
    const getFieldState = mockGetFieldState((path) => ({ invalid: path === 'name' }));
    const markValidationAttempted = jest.fn();

    markSectionsWithValidationErrors(sections, getFieldState, {}, markValidationAttempted, {
      alsoMarkStepId: 'review',
    });

    expect(markValidationAttempted).toHaveBeenCalledTimes(2);
    expect(markValidationAttempted).toHaveBeenCalledWith('details');
    expect(markValidationAttempted).toHaveBeenCalledWith('review');
  });
});

import type { FieldValues, UseFormGetFieldState } from 'react-hook-form';

import { STEP_IDS } from './constants';
import {
  stepOrChildHasFormValidationIssues,
  stepOrChildHasValidationError,
  isWizardFieldActiveForStepValidation,
} from './rosaHcpWizardStepHierarchy';
import { getRosaHcpWizardStepStatus } from './rosaHcpWizardValidationContext';

const childStepIdsByParent = {
  [STEP_IDS.BASIC_SETUP]: [STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES],
};

describe('getRosaHcpWizardStepStatus', () => {
  it('returns error when the step has validation errors revealed', () => {
    expect(getRosaHcpWizardStepStatus(STEP_IDS.DETAILS, new Set([STEP_IDS.DETAILS]))).toBe('error');
  });

  it('returns default when the step has no revealed validation errors', () => {
    expect(
      getRosaHcpWizardStepStatus(STEP_IDS.DETAILS, new Set([STEP_IDS.ROLES_AND_POLICIES]))
    ).toBe('default');
    expect(getRosaHcpWizardStepStatus(STEP_IDS.DETAILS, new Set())).toBe('default');
  });

  it('returns error on a parent step when a child step has validation errors', () => {
    expect(
      getRosaHcpWizardStepStatus(
        STEP_IDS.BASIC_SETUP,
        new Set([STEP_IDS.DETAILS]),
        childStepIdsByParent
      )
    ).toBe('error');
  });

  it('returns default on a parent step when no child has validation errors', () => {
    expect(getRosaHcpWizardStepStatus(STEP_IDS.BASIC_SETUP, new Set(), childStepIdsByParent)).toBe(
      'default'
    );
  });

  it('returns error when the step has live form validation issues', () => {
    expect(getRosaHcpWizardStepStatus(STEP_IDS.MACHINE_POOLS, new Set(), undefined, true)).toBe(
      'error'
    );
  });

  it('returns default when neither revealed nor live validation issues exist', () => {
    expect(getRosaHcpWizardStepStatus(STEP_IDS.MACHINE_POOLS, new Set(), undefined, false)).toBe(
      'default'
    );
  });
});

describe('stepOrChildHasValidationError', () => {
  it('returns true for a parent when any listed child has errors', () => {
    expect(
      stepOrChildHasValidationError(
        STEP_IDS.BASIC_SETUP,
        new Set([STEP_IDS.DETAILS]),
        childStepIdsByParent
      )
    ).toBe(true);
  });
});

describe('stepOrChildHasFormValidationIssues', () => {
  const machinePoolsSections = [
    {
      id: STEP_IDS.MACHINE_POOLS,
      fieldPaths: ['min_replicas', 'max_replicas', 'nodes_compute'],
    },
  ] as const;

  it('returns true when a visible step field is invalid and touched', () => {
    const getFieldState = jest.fn((path: string) => ({
      invalid: path === 'max_replicas',
      isTouched: path === 'max_replicas',
      isDirty: true,
      isValidating: false,
      error:
        path === 'max_replicas'
          ? { type: 'validate', message: 'Max nodes must be greater than or equal to min nodes.' }
          : undefined,
    })) as UseFormGetFieldState<FieldValues>;

    expect(
      stepOrChildHasFormValidationIssues(
        STEP_IDS.MACHINE_POOLS,
        machinePoolsSections,
        getFieldState,
        {},
        { formValues: { autoscaling: true }, isFieldActive: isWizardFieldActiveForStepValidation }
      )
    ).toBe(true);
  });

  it('returns false when replica fields are invalid but autoscaling is disabled', () => {
    const getFieldState = jest.fn((path: string) => ({
      invalid: path === 'max_replicas' || path === 'min_replicas',
      isTouched: true,
      isDirty: true,
      isValidating: false,
      error: { type: 'validate', message: 'Max nodes must be greater than or equal to min nodes.' },
    })) as UseFormGetFieldState<FieldValues>;

    expect(
      stepOrChildHasFormValidationIssues(
        STEP_IDS.MACHINE_POOLS,
        machinePoolsSections,
        getFieldState,
        {},
        { formValues: { autoscaling: false }, isFieldActive: isWizardFieldActiveForStepValidation }
      )
    ).toBe(false);
  });

  it('returns false when invalid fields are untouched and validation was not attempted', () => {
    const getFieldState = jest.fn(() => ({
      invalid: true,
      isTouched: false,
      isDirty: false,
      isValidating: false,
      error: { type: 'required', message: 'Required' },
    })) as UseFormGetFieldState<FieldValues>;

    expect(
      stepOrChildHasFormValidationIssues(
        STEP_IDS.MACHINE_POOLS,
        machinePoolsSections,
        getFieldState,
        { max_replicas: { type: 'required', message: 'Required' } },
        { formValues: { autoscaling: true }, isFieldActive: isWizardFieldActiveForStepValidation }
      )
    ).toBe(false);
  });
});

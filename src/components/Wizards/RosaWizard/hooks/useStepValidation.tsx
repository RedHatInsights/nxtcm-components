import React from 'react';

import { useStore } from '@tanstack/react-form';
import { useWizardContext } from '@patternfly/react-core';

import { useRosaForm } from '../RosaFormContext';
import {
  STEP_FIELDS,
  PARENT_STEP_CHILDREN,
  stepHasErrors,
  type FieldMetaLike,
} from './stepFieldsConfig';

export { STEP_IDS, STEP_FIELDS, computeStepErrors } from './stepFieldsConfig';

type StepStatus = 'default' | 'error';

/* ────────────────────── Helpers ────────────────────── */

/**
 * Marks every field in the given wizard step as touched so that
 * validation errors become visible in the UI. Called on "Next" click
 * to reveal errors on fields the user hasn't interacted with yet.
 */
export function markStepFieldsTouched(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: { setFieldMeta: (path: any, updater: (prev: any) => any) => void },
  stepId: string,
): void {
  const fields = STEP_FIELDS[stepId];
  if (!fields) return;
  for (const f of fields) {
    form.setFieldMeta(f, (prev: Record<string, unknown>) => ({ ...prev, isTouched: true }));
  }
}

/* ────────────────────── Hooks ────────────────────── */

/**
 * Returns true if the currently active wizard step has touched field-level
 * errors in the form's `fieldMeta`. Must be called within both Wizard and
 * Form contexts.
 */
export function useCurrentStepHasErrors(): boolean {
  const form = useRosaForm();
  const { activeStep } = useWizardContext();
  const stepId = String(activeStep.id);

  return useStore(form.store, (s) => stepHasErrors(s.fieldMeta as FieldMetaLike, stepId));
}

/**
 * Reads `fieldMeta` directly from a TanStack Form store and returns a
 * PF6-compatible `status` for every step. Designed to be called at the
 * level where the store is already available (e.g. `RosaWizardBody`),
 * so it does not require `useRosaForm()` context.
 *
 * Uses a stable string key internally so the component only re-renders
 * when the set of errored steps actually changes.
 */
export function useStepStatusesFromStore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: { state: any; subscribe: any },
): Record<string, StepStatus> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorKey = useStore(store as any, (s: unknown) => {
    const fieldMeta = ((s as Record<string, unknown>).fieldMeta ?? {}) as FieldMetaLike;
    const parts: string[] = [];
    for (const id of Object.keys(STEP_FIELDS)) {
      if (stepHasErrors(fieldMeta, id)) parts.push(id);
    }
    return parts.join(',');
  });

  return React.useMemo(() => {
    const errored = new Set(errorKey ? errorKey.split(',') : []);
    const result: Record<string, StepStatus> = {};

    for (const id of Object.keys(STEP_FIELDS)) {
      result[id] = errored.has(id) ? 'error' : 'default';
    }

    for (const [parentId, childIds] of Object.entries(PARENT_STEP_CHILDREN)) {
      result[parentId] = childIds.some((id) => result[id] === 'error') ? 'error' : 'default';
    }

    return result;
  }, [errorKey]);
}

/**
 * Checks form `fieldMeta` for a specific step's fields and returns
 * whether that step currently has validation errors on touched fields.
 * Reads from the store directly so it can be used outside `form.AppForm`.
 */
export function useStepHasErrorsFromStore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: { state: any; subscribe: any },
  stepId: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useStore(store as any, (s: unknown) =>
    stepHasErrors(((s as Record<string, unknown>).fieldMeta ?? {}) as FieldMetaLike, stepId),
  );
}

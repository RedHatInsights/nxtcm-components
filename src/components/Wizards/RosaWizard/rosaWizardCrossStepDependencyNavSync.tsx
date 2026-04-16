import { useWizardContext } from '@patternfly/react-core';
import { useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { RosaWizardFormData } from '../types';
import { rosaCrossStepDependencySourceFieldPaths } from './rosaCrossStepDependencySourceFieldPaths';

const DEP_PATHS = [...rosaCrossStepDependencySourceFieldPaths] as const;

/**
 * Keeps PatternFly wizard `isVisited` in sync with cross-step dependency edits:
 * if the user has been further ahead than the active step and any dependency source
 * field no longer matches the snapshot from the last forward navigation, clears
 * `isVisited` on all steps after the active one so PatternFly Wizard `isVisitRequired`
 * disables those nav items while Next still advances step-by-step.
 */
export function RosaWizardCrossStepDependencyNavSync() {
  const { activeStep, steps, setStep } = useWizardContext();
  const { control } = useFormContext<RosaWizardFormData>();

  const depTuple = useWatch({ control, name: DEP_PATHS });

  const serializedDeps = useMemo(() => JSON.stringify(depTuple), [depTuple]);

  const prevActiveIndexRef = useRef<number | null>(null);
  const forwardBaselineSerializedRef = useRef('');
  const maxReachedIndexRef = useRef(0);
  /** PatternFly merges `steps` every render; listing it in this effect's deps caused an infinite loop after `setStep` (each call always produces a new steps array). */
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    const idx = activeStep.index;

    if (prevActiveIndexRef.current === null) {
      forwardBaselineSerializedRef.current = serializedDeps;
      maxReachedIndexRef.current = idx;
      prevActiveIndexRef.current = idx;
      return;
    }

    if (idx > prevActiveIndexRef.current) {
      forwardBaselineSerializedRef.current = serializedDeps;
    }
    maxReachedIndexRef.current = Math.max(maxReachedIndexRef.current, idx);
    prevActiveIndexRef.current = idx;

    const lockout =
      maxReachedIndexRef.current > idx && serializedDeps !== forwardBaselineSerializedRef.current;

    if (lockout) {
      for (const s of stepsRef.current) {
        if (s.index > idx && s.isVisited) {
          setStep({ id: s.id, isVisited: false });
        }
      }
    }
  }, [activeStep.index, serializedDeps, setStep]);

  return null;
}

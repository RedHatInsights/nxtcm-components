import { useCallback, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { STEP_IDS } from '../constants';
import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import { hasRefetchableStringValue } from '../utilities/hasRefetchableStringValue';
import type { CheckClusterNameUniqueness, ROSAHCPCluster } from '../types';
import { useRosaHcpWizardValidators } from '../stringsProvider/RosaHcpWizardStringsContext';
import { validateClusterNameSync } from '../yupSchemas/helpers';

export const CLUSTER_NAME_UNIQUE_ERROR_TYPE = 'clusterNameUnique';

type UseClusterNameUniquenessValidationArgs = {
  checkClusterNameUniqueness?: CheckClusterNameUniqueness;
};

type LastCheckedPair = {
  name: string;
  region: string;
};

/** Runs async cluster name uniqueness checks on name blur and region change only. */
export function useClusterNameUniquenessValidation({
  checkClusterNameUniqueness,
}: UseClusterNameUniquenessValidationArgs): {
  checkOnNameBlur: () => Promise<void>;
} {
  const msgs = useRosaHcpWizardValidators();
  const { setStepAsyncValidating } = useRosaHcpWizardValidation();
  const { control, getValues, setError, clearErrors, getFieldState } =
    useFormContext<Partial<ROSAHCPCluster>>();
  const region = useWatch({ control, name: 'region' });
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const previousRegionRef = useRef<string | undefined>(undefined);
  const hasInitializedRegionRef = useRef(false);
  const checkClusterNameUniquenessRef = useRef(checkClusterNameUniqueness);
  const uniquenessRequestIdRef = useRef(0);
  const asyncValidatingRequestIdRef = useRef<number | null>(null);
  const lastCheckedRef = useRef<LastCheckedPair | null>(null);
  checkClusterNameUniquenessRef.current = checkClusterNameUniqueness;

  const clearPendingDebounce = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = undefined;
    }
  }, []);

  const applyUniqueErrorToForm = useCallback(
    (error: string | null) => {
      if (error) {
        setError('name', { type: CLUSTER_NAME_UNIQUE_ERROR_TYPE, message: error });
        return;
      }

      const nameFieldError = getFieldState('name').error;
      if (nameFieldError?.type === CLUSTER_NAME_UNIQUE_ERROR_TYPE) {
        clearErrors('name');
      }
    },
    [clearErrors, getFieldState, setError]
  );

  const runUniquenessCheck = useCallback(async () => {
    const check = checkClusterNameUniquenessRef.current;
    if (!check) {
      return;
    }

    const name = getValues('name');
    const currentRegion = getValues('region');
    const clearAsyncValidatingIfInFlight = (): void => {
      if (asyncValidatingRequestIdRef.current !== null) {
        asyncValidatingRequestIdRef.current = null;
        setStepAsyncValidating(STEP_IDS.DETAILS, false);
      }
    };

    if (!hasRefetchableStringValue(name) || !hasRefetchableStringValue(currentRegion)) {
      ++uniquenessRequestIdRef.current;
      clearAsyncValidatingIfInFlight();
      lastCheckedRef.current = null;
      applyUniqueErrorToForm(null);
      return;
    }
    if (validateClusterNameSync(name, msgs.clusterName)) {
      ++uniquenessRequestIdRef.current;
      clearAsyncValidatingIfInFlight();
      applyUniqueErrorToForm(null);
      return;
    }

    const lastChecked = lastCheckedRef.current;
    if (lastChecked?.name === name && lastChecked.region === currentRegion) {
      return;
    }

    const requestId = ++uniquenessRequestIdRef.current;
    asyncValidatingRequestIdRef.current = requestId;
    setStepAsyncValidating(STEP_IDS.DETAILS, true);
    let error: string | null | undefined;
    try {
      error = await check(name, currentRegion);
    } catch {
      return;
    } finally {
      if (asyncValidatingRequestIdRef.current === requestId) {
        asyncValidatingRequestIdRef.current = null;
        setStepAsyncValidating(STEP_IDS.DETAILS, false);
      }
    }
    if (requestId !== uniquenessRequestIdRef.current) {
      return;
    }

    lastCheckedRef.current = { name, region: currentRegion };
    applyUniqueErrorToForm(error ?? null);
  }, [applyUniqueErrorToForm, getValues, msgs.clusterName, setStepAsyncValidating]);

  const scheduleUniquenessCheck = useCallback(() => {
    clearPendingDebounce();
    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = undefined;
      void runUniquenessCheck();
    }, 300);
  }, [clearPendingDebounce, runUniquenessCheck]);

  const checkOnNameBlur = useCallback((): Promise<void> => {
    clearPendingDebounce();
    return runUniquenessCheck();
  }, [clearPendingDebounce, runUniquenessCheck]);

  useEffect(() => clearPendingDebounce, [clearPendingDebounce]);

  useEffect(() => {
    const currentRegion = hasRefetchableStringValue(region) ? region : undefined;

    if (!hasInitializedRegionRef.current) {
      previousRegionRef.current = currentRegion;
      hasInitializedRegionRef.current = true;
      return;
    }

    if (Object.is(previousRegionRef.current, currentRegion)) {
      return;
    }

    previousRegionRef.current = currentRegion;

    const name = getValues('name');
    if (!hasRefetchableStringValue(name) || !currentRegion) {
      lastCheckedRef.current = null;
      applyUniqueErrorToForm(null);
      return;
    }

    scheduleUniquenessCheck();
  }, [applyUniqueErrorToForm, getValues, region, scheduleUniquenessCheck]);

  return { checkOnNameBlur };
}

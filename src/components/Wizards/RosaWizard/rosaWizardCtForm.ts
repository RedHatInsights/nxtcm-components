import { klona } from 'klona/json';
import { useMemo } from 'react';
import { useForm, type UseFormProps } from 'react-hook-form';
import type { RosaWizardFormData } from '../types';
import { createDefaultRosaWizardFormValues } from './rosaWizardDefaultFormData';
import { useRosaWizardStrings, useRosaWizardValidators } from './RosaWizardStringsContext';
import { buildWizardStringsForRosa } from './rosaWizardStrings';
import { createRosaWizardYupResolver } from './yup/rosaWizardFormSchema';

/**
 * react-hook-form for Playwright CT / isolated mounts: same Yup resolver as {@link RosaWizard}.
 * Must be used under {@link RosaWizardStringsProvider}.
 */
export function useRosaWizardCtForm(
  defaultValues: RosaWizardFormData,
  options?: Pick<UseFormProps<RosaWizardFormData>, 'mode'>
) {
  const rosaStrings = useRosaWizardStrings();
  const validators = useRosaWizardValidators();
  const footerStrings = useMemo(
    () => buildWizardStringsForRosa(rosaStrings, undefined),
    [rosaStrings]
  );
  const resolver = useMemo(
    () =>
      createRosaWizardYupResolver({
        validators,
        footerStrings,
      }),
    [validators, footerStrings]
  );
  return useForm<RosaWizardFormData>({
    defaultValues,
    mode: options?.mode ?? 'onChange',
    resolver,
    shouldUnregister: false,
  });
}

/** Full wizard defaults merged with a partial `cluster` patch (CT-friendly). */
export function mergeRosaCtClusterDefaults(
  clusterPatch: Partial<RosaWizardFormData['cluster']>
): RosaWizardFormData {
  const base = klona(createDefaultRosaWizardFormValues());
  base.cluster = { ...base.cluster, ...clusterPatch };
  return base;
}

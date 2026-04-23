import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { simpleWizardFormSchema, type SimpleWizardFormValues } from './simpleWizardFormSchema';

const baseResolver = yupResolver(simpleWizardFormSchema);

/**
 * Forwards RHF’s `options.names` into Yup’s `context` as `rhfFieldNames` so the schema can skip
 * heavy async work for fields that are not in the current validation pass (Yup’s resolver otherwise
 * validates the whole form every time RHF calls the resolver).
 */
export const simpleWizardYupResolver: Resolver<SimpleWizardFormValues> = (
  values,
  context,
  options
) =>
  baseResolver(
    values,
    {
      ...(context != null && typeof context === 'object' ? context : {}),
      rhfFieldNames: options.names,
    } as never,
    options
  );

import {
  createFormHookContexts,
  createFormHook,
  useStore,
  type ReactFormExtendedApi,
} from '@tanstack/react-form';
import { type ClusterFormData, type RosaWizardFormData } from '../types';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

/** The TanStack Form API type for the Rosa wizard form */
export type RosaFormApi = ReactFormExtendedApi<
  RosaWizardFormData,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
>;

/**
 * Returns the TanStack Form instance for the Rosa wizard.
 * Must be called within a form.AppForm wrapper.
 */
export function useRosaForm(): RosaFormApi {
  return useFormContext() as unknown as RosaFormApi;
}

/**
 * Convenience hook — returns the current `cluster` object from the form.
 * Subscribes to the whole cluster sub-tree so the component re-renders on any field change.
 */
export function useClusterValues(): ClusterFormData {
  const form = useRosaForm();
  return useStore(form.store, (state) => state.values.cluster);
}

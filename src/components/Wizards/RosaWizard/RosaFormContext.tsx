import {
  createFormHookContexts,
  createFormHook,
  useStore,
  type ReactFormExtendedApi,
} from '@tanstack/react-form';
import { type ClusterFormData, type RosaWizardFormData } from '../types';

/**
 * TanStack Form contexts and hooks for the Rosa wizard (`fieldContext` / `formContext`, plus
 * `useFieldContext` / `useFormContext` for consumers inside `form.AppForm`).
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/** Pre-bound form hook factory with Rosa wizard field/form contexts (no custom components yet). */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

/**
 * Typed TanStack Form API for `RosaWizardFormData`.
 * All 12 generic arguments are required by `ReactFormExtendedApi` — the `undefined` slots
 * mean no form-level validators are configured (validation lives on individual fields).
 */
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
 * Must be called within a `form.AppForm` wrapper. The cast is required because
 * `createFormHookContexts()` creates untyped contexts (`Record<string, never>`);
 * the actual `RosaWizardFormData` shape is only known at `useAppForm()` call time.
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

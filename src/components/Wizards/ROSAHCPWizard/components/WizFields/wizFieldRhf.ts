import { type ReactNode } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useFormContext,
} from 'react-hook-form';
import * as yup from 'yup';

import { type YupFieldDescribeOptions } from '@/utilities/yupFieldRequired';

/**
 * Shared react-hook-form + Yup wiring for RosaWizard `Wiz*` fields.
 *
 * - **control**: pass from `useForm()` when the tree is not wrapped with react-hook-form `FormProvider`; otherwise omit and the widget resolves context via {@link useFormContext}.
 * - **schema**: when set, reads presentation from Yup `.meta({ ... })` (see `yupFieldPresentationMeta.ts`) and, together with `name`, derives **`isRequired`** via `requiredFromYup` (see `yupFieldRequired.ts`) unless you pass **`isRequired`** on the widget props.
 *
 * Each `Wiz*` field accepts optional **`id`**, **`label`**, **`helperText`**, **`labelHelp`**, and **`labelHelpTitle`** on its props. When a prop is omitted and **`schema`** is set, that value comes from the schema field’s `.meta()`; otherwise the widget uses path-based fallbacks where applicable (`id` / `label`). Explicit props always win over Yup meta.
 *
 * **`isRequired`**: each bound field exposes PatternFly **`isRequired`** (optional). When omitted and **`schema`** is set, the widget sets it from **`requiredFromYup`** / **`isYupFieldRequired`** for that path; when **`schema`** is omitted, the underlying field default applies. **`WizTextInput`** also accepts native **`required`**; the underlying `TextInput` forwards `required={isRequired || required}` to the actual input.
 *
 * **Validation errors**: `Wiz*` widgets do **not** accept **`errorMessage`** (or **`isError`**) from consumers. Messages come from **`useController` → `fieldState.error`**, i.e. whatever **`useForm`**’s **`resolver`** supplies (typically Yup via `yupResolver`); the optional **`schema`** prop on a `Wiz*` is only for `.meta()` / `isRequired` hints and does not replace the form resolver.
 */
export interface WizRhfBoundFieldProps<TFieldValues extends FieldValues> {
  /** Registered field path (matches your Yup schema keys). */
  name: FieldPath<TFieldValues>;
  /**
   * From `useForm` when the form is not wrapped with react-hook-form `FormProvider`.
   * If omitted, the widget resolves {@link Control} via {@link useFormContext}.
   */
  control?: Control<TFieldValues>;
  /** When set, drives Yup `.meta()` presentation and `isRequired` (unless overridden) for `name`. */
  schema?: yup.AnyObjectSchema;
  /** Same shape as {@link YupFieldDescribeOptions} for fields built with `.when()`. */
  yupDescribeOptions?: YupFieldDescribeOptions;
  /**
   * When set, overrides Yup-derived required UI for this field. When omitted and `schema` is set,
   * each `Wiz*` sets PatternFly `isRequired` from `isRequired ?? requiredFromYup(schema, name, yupDescribeOptions)`.
   */
  isRequired?: boolean;
}

export function wizFallbackFieldId(name: FieldPath<FieldValues>): string {
  return `wiz-field-${String(name).replace(/\./g, '-')}`;
}

export function wizFallbackLabelFromFieldPath(name: FieldPath<FieldValues>): string {
  return String(name).split('.').pop() ?? String(name);
}

/** Coerce Yup `.meta()` `label` to a plain string when the underlying PF widget only accepts `string`. */
export function stringLabelFromYupMeta(metaLabel: ReactNode | undefined, fallback: string): string {
  if (metaLabel === undefined || metaLabel === null) {
    return fallback;
  }
  if (typeof metaLabel === 'string') {
    return metaLabel;
  }
  if (typeof metaLabel === 'number') {
    return String(metaLabel);
  }
  return fallback;
}

export function wizFieldShowsError(
  invalid: boolean,
  isTouched: boolean,
  isSubmitted: boolean
): boolean {
  return invalid && (isTouched || isSubmitted);
}

/**
 * Resolves {@link Control} from props or react-hook-form context.
 * Throws a consistent error message when neither is available.
 */
export function useWizRhfControl<TFieldValues extends FieldValues>(
  componentDisplayName: string,
  controlProp?: Control<TFieldValues>
): Control<TFieldValues> {
  /** RHF default context is `null` when `FormProvider` is not used. */
  const formContext = useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | null;
  const control = controlProp ?? formContext?.control;

  if (control == null) {
    throw new Error(
      `${componentDisplayName}: pass \`control\` from useForm(), or wrap the form with <FormProvider {...methods}> from react-hook-form.`
    );
  }

  return control;
}

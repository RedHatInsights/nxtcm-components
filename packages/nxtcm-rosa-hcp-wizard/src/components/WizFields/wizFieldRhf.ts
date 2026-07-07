import {
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useFormContext,
} from 'react-hook-form';
import * as yup from 'yup';

import { type YupFieldDescribeOptions } from '../../utilities/yupFieldRequired';

import type { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.types';
import { getRosaHcpWizardStringByLabelKey } from '../../stringsProvider/getRosaHcpWizardStringByLabelKey';

/**
 * Shared react-hook-form + Yup wiring for ROSA HCP wizard `Wiz*` fields.
 *
 * - **control**: pass from `useForm()` when the tree is not wrapped with react-hook-form `FormProvider`; otherwise omit and the widget resolves context via {@link useFormContext}.
 * - **schema**: when set, reads presentation from Yup `.meta({ ... })` (see `yupFieldPresentationMeta.ts`) and, together with `name`, derives **`isRequired`** via `requiredFromYup` (see `yupFieldRequired.ts`) unless you pass **`isRequired`** on the widget props.
 *
 * Each `Wiz*` field accepts optional **`id`**, **`label`**, **`placeholder`** (where supported), **`helperText`**, **`labelHelp`**, and **`labelHelpTitle`** on its props. Resolved together via **`useWizFieldPresentation`** from **`wizFieldPresentation.ts`**, which prefers explicit props then Yup `.meta()` / `*Key` strings from `RosaHcpWizardStringsProvider`. Helpers {@link wizResolvePresentationString} / {@link wizResolvePresentationLabelString} implement the merge order.
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

/** Explicit string prop, then ROSA string from `.meta().*Key`, then Yup `.meta()` inline string. */
export function wizResolvePresentationString(
  prop: string | undefined,
  metaKey: string | undefined,
  strings: RosaHcpWizardStrings,
  yupFallback: string | undefined
): string | undefined {
  return (
    prop ??
    (metaKey !== undefined ? getRosaHcpWizardStringByLabelKey(strings, metaKey) : undefined) ??
    yupFallback
  );
}

/** Explicit ReactNode prop, then ROSA string from `.meta().*Key`, then Yup `.meta()` inline node. */
export function wizResolvePresentationReactNode(
  prop: ReactNode | undefined,
  metaKey: string | undefined,
  strings: RosaHcpWizardStrings,
  yupFallback: ReactNode | undefined
): ReactNode | undefined {
  return (
    prop ??
    (metaKey !== undefined ? getRosaHcpWizardStringByLabelKey(strings, metaKey) : undefined) ??
    yupFallback
  );
}

/**
 * String `label` on fields that coerce non-string Yup `.meta().label` via {@link stringLabelFromYupMeta}.
 */
export function wizResolvePresentationLabelString(
  labelProp: string | undefined,
  labelKey: string | undefined,
  strings: RosaHcpWizardStrings,
  yupLabel: ReactNode | undefined,
  hasSchema: boolean,
  fallbackLabel: string
): string {
  return (
    labelProp ??
    (labelKey !== undefined ? getRosaHcpWizardStringByLabelKey(strings, labelKey) : undefined) ??
    (hasSchema ? stringLabelFromYupMeta(yupLabel, fallbackLabel) : undefined) ??
    fallbackLabel
  );
}

/** Third argument is true when the form was submitted or the field's step failed Next / Skip to review. */
export function wizFieldShowsError(
  invalid: boolean,
  isTouched: boolean,
  validationRevealed: boolean
): boolean {
  return invalid && (isTouched || validationRevealed);
}

/**
 * Defers react-hook-form touch until a dropdown closes. The menu toggle blurs on mousedown
 * while an option is being chosen; marking touched then briefly shows invalid+ touched in nav
 * before the new value lands.
 */
export function useWizMenuFieldBlur(
  onBlur: FocusEventHandler<HTMLElement>,
  isMenuOpen: boolean
): FocusEventHandler<HTMLElement> {
  const wasMenuOpenRef = useRef(false);
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;

  useEffect(() => {
    if (wasMenuOpenRef.current && !isMenuOpen) {
      onBlurRef.current({ type: 'blur' } as FocusEvent<HTMLElement>);
    }
    wasMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  return useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (isMenuOpen) {
        return;
      }
      onBlur(event);
    },
    [isMenuOpen, onBlur]
  );
}

/** Like {@link wizFieldShowsError}, but keyed on a resolved error message string. */
export function wizFieldShowsErrorMessage(
  errorMessage: ReactNode | string | undefined,
  isTouched: boolean,
  isSubmitted: boolean,
  options?: { showWithoutTouch?: boolean }
): boolean {
  if (errorMessage === undefined || errorMessage === null || errorMessage === '') {
    return false;
  }
  if (options?.showWithoutTouch) {
    return true;
  }
  return isTouched || isSubmitted;
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

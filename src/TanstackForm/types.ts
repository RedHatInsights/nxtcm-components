import { type ReactNode } from 'react';
import { type AnyFieldApi } from '@tanstack/react-form';

/**
 * Common props shared across all PatternFly form field components
 * that integrate with TanStack Form.
 */
export interface FormFieldProps {
  /** TanStack Form field API instance from form.Field render prop */
  field: AnyFieldApi;
  /** Label displayed above the field in a PatternFly FormGroup */
  label: string;
  /** Marks the field as required in the PatternFly FormGroup */
  isRequired?: boolean;
  /** Disables the field input */
  isDisabled?: boolean;
  /** Body content for the label help popover (renders a help icon that opens a Popover) */
  labelHelp?: ReactNode;
  /** Header text for the label help popover */
  labelHelpTitle?: string;
  /** Additional helper text displayed below the field when there are no errors */
  helperText?: ReactNode;
  /** Custom id for the field. Falls back to field.name if not provided. */
  id?: string;
}

/** Extracts the first error string from the TanStack field meta errors array */
export function getFieldError(field: AnyFieldApi): string | undefined {
  const errors = field.state.meta.errors;
  if (!errors || errors.length === 0) return undefined;

  const firstError = errors[0];
  if (typeof firstError === 'string') return firstError;
  if (firstError && typeof firstError === 'object' && 'message' in firstError) {
    return String((firstError as { message: unknown }).message);
  }
  return firstError != null ? String(firstError) : undefined;
}

/** Returns the PatternFly validation status based on TanStack field meta */
export function getValidatedState(field: AnyFieldApi): 'error' | 'default' {
  const hasErrors = field.state.meta.errors.length > 0;
  const isTouched = field.state.meta.isTouched;
  return hasErrors && isTouched ? 'error' : 'default';
}

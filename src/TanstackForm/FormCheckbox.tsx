import { type ReactNode, useCallback } from 'react';
import { Checkbox as PfCheckbox, type CheckboxProps } from '@patternfly/react-core';
import { type FormFieldProps, getFieldError, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormCheckboxProps extends Omit<FormFieldProps, 'label'> {
  /** Checkbox label displayed inline next to the input */
  label: string;
  /** Optional title rendered as a FormGroup label above the checkbox */
  title?: string;
  /** Description text rendered below the checkbox label */
  description?: ReactNode;
}

/**
 * PatternFly Checkbox wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="acceptTerms">
 *   {(field) => (
 *     <FormCheckbox field={field} label="I accept the terms" />
 *   )}
 * </form.Field>
 * ```
 */
export function FormCheckbox(props: FormCheckboxProps): JSX.Element {
  const {
    field,
    label,
    title,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    description,
    id,
  } = props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);
  const error = getFieldError(field);
  const showError = validated === 'error' && error;

  const handleChange = useCallback<NonNullable<CheckboxProps['onChange']>>(
    (_event, checked) => field.handleChange(checked),
    [field]
  );

  return (
    <FieldGroup
      field={field}
      label={title}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      helperText={showError ? error : helperText}
      id={fieldId}
    >
      <PfCheckbox
        id={fieldId}
        isChecked={Boolean(field.state.value)}
        onChange={handleChange}
        onBlur={field.handleBlur}
        label={label}
        description={description}
        isDisabled={isDisabled}
      />
    </FieldGroup>
  );
}

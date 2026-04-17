import { useCallback } from 'react';
import { TextInput as PfTextInput, type TextInputProps } from '@patternfly/react-core';
import { type FormFieldProps, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormTextInputProps extends FormFieldProps {
  /** Placeholder text shown when the field is empty */
  placeholder?: string;
  /** Input type — defaults to "text" */
  type?: TextInputProps['type'];
  /** Renders the input as read-only */
  isReadOnly?: boolean;
}

/**
 * PatternFly TextInput wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="clusterName">
 *   {(field) => (
 *     <FormTextInput field={field} label="Cluster name" isRequired />
 *   )}
 * </form.Field>
 * ```
 */
export function FormTextInput(props: FormTextInputProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    placeholder,
    type = 'text',
    isReadOnly,
    id,
  } = props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);

  const handleChange = useCallback<NonNullable<TextInputProps['onChange']>>(
    (_event, value) => field.handleChange(value),
    [field]
  );

  return (
    <FieldGroup
      field={field}
      label={label}
      isRequired={isRequired}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      helperText={helperText}
      id={fieldId}
    >
      <PfTextInput
        id={fieldId}
        value={field.state.value ?? ''}
        onChange={handleChange}
        onBlur={field.handleBlur}
        validated={validated}
        placeholder={placeholder}
        type={type}
        isDisabled={isDisabled}
        readOnlyVariant={isReadOnly ? 'default' : undefined}
        spellCheck="false"
      />
    </FieldGroup>
  );
}

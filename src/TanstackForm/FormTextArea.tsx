import { useCallback } from 'react';
import { TextArea as PfTextArea, type TextAreaProps } from '@patternfly/react-core';
import { type FormFieldProps, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormTextAreaProps extends FormFieldProps {
  /** Placeholder text shown when the field is empty */
  placeholder?: string;
  /** Renders the textarea as read-only */
  isReadOnly?: boolean;
  /** Orientation for manual resizing */
  resizeOrientation?: TextAreaProps['resizeOrientation'];
  /** Whether the textarea should auto-resize to fit content */
  autoResize?: boolean;
}

/**
 * PatternFly TextArea wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="description">
 *   {(field) => (
 *     <FormTextArea field={field} label="Description" />
 *   )}
 * </form.Field>
 * ```
 */
export function FormTextArea(props: FormTextAreaProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    placeholder,
    isReadOnly,
    resizeOrientation = 'vertical',
    autoResize,
    id,
  } = props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);

  const handleChange = useCallback<NonNullable<TextAreaProps['onChange']>>(
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
      <PfTextArea
        id={fieldId}
        value={field.state.value ?? ''}
        onChange={handleChange}
        onBlur={field.handleBlur}
        validated={validated}
        placeholder={placeholder}
        isDisabled={isDisabled}
        readOnlyVariant={isReadOnly ? 'default' : undefined}
        resizeOrientation={resizeOrientation}
        autoResize={autoResize}
        spellCheck="false"
      />
    </FieldGroup>
  );
}

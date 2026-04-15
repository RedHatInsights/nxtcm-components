import { useCallback } from 'react';
import { Switch as PfSwitch, type SwitchProps } from '@patternfly/react-core';
import { type FormFieldProps, getFieldError, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormSwitchProps extends Omit<FormFieldProps, 'label'> {
  /** Switch label displayed inline next to the toggle */
  label: string;
  /** Optional title rendered as a FormGroup label above the switch */
  title?: string;
  /** Whether the switch is reversed (toggle on the right) */
  isReversed?: boolean;
}

/**
 * PatternFly Switch wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="enableMonitoring">
 *   {(field) => (
 *     <FormSwitch field={field} label="Enable monitoring" />
 *   )}
 * </form.Field>
 * ```
 */
export function FormSwitch(props: FormSwitchProps): JSX.Element {
  const { field, label, title, isDisabled, labelHelp, labelHelpTitle, helperText, isReversed, id } =
    props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);
  const error = getFieldError(field);
  const showError = validated === 'error' && error;

  const handleChange = useCallback<NonNullable<SwitchProps['onChange']>>(
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
      <PfSwitch
        id={fieldId}
        isChecked={Boolean(field.state.value)}
        onChange={handleChange}
        label={label}
        isDisabled={isDisabled}
        isReversed={isReversed}
      />
    </FieldGroup>
  );
}

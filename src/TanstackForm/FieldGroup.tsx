import { type PropsWithChildren, type ReactNode } from 'react';
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { type AnyFieldApi } from '@tanstack/react-form';
import { getFieldError, getValidatedState } from './types';
import { LabelHelp } from './LabelHelp';

export interface FieldGroupProps {
  /** TanStack Form field API instance */
  field: AnyFieldApi;
  /** Label displayed above the field */
  label?: string;
  /** Marks the field as required */
  isRequired?: boolean;
  /** Body content for the label help popover */
  labelHelp?: ReactNode;
  /** Header text for the label help popover */
  labelHelpTitle?: string;
  /** Helper text shown below the field when there are no errors */
  helperText?: ReactNode;
  /** Custom id for the form group */
  id?: string;
}

/**
 * Wraps children in a PatternFly FormGroup with automatic
 * TanStack Form validation error display.
 */
export function FieldGroup(props: PropsWithChildren<FieldGroupProps>): JSX.Element {
  const { field, label, isRequired, labelHelp, labelHelpTitle, helperText, children, id } = props;

  const fieldId = id ?? field.name;
  const validated = getValidatedState(field);
  const error = getFieldError(field);
  const showError = validated === 'error' && error;

  return (
    <FormGroup
      id={`${fieldId}-form-group`}
      fieldId={fieldId}
      label={label}
      isRequired={isRequired}
      labelHelp={<LabelHelp id={fieldId} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    >
      {children}
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant={showError ? 'error' : 'default'}>
            {showError ? error : helperText}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
}

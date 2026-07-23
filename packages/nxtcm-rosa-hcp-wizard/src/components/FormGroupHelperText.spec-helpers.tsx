import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import { FormGroupHelperText } from './FormGroupHelperText';

export interface FormGroupHelperTextMountProps {
  children?: React.ReactNode;
  id?: string;
  error?: string;
  touched?: boolean;
  validateOnSubmit?: boolean;
}

export const FormGroupHelperTextMount: React.FC<FormGroupHelperTextMountProps> = ({
  children,
  id,
  error,
  touched = false,
  validateOnSubmit = false,
}) => {
  return withRosaCt(
    <FormGroupHelperText
      id={id}
      error={error}
      touched={touched}
      validateOnSubmit={validateOnSubmit}
    >
      {children}
    </FormGroupHelperText>
  );
};

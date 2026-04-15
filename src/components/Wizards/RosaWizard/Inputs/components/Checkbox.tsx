import {
  Checkbox as PFCheckbox,
  type CheckboxProps as PFCheckboxProps,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Stack,
} from '@patternfly/react-core';

import { LabelHelp } from './LabelHelp';
import React from 'react';

/** `ref` omitted: PF `Checkbox` is a class component; `CheckboxProps.ref` targets `HTMLInputElement` and conflicts when spread. */
export type CheckboxProps = Omit<PFCheckboxProps, 'ref'> & {
  title?: string;
  popoverHelpContent?: React.ReactNode;
  popoverHelpTitle?: string;
  fieldHelperText?: React.ReactNode;
  error?: string;
  children?: React.ReactNode;
};

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    id,
    popoverHelpContent,
    popoverHelpTitle,
    fieldHelperText,
    error,
    children,
    title,
    isRequired,
    ...PFCheckboxProps
  } = props;

  return (
    <Stack hasGutter>
      <FormGroup id={`${id}-form-group`} fieldId={id} label={title} isRequired={isRequired}>
        <PFCheckbox
          id={id}
          {...PFCheckboxProps}
          label={
            <>
              {label}{' '}
              <LabelHelp id={id} labelHelp={popoverHelpContent} labelHelpTitle={popoverHelpTitle} />
            </>
          }
          body={
            fieldHelperText || error ? (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={error ? 'error' : undefined}>
                    {error ? error : fieldHelperText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            ) : undefined
          }
        />
        {children}
      </FormGroup>
    </Stack>
  );
}

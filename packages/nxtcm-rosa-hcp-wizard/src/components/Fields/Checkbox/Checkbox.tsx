import type { ComponentProps, ReactNode } from 'react';
import { Checkbox as PfCheckbox, FormGroup, Stack } from '@patternfly/react-core';
import { HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';

type CheckboxComponentProps = ComponentProps<typeof PfCheckbox>;

export interface CheckboxProps extends Omit<
  CheckboxComponentProps,
  'label' | 'body' | 'children' | 'ref'
> {
  id: string;
  label: ReactNode | string;
  title?: string;
  labelHelp?: ReactNode | string;
  labelHelpTitle?: string;
  helperText?: ReactNode | string;
  errorMessage?: ReactNode | string;
  children?: ReactNode;
  isError?: boolean;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
}

export function Checkbox(props: CheckboxProps) {
  const {
    id,
    label,
    title,
    isRequired,
    isChecked,
    labelHelp,
    labelHelpTitle,
    helperText,
    errorMessage,
    isDisabled,
    children,
    onBlur,
    onChange,
    isError,
    isSuccess,
    successMessage,
    ...checkboxRest
  } = props;

  return (
    <Stack hasGutter>
      <FormGroup role="group" id={`${id}-form-group`} fieldId={id} label={title}>
        <PfCheckbox
          {...checkboxRest}
          id={id}
          isRequired={isRequired}
          isChecked={isChecked}
          onChange={onChange}
          onBlur={onBlur}
          label={
            <>
              {label}{' '}
              <LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} useButton />
            </>
          }
          isDisabled={isDisabled}
          aria-describedby={helperTextId({
            id,
            errorMessage,
            helperText,
            isError,
            isSuccess,
            successMessage,
          })}
          body={
            <HelperText
              id={id}
              errorMessage={errorMessage}
              helperText={helperText}
              isError={isError}
              isDisabled={isDisabled}
              isSuccess={isSuccess}
              successMessage={successMessage}
            />
          }
        />
        {children}
      </FormGroup>
    </Stack>
  );
}

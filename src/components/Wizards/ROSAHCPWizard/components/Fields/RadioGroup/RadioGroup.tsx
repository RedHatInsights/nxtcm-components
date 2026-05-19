import { type ComponentProps, type ReactNode, useCallback, useId } from 'react';
import { Flex, FormGroup } from '@patternfly/react-core';

import { HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';
import { RadioGroupContext, type RadioGroupContextState } from './RadioGroupContext';

type FormGroupComponentProps = ComponentProps<typeof FormGroup>;

export interface RadioGroupProps
  extends Omit<FormGroupComponentProps, 'label' | 'labelHelp' | 'children' | 'value'> {
  id: string;
  label?: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  helperText?: ReactNode;
  isRequired?: boolean;
  errorMessage?: ReactNode | string;
  isError?: boolean;
  isDisabled?: boolean;
  value?: unknown;
  onChange?: (value: unknown) => void;
  children?: ReactNode;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
}

export function RadioGroup(props: RadioGroupProps) {
  const {
    id,
    label,
    labelHelp,
    labelHelpTitle,
    helperText,
    isRequired,
    errorMessage,
    isError,
    isSuccess,
    successMessage,
    isDisabled,
    value,
    onChange,
    children,
    isInline,
    ...formGroupRest
  } = props;

  const radioGroup = useId();

  const setGroupValue = useCallback(
    (next: unknown) => {
      onChange?.(next);
    },
    [onChange]
  );

  const state: RadioGroupContextState = {
    value,
    setValue: setGroupValue,
    disabled: isDisabled,
    radioGroup,
  };

  return (
    <RadioGroupContext.Provider value={state}>
      <div id={id}>
        <FormGroup
          {...formGroupRest}
          id={`${id}-form-group`}
          aria-label={label}
          label={label}
          isRequired={isRequired}
          labelHelp={<LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
          aria-describedby={helperTextId({
            id,
            errorMessage,
            helperText,
            isError,
            isSuccess,
            successMessage,
          })}
          role="radiogroup"
        >
          <HelperText
            id={id}
            errorMessage={errorMessage}
            isError={isError}
            helperText={helperText}
            isSuccess={isSuccess}
            successMessage={successMessage}
            isDisabled={isDisabled}
          />

          <Flex
            direction={{ default: isInline ? 'row' : 'column' }}
            spaceItems={{ default: 'spaceItemsMd' }}
            className="pf-v6-u-pt-xs"
          >
            {children}
          </Flex>
        </FormGroup>
      </div>
    </RadioGroupContext.Provider>
  );
}

export { Radio, type RadioProps } from '../Radio/Radio';

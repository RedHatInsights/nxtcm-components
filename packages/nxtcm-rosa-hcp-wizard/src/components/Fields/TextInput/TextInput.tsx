import {
  forwardRef,
  useState,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import {
  Button,
  FormGroup,
  InputGroup,
  InputGroupItem,
  TextInput as PfTextInput,
  type TextInputProps as PfTextInputProps,
  Spinner,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getValidated, HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';

function lowercaseFirst(label: string) {
  if (label) {
    return label[0].toLowerCase() + label.substring(1);
  }
  return label;
}

export interface TextInputProps extends PfTextInputProps {
  errorMessage?: React.ReactNode | string;
  id: string;
  label?: string;
  isRequired?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  placeholder?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  helperText?: React.ReactNode;
  isSecret?: boolean;
  showSecretButton?: boolean;
  successMessage?: React.ReactNode | string;
  isLoading?: boolean;
  isFill?: boolean;
  ariaLabelHidePassword?: string;
  ariaLabelShowPassword?: string;
}

export const TextInput: ForwardRefExoticComponent<
  PropsWithoutRef<TextInputProps> & RefAttributes<HTMLInputElement>
> = forwardRef<HTMLInputElement, PropsWithoutRef<TextInputProps>>(function TextInput(props, ref) {
  const {
    errorMessage,
    helperText,
    id,
    isError,
    isSuccess,
    isSecret,
    label,
    labelHelp,
    labelHelpTitle,
    placeholder,
    showSecretButton,
    isLoading,
    successMessage,
    isDisabled,
    isFill = true,
    isRequired,
    required,
    ariaLabelHidePassword = 'Hide password',
    ariaLabelShowPassword = 'Show password',
    ...textInputRest
  } = props;

  const [secretRevealed, setSecretRevealed] = useState(false);

  let inputType: PfTextInputProps['type'] = 'text';
  if (isSecret) {
    inputType = showSecretButton && secretRevealed ? 'text' : 'password';
  }

  const placeholderText =
    placeholder ?? (label && label.length ? `Enter the ${lowercaseFirst(label)}` : '');

  const input = (
    <InputGroup>
      <InputGroupItem isFill={isFill}>
        <PfTextInput
          ref={ref}
          id={id}
          placeholder={placeholderText}
          validated={getValidated(isError, isSuccess)}
          spellCheck={false}
          aria-describedby={helperTextId({
            id,
            errorMessage,
            helperText,
            isError,
            isSuccess,
            successMessage,
          })}
          {...textInputRest}
          type={inputType}
          isDisabled={isDisabled}
          required={isRequired || required}
          customIcon={isLoading ? <Spinner size="sm" /> : undefined}
        />
      </InputGroupItem>
      {isSecret && showSecretButton ? (
        <InputGroupItem>
          <Button
            variant="control"
            onClick={() => setSecretRevealed((r) => !r)}
            aria-label={secretRevealed ? ariaLabelHidePassword : ariaLabelShowPassword}
            icon={secretRevealed ? <EyeSlashIcon /> : <EyeIcon />}
          />
        </InputGroupItem>
      ) : null}
    </InputGroup>
  );

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={label}
      isRequired={isRequired}
      labelHelp={<LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    >
      {input}
      <HelperText
        id={id}
        errorMessage={errorMessage}
        helperText={helperText}
        isError={isError}
        isSuccess={isSuccess}
        successMessage={successMessage}
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
});

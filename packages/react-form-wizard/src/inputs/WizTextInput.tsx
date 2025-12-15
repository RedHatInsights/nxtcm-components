/* Copyright Contributors to the Open Cluster Management project */
import {
  InputGroup,
  InputGroupItem,
  TextInput as PFTextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { Fragment, useCallback, useState } from 'react';
import { WizTextDetail } from '..';
import { ClearInputButton } from '../components/ClearInputButton';
import { PasteInputButton } from '../components/PasteInputButton';
import { ShowSecretsButton } from '../components/ShowSecretsButton';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { InputCommonProps, getEnterPlaceholder, useInput } from './Input';
import { WizFormGroup } from './WizFormGroup';
import { useSetStepHasTouchedValidationError } from '../contexts/TouchedValidationProvider';
import React from 'react';

export type WizTextInputProps = InputCommonProps<string> & {
  placeholder?: string;
  secret?: boolean;
  canPaste?: boolean;
};

export function WizTextInput(props: WizTextInputProps) {
  const {
    displayMode: mode,
    value,
    setValue,
    disabled,
    validated,
    hidden,
    id,
    error,
  } = useInput(props);
  const [showSecrets, setShowSecrets] = useState(false);
  const [touched, setTouched] = useState(false);

  const setStepHasTouchedError = useSetStepHasTouchedValidationError();

  const onChange = useCallback<NonNullable<TextInputProps['onChange']>>(
    (_event, value) => setValue(value),
    [setValue]
  );

  const onBlur = useCallback(() => {
    if (props.validateOnBlur) {
      setTouched(true);

      setStepHasTouchedError(id, !!error);
    }
  }, [props.validateOnBlur, id, error, setStepHasTouchedError]);

  React.useEffect(() => {
    if (touched && props.validateOnBlur) {
      setStepHasTouchedError(id, !!error);
    }
  }, [touched, error, id, props.validateOnBlur, setStepHasTouchedError]);

  const effectiveValidated = props.validateOnBlur && touched && error ? 'error' : validated;

  if (hidden) return <Fragment />;

  if (mode === DisplayMode.Details) {
    if (!value) return <Fragment />;
    return <WizTextDetail id={id} path={props.path} label={props.label} secret={props.secret} />;
  }

  const placeholder = getEnterPlaceholder(props);
  const canPaste = props.canPaste !== undefined ? props.canPaste : props.secret === true;

  const inputGroup = (
    <InputGroup>
      <InputGroupItem isFill>
        <PFTextInput
          id={id}
          placeholder={placeholder}
          validated={effectiveValidated}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={!props.secret || showSecrets ? 'text' : 'password'}
          isDisabled={disabled}
          spellCheck="false"
          readOnlyVariant={props.readonly ? 'default' : undefined}
        />
      </InputGroupItem>
      {!disabled && value !== '' && props.secret && (
        <ShowSecretsButton showSecrets={showSecrets} setShowSecrets={setShowSecrets} />
      )}
      {canPaste && !disabled && value === '' && (
        <PasteInputButton setValue={setValue} setShowSecrets={setShowSecrets} />
      )}
      {canPaste && !disabled && value !== '' && !props.readonly && !props.disabled && (
        <ClearInputButton onClick={() => setValue('')} />
      )}
    </InputGroup>
  );

  return props.label ? (
    <WizFormGroup
      {...props}
      id={id}
      validatedOverride={effectiveValidated}
      errorOverride={touched && error ? error : undefined}
    >
      {inputGroup}
    </WizFormGroup>
  ) : (
    inputGroup
  );
}

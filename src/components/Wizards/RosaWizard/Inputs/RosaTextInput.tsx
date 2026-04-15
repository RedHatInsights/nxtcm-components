import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  type TextInputProps,
} from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import {
  useController,
  useFormContext,
  useFormState,
  type FieldPath,
} from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';
import { LabelHelp } from './components/LabelHelp';

function lowercaseFirst(label: string) {
  if (label) {
    return label[0].toLowerCase() + label.substring(1);
  }
  return label;
}

export type RosaTextInputProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label?: string;
  required?: boolean;
  validation?: (value: string, item?: RosaWizardFormData) => string | undefined;
  validateOnBlur?: boolean;
  placeholder?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  helperText?: React.ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  secret?: boolean;
  canPaste?: boolean;
  onValueChange?: (value: unknown, item?: RosaWizardFormData) => void;
};

export function RosaTextInput(props: RosaTextInputProps) {
  const { required: requiredMsg } = useWizardFooterStrings();
  const { control, getValues } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);
  const [showSecrets, setShowSecrets] = useState(false);

  const { field, fieldState } = useController({
    control,
    name: props.path,
    rules: {
      validate: (value) => {
        const v = typeof value === 'string' ? value : value == null ? '' : String(value);
        if (props.required && (!v || (Array.isArray(v) && v.length === 0))) {
          return requiredMsg;
        }
        const err = props.validation?.(v, getValues());
        return err ? err : true;
      },
    },
  });

  const onChange = useCallback<NonNullable<TextInputProps['onChange']>>(
    (_event, value) => {
      field.onChange(value);
      props.onValueChange?.(value, getValues());
    },
    [field, getValues, props]
  );

  const onBlur = useCallback(() => {
    field.onBlur();
  }, [field]);

  const placeholder =
    props.placeholder ??
    (props.label && props.label.length ? `Enter the ${lowercaseFirst(props.label)}` : '');

  const showError =
    !!fieldState.error &&
    (fieldState.isTouched || isSubmitted || afterStepNav);

  const input = (
    <InputGroup>
      <InputGroupItem isFill>
        <TextInput
          id={id}
          placeholder={placeholder}
          validated={showError ? 'error' : undefined}
          value={typeof field.value === 'string' ? field.value : field.value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          type={!props.secret || showSecrets ? 'text' : 'password'}
          isDisabled={props.disabled}
          spellCheck={false}
          readOnlyVariant={props.readonly ? 'default' : undefined}
        />
      </InputGroupItem>
    </InputGroup>
  );

  if (!props.label) {
    return input;
  }

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={props.label}
      isRequired={props.required}
      labelHelp={
        <LabelHelp id={id} labelHelp={props.labelHelp} labelHelpTitle={props.labelHelpTitle} />
      }
    >
      {input}
      {(showError || props.helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={showError ? 'error' : undefined}>
              {showError ? fieldState.error?.message : props.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
}

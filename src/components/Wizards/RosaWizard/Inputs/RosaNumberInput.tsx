import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  NumberInput,
  type NumberInputProps,
} from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowValidation } from '../RosaShowValidationContext';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';
import { LabelHelp } from './LabelHelp';

function lowercaseFirst(label: string) {
  if (label) {
    return label[0].toLowerCase() + label.substring(1);
  }
  return label;
}

export type RosaNumberInputProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label: string;
  placeholder?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  required?: boolean;
  validation?: (value: number, item?: RosaWizardFormData) => string | undefined;
  min?: number;
  max?: number;
  zeroIsUndefined?: boolean;
  disabled?: boolean;
};

export function RosaNumberInput(props: RosaNumberInputProps) {
  const { required: requiredMsg } = useWizardFooterStrings();
  const { control, getValues, trigger } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const showValidationForced = useRosaShowValidation();
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);
  const placeholder =
    props.placeholder ??
    (props.label && props.label.length ? `Enter the ${lowercaseFirst(props.label)}` : '');

  const { field, fieldState } = useController({
    control,
    name: props.path,
    rules: {
      validate: (value) => {
        if (
          props.required &&
          (value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value)))
        ) {
          return requiredMsg;
        }
        if (typeof value === 'number') {
          const err = props.validation?.(value, getValues());
          if (err) return err;
        }
        return true;
      },
    },
  });

  /** Playwright CT: fields under collapsed sections mount late; force validation so errors exist. */
  useEffect(() => {
    if (!showValidationForced) return;
    void trigger(props.path);
  }, [props.path, showValidationForced, trigger]);

  const value = typeof field.value === 'number' ? field.value : undefined;

  const onMinus = useCallback(() => {
    const newValue = typeof value === 'number' ? value - 1 : 0;
    if (props.zeroIsUndefined && newValue === 0) {
      field.onChange(undefined);
    } else {
      field.onChange(newValue);
    }
  }, [field, props.zeroIsUndefined, value]);

  const onChange = useCallback<Required<NumberInputProps>['onChange']>(
    (event) => {
      const newValue = Number((event.target as HTMLInputElement).value);
      if (props.zeroIsUndefined && newValue === 0) {
        field.onChange(undefined);
      } else if (Number.isInteger(newValue)) {
        field.onChange(newValue);
      }
    },
    [field, props.zeroIsUndefined]
  );

  const onPlus = useCallback(() => {
    if (typeof value === 'number') field.onChange(value + 1);
    else field.onChange(1);
  }, [field, value]);

  const showError =
    !!fieldState.error &&
    (fieldState.isTouched || isSubmitted || showValidationForced || afterStepNav);

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
      <NumberInput
        id={id}
        placeholder={placeholder}
        validated={showError ? 'error' : undefined}
        value={value}
        onMinus={onMinus}
        onChange={onChange}
        onPlus={onPlus}
        onBlur={field.onBlur}
        min={props.min === undefined ? 0 : props.min}
        max={props.max}
        isDisabled={props.disabled}
      />
      {showError && fieldState.error?.message && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="error">{fieldState.error.message}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
}

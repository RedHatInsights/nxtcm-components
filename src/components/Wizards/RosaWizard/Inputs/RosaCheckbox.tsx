import { Stack } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';

import { Checkbox, CheckboxProps } from './components/Checkbox';

export type RosaCheckboxProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label?: string;
  title?: string;
  required?: boolean;
  validation?: (value: boolean, item?: RosaWizardFormData) => string | undefined;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  helperText?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  onValueChange?: (checked: boolean) => void;
};

function getIsChecked(value: unknown) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
}

export function RosaCheckbox(props: RosaCheckboxProps) {
  const { required: requiredMsg } = useWizardFooterStrings();
  const { control, getValues } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);

  const { field, fieldState } = useController({
    control,
    name: props.path,
    rules: {
      validate: (value) => {
        if (props.required && !value) return requiredMsg;
        const err = props.validation?.(Boolean(value), getValues());
        return err ? err : true;
      },
    },
  });

  const onChange = useCallback<NonNullable<CheckboxProps['onChange']>>(
    (_event, checked) => {
      field.onChange(checked);
      props.onValueChange?.(checked);
    },
    [field, props]
  );

  const showError = !!fieldState.error && (fieldState.isTouched || isSubmitted || afterStepNav);

  return (
    <Stack hasGutter>
      <Checkbox
        id={id}
        isChecked={getIsChecked(field.value)}
        onChange={onChange}
        onBlur={field.onBlur}
        label={props.label}
        value={String(field.value)}
        isDisabled={props.disabled}
        popoverHelpContent={props.labelHelp}
        popoverHelpTitle={props.labelHelpTitle}
        fieldHelperText={props.helperText}
        error={showError ? fieldState.error?.message : undefined}
        title={props.title}
        isRequired={props.required}
      >
        {props.children}
      </Checkbox>
    </Stack>
  );
}

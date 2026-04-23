import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardFormSchema';
import { WizardStepForm } from '../../WizardStepForm';

const colorOptions = [
  { value: '', label: 'Select a color', disabled: false, isPlaceholder: true },
  { value: 'red', label: 'Red', disabled: false, isPlaceholder: false },
  { value: 'green', label: 'Green', disabled: false, isPlaceholder: false },
  { value: 'blue', label: 'Blue', disabled: false, isPlaceholder: false },
];

export const StepB = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();

  return (
    <WizardStepForm>
      <Controller
        name="required.stepB.selectionB1"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-b1';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection B-1:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection B-1"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {colorOptions.map((option, index) => (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                ))}
              </FormSelect>
              <RhfFieldError id={errorHelperId} message={fieldState.error?.message} />
            </FormGroup>
          );
        }}
      />

      <Controller
        name="required.stepB.selectionB2"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-b2';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection B-2:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection B-2"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {colorOptions.map((option, index) => (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                ))}
              </FormSelect>
              <RhfFieldError id={errorHelperId} message={fieldState.error?.message} />
            </FormGroup>
          );
        }}
      />

      <Controller
        name="required.stepB.selectionB3"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-b3';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} label="Selection B-3:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection B-3"
                id={fieldId}
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {colorOptions.map((option, index) => (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                ))}
              </FormSelect>
              <RhfFieldError id={errorHelperId} message={fieldState.error?.message} />
            </FormGroup>
          );
        }}
      />
    </WizardStepForm>
  );
};

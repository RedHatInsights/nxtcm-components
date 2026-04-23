import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';
import { WizardStepForm } from '../../WizardStepForm';

const appleOptions = [
  { value: '', label: 'Select an apple', disabled: false, isPlaceholder: true },
  { value: 'honeycrisp', label: 'Honeycrisp', disabled: false, isPlaceholder: false },
  { value: 'zestar', label: 'Zestar!', disabled: false, isPlaceholder: false },
  { value: 'sweetango', label: 'SweeTango', disabled: false, isPlaceholder: false },
];

export const StepC = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();

  return (
    <WizardStepForm>
      <Controller
        name="required.stepC.selectionC1"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-c1';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection C-1:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection C-1"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {appleOptions.map((option, index) => (
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
        name="required.stepC.selectionC2"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-c2';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection C-2:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection C-2"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {appleOptions.map((option, index) => (
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
        name="required.stepC.selectionC3"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-c3';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} label="Selection C-3:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection C-3"
                id={fieldId}
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {appleOptions.map((option, index) => (
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

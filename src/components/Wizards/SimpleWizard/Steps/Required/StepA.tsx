import { FormGroup, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardFormSchema';
import { WizardStepForm } from '../../WizardStepForm';

const numberOptions = [
  { value: '', label: 'Select a number', disabled: false, isPlaceholder: true },
  { value: '1', label: 'One', disabled: false, isPlaceholder: false },
  { value: '2', label: 'Two', disabled: false, isPlaceholder: false },
  { value: '3', label: 'Three', disabled: false, isPlaceholder: false },
];

export const StepA = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();

  return (
    <WizardStepForm>
      <Controller
        name="required.stepA.fullName"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'simple-form-name-01';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Full name">
              <TextInput
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                id={fieldId}
                isRequired
                name={field.name}
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                type="text"
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              />
              <RhfFieldError id={errorHelperId} message={fieldState.error?.message} />
            </FormGroup>
          );
        }}
      />

      <Controller
        name="required.stepA.selectionA1"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-a1';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection A-1:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection A-1"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {numberOptions.map((option, index) => (
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
        name="required.stepA.selectionA2"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-a2';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection A-2:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection A-2"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {numberOptions.map((option, index) => (
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
        name="required.stepA.selectionA3"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-a3';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} label="Selection A-3:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection A-3"
                id={fieldId}
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {numberOptions.map((option, index) => (
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

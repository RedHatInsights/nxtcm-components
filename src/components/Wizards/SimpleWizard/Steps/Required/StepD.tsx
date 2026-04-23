import { FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardFormSchema';
import { WizardStepForm } from '../../WizardStepForm';

const particleOptions = [
  { value: '', label: 'Select an atomic particle', disabled: false, isPlaceholder: true },
  { value: 'electron', label: 'Electron', disabled: false, isPlaceholder: false },
  { value: 'neutron', label: 'Neutron', disabled: false, isPlaceholder: false },
  { value: 'proton', label: 'Proton', disabled: false, isPlaceholder: false },
];

export const StepD = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();

  return (
    <WizardStepForm>
      <Controller
        name="required.stepD.selectionD1"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-d1';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection D-1:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection D-1"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {particleOptions.map((option, index) => (
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
        name="required.stepD.selectionD2"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-d2';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} isRequired label="Selection D-2:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection D-2"
                id={fieldId}
                isRequired
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {particleOptions.map((option, index) => (
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
        name="required.stepD.selectionD3"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'selection-d3';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} label="Selection D-3:" type="string">
              <FormSelect
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                aria-label="Selection D-3"
                id={fieldId}
                onBlur={field.onBlur}
                onChange={(_e, value) => {
                  field.onChange(value);
                }}
                validated={fieldState.error ? 'error' : 'default'}
                value={field.value}
              >
                {particleOptions.map((option, index) => (
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

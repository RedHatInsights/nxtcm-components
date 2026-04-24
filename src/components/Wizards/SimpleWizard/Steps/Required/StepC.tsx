// cspell:words patternfly
import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardSchema';

const appleOptions = [
  { value: '', label: 'Select an apple', disabled: false, isPlaceholder: true },
  { value: 'honeycrisp', label: 'Honeycrisp', disabled: false, isPlaceholder: false },
  { value: 'zestar', label: 'Zestar!', disabled: false, isPlaceholder: false },
  { value: 'sweetango', label: 'SweeTango', disabled: false, isPlaceholder: false },
];

export const StepC = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="required.stepC.selectionC1"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection C-1:" type="string" fieldId="selection-c1" isRequired>
            <FormSelect
              id="selection-c1"
              aria-label="Selection C-1"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepC.selectionC1');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {appleOptions.map((option, index) => {
                return (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                );
              })}
            </FormSelect>
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />

      <Controller
        name="required.stepC.selectionC2"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection C-2:" type="string" fieldId="selection-c2" isRequired>
            <FormSelect
              id="selection-c2"
              aria-label="Selection C-2"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepC.selectionC2');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {appleOptions.map((option, index) => {
                return (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                );
              })}
            </FormSelect>
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />

      <Controller
        name="required.stepC.selectionC3"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection C-3:" type="string" fieldId="selection-c3">
            <FormSelect
              id="selection-c3"
              aria-label="Selection C-3"
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepC.selectionC3');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {appleOptions.map((option, index) => {
                return (
                  <FormSelectOption
                    isDisabled={option.disabled}
                    key={index}
                    value={option.value}
                    label={option.label}
                    isPlaceholder={option.isPlaceholder}
                  />
                );
              })}
            </FormSelect>
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />
    </Form>
  );
};

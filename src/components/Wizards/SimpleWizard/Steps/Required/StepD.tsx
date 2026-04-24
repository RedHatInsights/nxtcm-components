// cspell:words patternfly
import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

const particleOptions = [
  { value: '', label: 'Select an atomic particle', disabled: false, isPlaceholder: true },
  { value: 'electron', label: 'Electron', disabled: false, isPlaceholder: false },
  { value: 'neutron', label: 'Neutron', disabled: false, isPlaceholder: false },
  { value: 'proton', label: 'Proton', disabled: false, isPlaceholder: false },
];

export const StepD = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="required.stepD.selectionD1"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection D-1:" type="string" fieldId="selection-d1" isRequired>
            <FormSelect
              id="selection-d1"
              aria-label="Selection D-1"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepD.selectionD1');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {particleOptions.map((option, index) => {
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
        name="required.stepD.selectionD2"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection D-2:" type="string" fieldId="selection-d2" isRequired>
            <FormSelect
              id="selection-d2"
              aria-label="Selection D-2"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepD.selectionD2');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {particleOptions.map((option, index) => {
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
        name="required.stepD.selectionD3"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection D-3:" type="string" fieldId="selection-d3">
            <FormSelect
              id="selection-d3"
              aria-label="Selection D-3"
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepD.selectionD3');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {particleOptions.map((option, index) => {
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

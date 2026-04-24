// cspell:words patternfly
import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

const colorOptions = [
  { value: '', label: 'Select a color', disabled: false, isPlaceholder: true },
  { value: 'red', label: 'Red', disabled: false, isPlaceholder: false },
  { value: 'green', label: 'Green', disabled: false, isPlaceholder: false },
  { value: 'blue', label: 'Blue', disabled: false, isPlaceholder: false },
];

export const StepB = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="required.stepB.selectionB1"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection B-1:" type="string" fieldId="selection-b1" isRequired>
            <FormSelect
              id="selection-b1"
              aria-label="Selection B-1"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepB.selectionB1');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {colorOptions.map((option, index) => {
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
        name="required.stepB.selectionB2"
        control={control}
        rules={{ required: 'Selection is required' }}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection B-2:" type="string" fieldId="selection-b2" isRequired>
            <FormSelect
              id="selection-b2"
              aria-label="Selection B-2"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepB.selectionB2');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {colorOptions.map((option, index) => {
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
        name="required.stepB.selectionB3"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection B-3:" type="string" fieldId="selection-b3">
            <FormSelect
              id="selection-b3"
              aria-label="Selection B-3"
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepB.selectionB3');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            >
              {colorOptions.map((option, index) => {
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

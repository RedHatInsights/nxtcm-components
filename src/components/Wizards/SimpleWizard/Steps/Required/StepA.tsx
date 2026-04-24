import { Form, FormGroup, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

const numberOptions = [
  { value: '', label: 'Select a number', disabled: false, isPlaceholder: true },
  { value: '1', label: 'One', disabled: false, isPlaceholder: false },
  { value: '2', label: 'Two', disabled: false, isPlaceholder: false },
  { value: '3', label: 'Three', disabled: false, isPlaceholder: false },
];

export const StepA = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="required.stepA.fullName"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Full name" isRequired fieldId="simple-form-name-01">
            <TextInput
              isRequired
              type="text"
              id="simple-form-name-01"
              name={field.name}
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepA.fullName');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            />
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />

      <Controller
        name="required.stepA.selectionA1"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection A-1:" type="string" fieldId="selection-a1" isRequired>
            <FormSelect
              id="selection-a1"
              aria-label="Selection A-1"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepA.selectionA1');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
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
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />

      <Controller
        name="required.stepA.selectionA2"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection A-2:" type="string" fieldId="selection-a2" isRequired>
            <FormSelect
              id="selection-a2"
              aria-label="Selection A-2"
              isRequired
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepA.selectionA2');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
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
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />

      <Controller
        name="required.stepA.selectionA3"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup label="Selection A-3:" type="string" fieldId="selection-a3">
            <FormSelect
              id="selection-a3"
              aria-label="Selection A-3"
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('required.stepA.selectionA3');
              }}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
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
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />
    </Form>
  );
};

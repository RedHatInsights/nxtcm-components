import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

export const StepF = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();
  return (
    <Form>
      <Controller
        name="optionText2"
        control={control}
        rules={{ required: 'Selection is required' }}
        render={({ field, fieldState }) => (
          <FormGroup fieldId="option-text-2" label="Option text 2">
            <TextInput
              id="option-text-2"
              type="text"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(_e, value) => {
                field.onChange(value);
              }}
              validated={fieldState.error ? 'error' : 'default'}
            />
            <RhfFieldError message={fieldState.error?.message} />
          </FormGroup>
        )}
      />
    </Form>
  );
};

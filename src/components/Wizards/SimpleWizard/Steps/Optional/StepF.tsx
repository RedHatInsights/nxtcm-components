import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

export const StepF = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="optional.stepF.optionText2"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup fieldId="option-text-2" label="Option text 2">
            <TextInput
              type="text"
              id="option-text-2"
              name={field.name}
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('optional.stepF.optionText2');
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
    </Form>
  );
};

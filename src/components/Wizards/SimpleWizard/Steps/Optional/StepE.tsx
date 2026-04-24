import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';

export const StepE = () => {
  const { control, trigger } = useFormContext<SimpleWizardFormValues>();

  return (
    <Form>
      <Controller
        name="optional.stepE.optionText1"
        control={control}
        render={({ field, fieldState }) => (
          <FormGroup fieldId="option-text-1" label="Option text 1">
            <TextInput
              type="text"
              id="option-text-1"
              name={field.name}
              value={field.value}
              onBlur={() => {
                field.onBlur();
                void trigger('optional.stepE.optionText1');
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

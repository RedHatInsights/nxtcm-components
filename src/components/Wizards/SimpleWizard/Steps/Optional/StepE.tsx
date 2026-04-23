import { FormGroup, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { RhfFieldError } from '../../RhfFieldError';
import type { SimpleWizardFormValues } from '../../simpleWizardForm';
import { WizardStepForm } from '../../WizardStepForm';

export const StepE = () => {
  const { control } = useFormContext<SimpleWizardFormValues>();

  return (
    <WizardStepForm>
      <Controller
        name="optional.stepE.optionText1"
        control={control}
        render={({ field, fieldState }) => {
          const fieldId = 'option-text-1';
          const errorHelperId = `${fieldId}-helper-error`;
          return (
            <FormGroup fieldId={fieldId} label="Option text 1">
              <TextInput
                aria-describedby={fieldState.error ? errorHelperId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                id={fieldId}
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
    </WizardStepForm>
  );
};

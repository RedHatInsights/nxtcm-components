import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

export const StepE = () => {
  return (
    <Form>
      <FormGroup fieldId="option-text-1" label="Option text 1">
        <TextInput id="option-text-1" name="option-text-1" type="text" />
        <RhfFieldError message={''} />
      </FormGroup>
    </Form>
  );
};

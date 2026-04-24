import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

export const StepF = () => {
  return (
    <Form>
      <FormGroup fieldId="option-text-2" label="Option text 2">
        <TextInput id="option-text-2" name="option-text-2" type="text" />
        <RhfFieldError message={''} />
      </FormGroup>
    </Form>
  );
};

import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

const colorOptions = [
  { value: '', label: 'Select a color', disabled: false, isPlaceholder: true },
  { value: 'red', label: 'Red', disabled: false, isPlaceholder: false },
  { value: 'green', label: 'Green', disabled: false, isPlaceholder: false },
  { value: 'blue', label: 'Blue', disabled: false, isPlaceholder: false },
];

export const StepB = () => {
  return (
    <Form>
      <FormGroup label="Selection B-1:" type="string" fieldId="selection-b1" isRequired>
        <FormSelect id="selection-b1" aria-label="Selection B-1" isRequired>
          {colorOptions.map((option, index) => (
            <FormSelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
              label={option.label}
              isPlaceholder={option.isPlaceholder}
            />
          ))}
        </FormSelect>
        <RhfFieldError message={''} />
      </FormGroup>

      <FormGroup label="Selection B-2:" type="string" fieldId="selection-b2" isRequired>
        <FormSelect id="selection-b2" aria-label="Selection B-2" isRequired>
          {colorOptions.map((option, index) => (
            <FormSelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
              label={option.label}
              isPlaceholder={option.isPlaceholder}
            />
          ))}
        </FormSelect>
        <RhfFieldError message={''} />
      </FormGroup>

      <FormGroup label="Selection B-3:" type="string" fieldId="selection-b3">
        <FormSelect id="selection-b3" aria-label="Selection B-3">
          {colorOptions.map((option, index) => (
            <FormSelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
              label={option.label}
              isPlaceholder={option.isPlaceholder}
            />
          ))}
        </FormSelect>
        <RhfFieldError message={''} />
      </FormGroup>
    </Form>
  );
};

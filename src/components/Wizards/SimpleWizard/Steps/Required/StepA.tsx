import { Form, FormGroup, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

const numberOptions = [
  { value: '', label: 'Select a number', disabled: false, isPlaceholder: true },
  { value: '1', label: 'One', disabled: false, isPlaceholder: false },
  { value: '2', label: 'Two', disabled: false, isPlaceholder: false },
  { value: '3', label: 'Three', disabled: false, isPlaceholder: false },
];

export const StepA = () => {
  return (
    <Form>
      <FormGroup label="Full name" isRequired fieldId="simple-form-name-01">
        <TextInput isRequired type="text" id="simple-form-name-01" name="simple-form-name-01" />
        <RhfFieldError message={''} />
      </FormGroup>

      <FormGroup label="Selection A-1:" type="string" fieldId="selection-a1" isRequired>
        <FormSelect id="selection-a1" name="selection-a1" aria-label="Selection A-1" isRequired>
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
        <RhfFieldError message={''} />
      </FormGroup>

      <FormGroup label="Selection A-2:" type="string" fieldId="selection-a2" isRequired>
        <FormSelect id="selection-a2" aria-label="Selection A-2" isRequired>
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
        <RhfFieldError message={''} />
      </FormGroup>

      <FormGroup label="Selection A-3:" type="string" fieldId="selection-a3">
        <FormSelect id="selection-a3" aria-label="Selection A-3">
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
        <RhfFieldError message={''} />
      </FormGroup>
    </Form>
  );
};

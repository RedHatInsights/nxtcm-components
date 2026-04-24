import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

const appleOptions = [
  { value: '', label: 'Select an apple', disabled: false, isPlaceholder: true },
  { value: 'honeycrisp', label: 'Honeycrisp', disabled: false, isPlaceholder: false },
  { value: 'zestar', label: 'Zestar!', disabled: false, isPlaceholder: false },
  { value: 'sweetango', label: 'SweeTango', disabled: false, isPlaceholder: false },
];

export const StepC = () => {
  return (
    <Form>
      <FormGroup label="Selection C-1:" type="string" fieldId="selection-c1" isRequired>
        <FormSelect id="selection-c1" aria-label="Selection C-1" isRequired>
          {appleOptions.map((option, index) => (
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

      <FormGroup label="Selection C-2:" type="string" fieldId="selection-c2" isRequired>
        <FormSelect id="selection-c2" aria-label="Selection C-2" isRequired>
          {appleOptions.map((option, index) => (
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

      <FormGroup label="Selection C-3:" type="string" fieldId="selection-c3">
        <FormSelect id="selection-c3" aria-label="Selection C-3">
          {appleOptions.map((option, index) => (
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

import { Form, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { RhfFieldError } from '../../RhfFieldError';

const particleOptions = [
  { value: '', label: 'Select an atomic particle', disabled: false, isPlaceholder: true },
  { value: 'electron', label: 'Electron', disabled: false, isPlaceholder: false },
  { value: 'neutron', label: 'Neutron', disabled: false, isPlaceholder: false },
  { value: 'proton', label: 'Proton', disabled: false, isPlaceholder: false },
];

export const StepD = () => {
  return (
    <Form>
      <FormGroup label="Selection D-1:" type="string" fieldId="selection-d1" isRequired>
        <FormSelect id="selection-d1" aria-label="Selection D-1" isRequired>
          {particleOptions.map((option, index) => (
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

      <FormGroup label="Selection D-2:" type="string" fieldId="selection-d2" isRequired>
        <FormSelect id="selection-d2" aria-label="Selection D-2" isRequired>
          {particleOptions.map((option, index) => (
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

      <FormGroup label="Selection D-3:" type="string" fieldId="selection-d3">
        <FormSelect id="selection-d3" aria-label="Selection D-3">
          {particleOptions.map((option, index) => (
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

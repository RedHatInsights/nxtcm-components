import { useCallback } from 'react';
import { NumberInput as PfNumberInput, type NumberInputProps } from '@patternfly/react-core';
import { type FormFieldProps, getValidatedState } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormNumberInputProps extends Omit<FormFieldProps, 'field'> {
  /** TanStack Form field API instance — value should be number or undefined */
  field: FormFieldProps['field'];
  /** Placeholder text */
  placeholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step amount for the +/- buttons */
  step?: number;
}

/**
 * PatternFly NumberInput wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="replicas">
 *   {(field) => (
 *     <FormNumberInput field={field} label="Replicas" min={1} max={10} />
 *   )}
 * </form.Field>
 * ```
 */
export function FormNumberInput(props: FormNumberInputProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    placeholder,
    min = 0,
    max,
    step = 1,
    id,
  } = props;

  const fieldId = id ?? field.name;
  const value = typeof field.state.value === 'number' ? field.state.value : 0;
  const validated = getValidatedState(field);

  const handleMinus = useCallback((): void => {
    const next = value - step;
    field.handleChange(next < min ? min : next);
  }, [field, value, step, min]);

  const handlePlus = useCallback((): void => {
    const next = value + step;
    field.handleChange(max != null && next > max ? max : next);
  }, [field, value, step, max]);

  const handleChange = useCallback<Required<NumberInputProps>['onChange']>(
    (event) => {
      const raw = Number((event.target as HTMLInputElement).value);
      if (Number.isFinite(raw)) {
        field.handleChange(raw);
      }
    },
    [field]
  );

  return (
    <FieldGroup
      field={field}
      label={label}
      isRequired={isRequired}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      helperText={helperText}
      id={fieldId}
    >
      <PfNumberInput
        id={fieldId}
        value={value}
        placeholder={placeholder}
        validated={validated}
        onMinus={handleMinus}
        onChange={handleChange}
        onPlus={handlePlus}
        onBlur={field.handleBlur}
        min={min}
        max={max}
        isDisabled={isDisabled}
      />
    </FieldGroup>
  );
}

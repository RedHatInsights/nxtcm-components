import { type ReactNode, useCallback, useId } from 'react';
import { Flex, Radio as PfRadio } from '@patternfly/react-core';
import { type FormFieldProps } from './types';
import { FieldGroup } from './FieldGroup';
import { LabelHelp } from './LabelHelp';

/** A single radio option */
export interface RadioOption {
  /** Unique value for this radio option */
  value: string;
  /** Display label for the radio */
  label: string;
  /** Optional description rendered below the label (supports ReactNode for rich content) */
  description?: ReactNode;
  /** Whether this option is disabled */
  isDisabled?: boolean;
  /** Body content for a help popover displayed next to the radio label */
  popover?: ReactNode;
  /** Header text for the per-option help popover */
  popoverTitle?: string;
}

export interface FormRadioGroupProps extends FormFieldProps {
  /** List of radio options to render */
  options: RadioOption[];
}

/**
 * PatternFly Radio group wired to a TanStack Form field.
 *
 * @example
 * ```tsx
 * <form.Field name="networkType">
 *   {(field) => (
 *     <FormRadioGroup
 *       field={field}
 *       label="Network type"
 *       options={[
 *         { value: 'public', label: 'Public', popover: 'Accessible from the internet' },
 *         { value: 'private', label: 'Private', description: 'Uses PrivateLink' },
 *       ]}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormRadioGroup(props: FormRadioGroupProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    options,
    id,
  } = props;

  const fieldId = id ?? field.name;
  const groupName = useId();

  const handleChange = useCallback(
    (value: string): void => {
      field.handleChange(value);
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
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
        {options.map((option) => (
          <PfRadio
            key={option.value}
            id={`${fieldId}-${option.value}`}
            name={groupName}
            label={
              option.popover ? (
                <span>
                  {option.label}
                  <LabelHelp
                    id={`${fieldId}-${option.value}`}
                    labelHelp={option.popover}
                    labelHelpTitle={option.popoverTitle}
                  />
                </span>
              ) : (
                option.label
              )
            }
            description={option.description}
            isChecked={field.state.value === option.value}
            onChange={() => handleChange(option.value)}
            isDisabled={isDisabled || option.isDisabled}
          />
        ))}
      </Flex>
    </FieldGroup>
  );
}

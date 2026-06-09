import {
  type ComponentProps,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
} from 'react';
import { FormGroup, NumberInput as PfNumberInput } from '@patternfly/react-core';
import { getValidated, HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';

type NumberInputComponentProps = ComponentProps<typeof PfNumberInput>;

function lowercaseFirst(label: string) {
  if (label) {
    return label[0].toLowerCase() + label.substring(1);
  }
  return label;
}

export interface NumberInputProps extends Omit<
  NumberInputComponentProps,
  'onChange' | 'onMinus' | 'onPlus' | 'validated'
> {
  id: string;
  label: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  isRequired?: boolean;
  zeroIsUndefined?: boolean;
  errorMessage?: ReactNode;
  helperText?: ReactNode;
  isError?: boolean;
  onChange?: (event: SyntheticEvent, value: number | undefined) => void;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
  isDisabled?: boolean;
}

export function NumberInput(props: NumberInputProps) {
  const {
    id,
    label,
    placeholder,
    labelHelp,
    labelHelpTitle,
    isRequired,
    min,
    value,
    zeroIsUndefined,
    onChange,
    errorMessage,
    helperText,
    isError,
    isSuccess,
    successMessage,
    isDisabled,
    inputAriaLabel: inputAriaLabelFromProps,
    ...numberInputRest
  } = props;

  const placeHolderText =
    placeholder ?? (label && label.length ? `Enter the ${lowercaseFirst(label)}` : '');

  const numValue = typeof value === 'number' ? value : undefined;
  // PfNumberInput defaults undefined value to 0; '' keeps the field visually empty when value is unset.
  const pfValue = zeroIsUndefined && numValue === undefined ? '' : numValue;

  const onMinus = useCallback(
    (event: MouseEvent) => {
      const newValue = numValue != null ? numValue - 1 : 0;
      if (zeroIsUndefined && newValue === 0) {
        onChange?.(event, undefined);
      } else {
        onChange?.(event, newValue);
      }
    },
    [numValue, onChange, zeroIsUndefined]
  );

  const onChangeCallback = useCallback<Required<NumberInputComponentProps>['onChange']>(
    (event: FormEvent<HTMLInputElement>) => {
      const newValue = Number(event.currentTarget.value);
      if (zeroIsUndefined && newValue === 0) {
        onChange?.(event, undefined);
      } else if (Number.isInteger(newValue)) {
        onChange?.(event, newValue);
      }
    },
    [onChange, zeroIsUndefined]
  );

  const onPlus = useCallback(
    (event: MouseEvent) => {
      if (numValue != null) {
        onChange?.(event, numValue + 1);
      } else {
        onChange?.(event, 1);
      }
    },
    [numValue, onChange]
  );

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={label}
      isRequired={isRequired}
      labelHelp={<LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    >
      <PfNumberInput
        {...numberInputRest}
        id={id}
        inputAriaLabel={inputAriaLabelFromProps ?? label}
        placeholder={placeHolderText}
        validated={getValidated(isError, isSuccess)}
        value={pfValue}
        onMinus={onMinus}
        onChange={onChangeCallback}
        onPlus={onPlus}
        min={min === undefined ? 0 : min}
        aria-describedby={helperTextId({
          id,
          errorMessage,
          helperText,
          isError,
          isSuccess,
          successMessage,
        })}
        isDisabled={isDisabled}
      />
      <HelperText
        id={id}
        errorMessage={errorMessage}
        helperText={helperText}
        isError={isError}
        isSuccess={isSuccess}
        successMessage={successMessage}
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
}

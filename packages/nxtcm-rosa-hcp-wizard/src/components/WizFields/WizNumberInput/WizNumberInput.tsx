import type { SyntheticEvent } from 'react';
import { type FieldValues, useController } from 'react-hook-form';
import { requiredFromYup } from '../../../utilities/yupFieldRequired';
import { NumberInput, type NumberInputProps } from '../../Fields/NumberInput';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

type WizNumberInputControlledKeys =
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizNumberInputSpreadProps = Omit<
  NumberInputProps,
  | WizNumberInputControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
  | 'placeholder'
> &
  Partial<
    Pick<
      NumberInputProps,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle' | 'placeholder'
    >
  >;

export type WizNumberInputProps<TFieldValues extends FieldValues = FieldValues> =
  WizNumberInputSpreadProps & WizRhfBoundFieldProps<TFieldValues>;

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `placeholder`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`.
 * Pass `isRequired` to override; when omitted and `schema` is set, required UI follows Yup for this path.
 */
export function WizNumberInput<TFieldValues extends FieldValues = FieldValues>(
  props: WizNumberInputProps<TFieldValues>
) {
  const {
    name,
    control: controlProp,
    schema,
    yupDescribeOptions, // Used for conditional branching with .when()
    isRequired: isRequiredProp,
    id: idProp,
    label: labelProp,
    helperText: helperTextProp,
    labelHelp: labelHelpProp,
    labelHelpTitle: labelHelpTitleProp,
    placeholder: placeholderProp,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizNumberInput', controlProp);
  const { id, label, helperText, labelHelp, labelHelpTitle, placeholder } = useWizFieldPresentation(
    {
      name,
      schema,
      yupDescribeOptions,
      idProp,
      labelProp,
      helperTextProp,
      labelHelpProp,
      labelHelpTitleProp,
      placeholderProp,
      labelMode: 'stringField',
      includePlaceholder: true,
    }
  );

  const isRequired = isRequiredProp ?? requiredFromYup(schema, name, yupDescribeOptions);

  const {
    field,
    fieldState: { invalid, isTouched, error },
    formState: { isSubmitted },
  } = useController({ name, control });

  const stepValidationRevealed = useWizStepValidationRevealed(String(name));
  const showError = wizFieldShowsError(invalid, isTouched, isSubmitted || stepValidationRevealed);

  const value =
    typeof field.value === 'number' && !Number.isNaN(field.value) ? field.value : undefined;

  const onChange = (_event: SyntheticEvent, next: number | undefined) => {
    field.onChange(next);
  };

  return (
    <NumberInput
      {...rest}
      id={id}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      name={field.name}
      value={value}
      onBlur={field.onBlur}
      onChange={onChange}
      errorMessage={error?.message}
      isError={showError}
    />
  );
}

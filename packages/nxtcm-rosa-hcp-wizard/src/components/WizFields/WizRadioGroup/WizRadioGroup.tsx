import { type FieldValues, useController } from 'react-hook-form';
import { requiredFromYup } from '../../../utilities/yupFieldRequired';
import { RadioGroup, type RadioGroupProps } from '../../Fields/RadioGroup';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

type WizRadioGroupControlledKeys =
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizRadioGroupSpreadProps = Omit<
  RadioGroupProps,
  | WizRadioGroupControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
> &
  Partial<
    Pick<
      RadioGroupProps,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle'
    >
  >;

export type WizRadioGroupProps<TFieldValues extends FieldValues = FieldValues> =
  WizRadioGroupSpreadProps &
    WizRhfBoundFieldProps<TFieldValues> & {
      hideLabel?: boolean;
    };

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`. Use `hideLabel` when the surrounding step already provides a heading.
 * Pass `isRequired` to override; when omitted and `schema` is set, required UI follows Yup for this path.
 * Use `yup.string()` / `yup.mixed()` with `.oneOf([...])` / `.required()` as needed for the bound field.
 */
export function WizRadioGroup<TFieldValues extends FieldValues = FieldValues>(
  props: WizRadioGroupProps<TFieldValues>
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
    hideLabel,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizRadioGroup', controlProp);
  const { id, label, fieldSetLegend, helperText, labelHelp, labelHelpTitle } =
    useWizFieldPresentation({
      name,
      schema,
      yupDescribeOptions,
      idProp,
      labelProp,
      helperTextProp,
      labelHelpProp,
      labelHelpTitleProp,
      labelMode: 'stringField',
    });

  const isRequired = isRequiredProp ?? requiredFromYup(schema, name, yupDescribeOptions);

  const {
    field,
    fieldState: { invalid, isTouched, error },
    formState: { isSubmitted },
  } = useController({ name, control });

  const stepValidationRevealed = useWizStepValidationRevealed(String(name));
  const showError = wizFieldShowsError(invalid, isTouched, isSubmitted || stepValidationRevealed);

  return (
    <RadioGroup
      {...rest}
      id={id}
      label={fieldSetLegend === false || hideLabel ? undefined : label}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      errorMessage={error?.message}
      isError={showError}
    />
  );
}

import { type FormEvent } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { getYupFieldPresentationMeta } from '../../../../../../utilities/yupFieldPresentationMeta';
import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';

import { TextInput, type TextInputProps } from '../../Fields/TextInput';
import {
  stringLabelFromYupMeta,
  useWizRhfControl,
  wizFallbackFieldId,
  wizFallbackLabelFromFieldPath,
  wizFieldShowsError,
  type WizRhfBoundFieldProps,
} from '../wizFieldRhf';

type WizTextInputControlledKeys =
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizTextInputSpreadProps = Omit<
  TextInputProps,
  | WizTextInputControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'required'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
> &
  Partial<
    Pick<
      TextInputProps,
      'id' | 'label' | 'isRequired' | 'required' | 'helperText' | 'labelHelp' | 'labelHelpTitle'
    >
  >;

export type WizTextInputProps<TFieldValues extends FieldValues = FieldValues> =
  WizTextInputSpreadProps & WizRhfBoundFieldProps<TFieldValues>;

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props; when omitted and `schema` is set, they come from that field’s Yup `.meta()`.
 * Pass `isRequired` (and optionally native `required`) to override; when `isRequired` is omitted and `schema` is set, required UI follows Yup for this path. `TextInput` applies `required={isRequired || required}` on the input.
 */
export function WizTextInput<TFieldValues extends FieldValues = FieldValues>(
  props: WizTextInputProps<TFieldValues>
) {
  const {
    name,
    control: controlProp,
    schema,
    yupDescribeOptions, // Used for conditional branching with .when()
    isRequired: isRequiredProp,
    required: requiredProp,
    id: idProp,
    label: labelProp,
    helperText: helperTextProp,
    labelHelp: labelHelpProp,
    labelHelpTitle: labelHelpTitleProp,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizTextInput', controlProp);

  const fromYup =
    schema !== undefined
      ? getYupFieldPresentationMeta(schema, String(name), yupDescribeOptions)
      : undefined;

  const id = idProp ?? fromYup?.id ?? wizFallbackFieldId(name);
  const fallbackLabel = wizFallbackLabelFromFieldPath(name);
  const label =
    labelProp ??
    (schema !== undefined ? stringLabelFromYupMeta(fromYup?.label, fallbackLabel) : undefined) ??
    fallbackLabel;
  const helperText = helperTextProp ?? fromYup?.helperText;
  const labelHelp = labelHelpProp ?? fromYup?.labelHelp;
  const labelHelpTitle = labelHelpTitleProp ?? fromYup?.labelHelpTitle;

  const isRequired = isRequiredProp ?? requiredFromYup(schema, name, yupDescribeOptions);

  const {
    field,
    fieldState: { invalid, isTouched, error },
    formState: { isSubmitted },
  } = useController({ name, control });

  const showError = wizFieldShowsError(invalid, isTouched, isSubmitted);

  const onChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    field.onChange(value);
  };

  return (
    <TextInput
      {...rest}
      id={id}
      label={label}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      required={requiredProp}
      name={field.name}
      ref={field.ref}
      value={field.value ?? ''}
      onBlur={field.onBlur}
      onChange={onChange}
      errorMessage={error?.message}
      isError={showError}
    />
  );
}

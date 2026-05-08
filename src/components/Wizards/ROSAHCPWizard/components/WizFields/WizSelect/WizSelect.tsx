import { type FieldValues, useController } from 'react-hook-form';

import { getYupFieldPresentationMeta } from '../../../../../../utilities/yupFieldPresentationMeta';
import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';

import { Select, type SelectProps } from '../../Fields/Select';
import {
  stringLabelFromYupMeta,
  useWizRhfControl,
  wizFallbackFieldId,
  wizFallbackLabelFromFieldPath,
  wizFieldShowsError,
  type WizRhfBoundFieldProps,
} from '../wizFieldRhf';

type WizSelectControlledKeys = 'value' | 'onChange' | 'onBlur' | 'errorMessage' | 'isError';

type WizSelectSpreadProps<TOption = string> = Omit<
  SelectProps<TOption>,
  | WizSelectControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
> &
  Partial<
    Pick<
      SelectProps<TOption>,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle'
    >
  >;

export type WizSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption = string,
> = WizSelectSpreadProps<TOption> & WizRhfBoundFieldProps<TFieldValues>;

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props; when omitted and `schema` is set, they come from that field’s Yup `.meta()`.
 * Pass `isRequired` to override; when omitted and `schema` is set, required UI follows Yup for this path.
 */
export function WizSelect<TFieldValues extends FieldValues = FieldValues, TOption = string>(
  props: WizSelectProps<TFieldValues, TOption>
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
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizSelect', controlProp);

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

  return (
    <Select<TOption>
      {...rest}
      id={id}
      label={label}
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

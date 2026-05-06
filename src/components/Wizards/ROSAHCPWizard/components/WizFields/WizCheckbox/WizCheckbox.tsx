import { type FormEvent, type ReactNode } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { getYupFieldPresentationMeta } from '../../../../../../utilities/yupFieldPresentationMeta';
import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';
import { Checkbox, type CheckboxProps } from '../../Fields/Checkbox';
import {
  useWizRhfControl,
  wizFallbackFieldId,
  wizFallbackLabelFromFieldPath,
  wizFieldShowsError,
  type WizRhfBoundFieldProps,
} from '../wizFieldRhf';

type WizCheckboxControlledKeys =
  | 'isChecked'
  | 'onChange'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizCheckboxSpreadProps = Omit<
  CheckboxProps,
  | WizCheckboxControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
> &
  Partial<
    Pick<
      CheckboxProps,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle'
    >
  >;

export type WizCheckboxProps<TFieldValues extends FieldValues = FieldValues> =
  WizCheckboxSpreadProps & WizRhfBoundFieldProps<TFieldValues>;

/**
 * Bound to react-hook-form and Yup (via `resolver` on `useForm`).
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props; when omitted and `schema` is set, they come from that field’s Yup `.meta()` (use `title` in meta for the group heading when needed).
 * Pass `isRequired` to override;
 */
export function WizCheckbox<TFieldValues extends FieldValues = FieldValues>(
  props: WizCheckboxProps<TFieldValues>
) {
  const {
    name,
    control: controlProp,
    schema,
    yupDescribeOptions, // Used for conditional branching with .when()
    isRequired: isRequiredProp,
    id: idProp,
    label: labelProp,
    title: titleProp,
    helperText: helperTextProp,
    labelHelp: labelHelpProp,
    labelHelpTitle: labelHelpTitleProp,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizCheckbox', controlProp);

  const fromYup =
    schema !== undefined
      ? getYupFieldPresentationMeta(schema, String(name), yupDescribeOptions)
      : undefined;

  const id = idProp ?? fromYup?.id ?? wizFallbackFieldId(name);
  const label: ReactNode = labelProp ?? fromYup?.label ?? wizFallbackLabelFromFieldPath(name);
  const title = titleProp ?? fromYup?.title;
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

  const onChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    field.onChange(checked);
  };

  return (
    <Checkbox
      {...rest}
      id={id}
      label={label}
      title={title}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      name={field.name}
      isChecked={Boolean(field.value)}
      onBlur={field.onBlur}
      onChange={onChange}
      errorMessage={error?.message}
      isError={showError}
    />
  );
}

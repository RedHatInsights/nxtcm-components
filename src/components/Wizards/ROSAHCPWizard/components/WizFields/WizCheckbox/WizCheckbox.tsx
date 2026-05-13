import { type FormEvent } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';
import { Checkbox, type CheckboxProps } from '../../Fields/Checkbox';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

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
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`. Use `title` in meta for the group heading when needed.
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
  const { id, title, label, helperText, labelHelp, labelHelpTitle } = useWizFieldPresentation({
    name,
    schema,
    yupDescribeOptions,
    idProp,
    labelProp,
    titleProp,
    helperTextProp,
    labelHelpProp,
    labelHelpTitleProp,
    labelMode: 'checkbox',
  });

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

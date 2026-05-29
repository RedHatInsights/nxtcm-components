import { type FormEvent, type ReactNode } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';

import { TextInput, type TextInputProps } from '../../Fields/TextInput';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';
import { FieldWithAPIErrorAlert } from '../../FieldWithAPIErrorAlert';

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
  | 'placeholder'
> &
  Partial<
    Pick<
      TextInputProps,
      | 'id'
      | 'label'
      | 'isRequired'
      | 'required'
      | 'helperText'
      | 'labelHelp'
      | 'labelHelpTitle'
      | 'placeholder'
    >
  >;

export type WizTextInputProps<TFieldValues extends FieldValues = FieldValues> =
  WizTextInputSpreadProps &
    WizRhfBoundFieldProps<TFieldValues> & {
      /**
       * Optional API/load failure content shown in `FieldWithAPIErrorAlert` when set.
       */
      apiError?: ReactNode | string;
      /** When true, refresh/retry UI in the alert reflects loading state. */
      isFetching?: boolean;
    };

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `placeholder`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`.
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
    placeholder: placeholderProp,
    apiError,
    isFetching,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizTextInput', controlProp);
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

  const onChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    field.onChange(value);
  };

  const textInput = (
    <TextInput
      {...rest}
      id={id}
      label={label}
      placeholder={placeholder}
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
  if (apiError) {
    return (
      <FieldWithAPIErrorAlert error={apiError} isFetching={isFetching ?? false} fieldName={label}>
        {textInput}
      </FieldWithAPIErrorAlert>
    );
  }
  return textInput;
}

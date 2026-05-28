import { type ReactNode, useCallback, useState } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { requiredFromYup } from '@/utilities/yupFieldRequired';

import { FieldWithAPIErrorAlert } from '../../FieldWithAPIErrorAlert';
import { Select, type SelectProps } from '../../Fields/Select';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

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
  | 'placeholder'
> &
  Partial<
    Pick<
      SelectProps<TOption>,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle' | 'placeholder'
    >
  >;

export type WizSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption = string,
> = WizSelectSpreadProps<TOption> &
  WizRhfBoundFieldProps<TFieldValues> & {
    /**
     * Optional API/load failure content shown in `FieldWithAPIErrorAlert` when set (truthy).
     * `onRefresh` alone does not wrap the field; it is passed through to `Select` and used as the alert retry when `apiError` is set.
     */
    apiError?: ReactNode | string;
  };

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `placeholder`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or dot-path keys (`labelKey`, `placeholderKey`, `helperTextKey`, etc.) resolved from `RosaHcpWizardStringsProvider`.
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
    placeholder: placeholderProp,
    apiError,
    isLoading,
    onRefresh,
    ...rest
  } = props;

  const control = useWizRhfControl<TFieldValues>('WizSelect', controlProp);
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    field,
    fieldState: { invalid, isTouched, error },
    formState: { isSubmitted },
  } = useController({ name, control });

  const stepValidationRevealed = useWizStepValidationRevealed(String(name));
  const showError = wizFieldShowsError(invalid, isTouched, isSubmitted || stepValidationRevealed);

  /** Select clears with `undefined`; RHF keeps the prior value for Yup string fields (default `''`). */
  const handleChange = useCallback(
    (next: TOption | string | number | undefined) => {
      field.onChange(next === undefined ? '' : next);
    },
    [field.onChange]
  );

  const select = (
    <Select<TOption>
      {...rest}
      id={id}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      value={field.value}
      onBlur={field.onBlur}
      onChange={handleChange}
      errorMessage={error?.message}
      isError={showError && !isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isLoading={isLoading}
      onRefresh={onRefresh}
    />
  );

  if (apiError) {
    return (
      <FieldWithAPIErrorAlert
        error={apiError}
        isFetching={isLoading ?? false}
        fieldName={label}
        retry={onRefresh}
      >
        {select}
      </FieldWithAPIErrorAlert>
    );
  }
  return select;
}

import { type ReactNode, useState } from 'react';
import { type FieldValues, useController } from 'react-hook-form';
import { requiredFromYup } from '../../../utilities/yupFieldRequired';
import { FieldWithAPIErrorAlert } from '../../FieldWithAPIErrorAlert';
import { MultiSelect, type MultiSelectProps } from '../../Fields/MultiSelect';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizardFieldNavErrorSuppression } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

type WizMultiSelectControlledKeys = 'value' | 'onChange' | 'onBlur' | 'errorMessage' | 'isError';

type WizMultiSelectSpreadProps<TOption = string> = Omit<
  MultiSelectProps<TOption>,
  | WizMultiSelectControlledKeys
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
      MultiSelectProps<TOption>,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle' | 'placeholder'
    >
  >;

export type WizMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TOption = string,
> = WizMultiSelectSpreadProps<TOption> &
  WizRhfBoundFieldProps<TFieldValues> & {
    /**
     * Optional API/load failure content shown in `FieldWithAPIErrorAlert` when set (truthy).
     * `onRefresh` alone does not wrap the field; it is passed through to `MultiSelect` and used as the alert retry when `apiError` is set.
     */
    apiError?: ReactNode | string;
  };

/**
 * Checkbox multiselect bound to react-hook-form, with the same presentation wiring as {@link WizSelect}.
 *
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Field value must be an array (or undefined); non-array values are coerced to `[]` for the control.
 */
export function WizMultiSelect<TFieldValues extends FieldValues = FieldValues, TOption = string>(
  props: WizMultiSelectProps<TFieldValues, TOption>
) {
  const {
    name,
    control: controlProp,
    schema,
    yupDescribeOptions,
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

  const control = useWizRhfControl<TFieldValues>('WizMultiSelect', controlProp);
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

  const showError = wizFieldShowsError(invalid, isTouched, isSubmitted);
  useWizardFieldNavErrorSuppression(String(name), isMenuOpen);

  const raw = field.value;
  const value = Array.isArray(raw) ? (raw as TOption[]) : [];

  const multiSelect = (
    <MultiSelect<TOption>
      {...rest}
      id={id}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      value={value}
      onBlur={field.onBlur}
      onChange={field.onChange}
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
        {multiSelect}
      </FieldWithAPIErrorAlert>
    );
  }
  return multiSelect;
}

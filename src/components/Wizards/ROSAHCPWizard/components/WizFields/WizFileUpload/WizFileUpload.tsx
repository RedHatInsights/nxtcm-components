import type { DropEvent } from '@patternfly/react-core';
import { type FieldValues, useController } from 'react-hook-form';

import { requiredFromYup } from '../../../../../../utilities/yupFieldRequired';

import { FileUpload, type FileUploadProps } from '../../Fields/FileUpload';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useWizRhfControl, wizFieldShowsError, type WizRhfBoundFieldProps } from '../wizFieldRhf';

type WizFileUploadControlledKeys =
  | 'value'
  | 'onDataChange'
  | 'onFileInputChange'
  | 'onClearClick'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizFileUploadSpreadProps = Omit<
  FileUploadProps,
  | WizFileUploadControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
> &
  Partial<
    Pick<
      FileUploadProps,
      'id' | 'label' | 'isRequired' | 'helperText' | 'labelHelp' | 'labelHelpTitle'
    >
  >;

/**
 * @remarks {@link FileUpload} labels are strings; non-string Yup meta labels are coerced like other `Wiz*` string labels.
 */
export type WizFileUploadProps<TFieldValues extends FieldValues = FieldValues> =
  WizFileUploadSpreadProps & WizRhfBoundFieldProps<TFieldValues>;

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`.
 * Pass `isRequired` to override; when omitted and `schema` is set, required UI follows Yup for this path.
 */
export function WizFileUpload<TFieldValues extends FieldValues = FieldValues>(
  props: WizFileUploadProps<TFieldValues>
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

  const control = useWizRhfControl<TFieldValues>('WizFileUpload', controlProp);
  const { id, label, helperText, labelHelp, labelHelpTitle } = useWizFieldPresentation({
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

  const onDataChange = (_event: DropEvent, data: string) => {
    field.onChange(data);
  };

  const onClearClick = () => {
    field.onChange('');
  };

  return (
    <FileUpload
      {...rest}
      id={id}
      label={label}
      helperText={helperText}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      isRequired={isRequired}
      name={field.name}
      value={field.value ?? ''}
      onBlur={field.onBlur}
      onDataChange={onDataChange}
      onClearClick={onClearClick}
      errorMessage={error?.message}
      isError={showError}
    />
  );
}

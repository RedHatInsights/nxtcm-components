import { FileUpload, type DropEvent, FormGroup } from '@patternfly/react-core';
import { useState } from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { fieldIdFromPath } from './fieldId';
import { LabelHelp } from './components/LabelHelp';

export type RosaFileUploadProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  placeholder?: string;
  disabled?: boolean;
  validation?: (value: string) => string | undefined;
};

export function RosaFileUpload(props: RosaFileUploadProps) {
  const [fileName, setFileName] = useState('');
  const { control } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);

  const { field, fieldState } = useController({
    control,
    name: props.path,
    rules: {
      validate: (value) => {
        const v = typeof value === 'string' ? value : '';
        const err = props.validation?.(v);
        return err ? err : true;
      },
    },
  });

  const handleFileChange = async (_e: DropEvent, file: File) => {
    setFileName(file.name);
    field.onChange(await file.text());
  };

  const handleFileContentChange = (
    _e: React.ChangeEvent<HTMLTextAreaElement> | DropEvent,
    value: string
  ) => {
    field.onChange(value);
  };

  const handleClear = () => {
    setFileName('');
    field.onChange('');
  };

  const fileUpload = (
    <FileUpload
      id={id}
      filename={fileName}
      type="text"
      value={typeof field.value === 'string' ? field.value : ''}
      onFileInputChange={handleFileChange}
      onDataChange={handleFileContentChange}
      onTextChange={handleFileContentChange}
      onClearClick={handleClear}
      name={typeof field.value === 'string' ? field.value : ''}
    />
  );

  if (!props.label) {
    return fileUpload;
  }

  const showError =
    !!fieldState.error && (fieldState.isTouched || isSubmitted || afterStepNav);

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={props.label}
      labelHelp={
        <LabelHelp id={id} labelHelp={props.labelHelp} labelHelpTitle={props.labelHelpTitle} />
      }
    >
      {fileUpload}
      {showError && fieldState.error?.message && (
        <div className="pf-v6-c-form__helper-text pf-m-error">{fieldState.error.message}</div>
      )}
    </FormGroup>
  );
}

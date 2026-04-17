import { useCallback, useState } from 'react';
import { FileUpload as PfFileUpload, type DropEvent } from '@patternfly/react-core';
import { type FormFieldProps } from './types';
import { FieldGroup } from './FieldGroup';

export interface FormFileUploadProps extends FormFieldProps {
  /**
   * Accepted file types as a comma-separated list of MIME types or extensions.
   * @example ".json,.yaml,application/json"
   */
  accept?: string;
  /** Type of file upload — defaults to "text" */
  type?: 'text' | 'dataURL';
}

/**
 * PatternFly FileUpload wired to a TanStack Form field.
 * Stores the file content (text) as the field value.
 *
 * @example
 * ```tsx
 * <form.Field name="certificate">
 *   {(field) => (
 *     <FormFileUpload field={field} label="Certificate" accept=".pem,.crt" />
 *   )}
 * </form.Field>
 * ```
 */
export function FormFileUpload(props: FormFileUploadProps): JSX.Element {
  const {
    field,
    label,
    isRequired,
    isDisabled,
    labelHelp,
    labelHelpTitle,
    helperText,
    accept,
    type = 'text',
    id,
  } = props;

  const fieldId = id ?? field.name;
  const [fileName, setFileName] = useState('');

  const handleFileChange = useCallback(
    async (_event: DropEvent, file: File): Promise<void> => {
      setFileName(file.name);
      const content = await file.text();
      field.handleChange(content);
    },
    [field]
  );

  const handleDataChange = useCallback(
    (_event: DropEvent, value: string): void => {
      field.handleChange(value);
    },
    [field]
  );

  const handleTextChange = useCallback(
    (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string): void => {
      field.handleChange(value);
    },
    [field]
  );

  const handleClear = useCallback((): void => {
    setFileName('');
    field.handleChange('');
  }, [field]);

  return (
    <FieldGroup
      field={field}
      label={label}
      isRequired={isRequired}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      helperText={helperText}
      id={fieldId}
    >
      <PfFileUpload
        id={fieldId}
        type={type}
        value={field.state.value ?? ''}
        filename={fileName}
        //eslint-ignore next-line @typescript-eslint/no-misused-promises
        onFileInputChange={handleFileChange}
        onDataChange={handleDataChange}
        onTextChange={handleTextChange}
        onClearClick={handleClear}
        isDisabled={isDisabled}
        browseButtonText="Browse..."
        filenamePlaceholder="Drag and drop a file or browse to upload"
        allowEditingUploadedText
        accept={accept}
      />
    </FieldGroup>
  );
}

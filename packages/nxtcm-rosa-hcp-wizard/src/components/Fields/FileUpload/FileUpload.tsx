import { type ComponentProps, type ReactNode, useCallback, useEffect, useState } from 'react';
import { type DropEvent, FileUpload as PfFileUpload, FormGroup } from '@patternfly/react-core';
import { getValidated, HelperText, helperTextId } from '../HelperText';
import { LabelHelp } from '../LabelHelp';

type FileUploadComponentProps = ComponentProps<typeof PfFileUpload>;

export interface FileUploadProps extends FileUploadComponentProps {
  id: string;
  label?: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  helperText?: ReactNode;
  errorMessage?: ReactNode | string;
  isError?: boolean;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
  isLoading?: boolean;
}

export function FileUpload(props: FileUploadProps) {
  const {
    label,
    labelHelp,
    labelHelpTitle,
    helperText,
    errorMessage,
    isSuccess,
    isError,
    successMessage,
    filename: filenameProp,
    onFileInputChange,
    onClearClick,
    value,
    id,
    isRequired,
    isDisabled,
    ...fileUploadRest
  } = props;

  const isFilenameControlled = filenameProp !== undefined;
  const [uncontrolledFilename, setUncontrolledFilename] = useState('');

  const displayFilename = isFilenameControlled ? filenameProp : uncontrolledFilename;

  const handleFileInputChange = useCallback(
    (event: DropEvent, file: File) => {
      if (!isFilenameControlled) {
        setUncontrolledFilename(file.name);
      }
      onFileInputChange?.(event, file);
    },
    [isFilenameControlled, onFileInputChange]
  );

  const handleClearClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isFilenameControlled) {
        setUncontrolledFilename('');
      }
      onClearClick?.(event);
    },
    [isFilenameControlled, onClearClick]
  );

  useEffect(() => {
    if (!isFilenameControlled && (value === '' || value === null)) {
      setUncontrolledFilename('');
    }
  }, [value, isFilenameControlled]);

  const fileUpload = (
    <>
      <PfFileUpload
        id={id}
        {...fileUploadRest}
        type="text"
        value={value}
        filename={displayFilename}
        isRequired={isRequired}
        isDisabled={isDisabled}
        onFileInputChange={handleFileInputChange}
        onClearClick={handleClearClick}
        validated={getValidated(isError, isSuccess)}
        aria-describedby={helperTextId({
          id,
          errorMessage,
          helperText,
          isError,
          isSuccess,
          successMessage,
        })}
      />
      <HelperText
        id={id}
        errorMessage={errorMessage}
        helperText={helperText}
        isError={isError}
        isSuccess={isSuccess}
        successMessage={successMessage}
        isDisabled={isDisabled}
      />
    </>
  );

  if (!label) {
    return <>{fileUpload}</>;
  }

  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={label}
      isRequired={isRequired}
      labelHelp={<LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    >
      {fileUpload}
    </FormGroup>
  );
}

import {
  FILE_UPLOAD_HARNESS_HELPER_TEXT,
  FILE_UPLOAD_HARNESS_LABEL,
} from './FileUpload.story-data';
export {
  FILE_UPLOAD_HARNESS_HELPER_TEXT,
  FILE_UPLOAD_HARNESS_LABEL,
} from './FileUpload.story-data';
import React, { useState } from 'react';
import { type DropEvent, Form } from '@patternfly/react-core';
import { FileUpload } from './FileUpload';

export function FileUploadHarness() {
  const [value, setValue] = useState('');
  const [filename, setFilename] = useState('');
  return (
    <Form>
      <FileUpload
        id="ct-file"
        label={FILE_UPLOAD_HARNESS_LABEL}
        helperText={FILE_UPLOAD_HARNESS_HELPER_TEXT}
        filename={filename}
        value={value}
        onFileInputChange={(_e: DropEvent, file: File) => {
          setFilename(file.name);
        }}
        onDataChange={(_e: DropEvent, data: string) => setValue(data)}
        onClearClick={() => {
          setValue('');
          setFilename('');
        }}
      />
    </Form>
  );
}

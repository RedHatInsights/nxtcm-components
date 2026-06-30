import React, { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';
import { RosaHcpWizardValidationProvider } from '../rosaHcpWizardValidationContext';
import type { ROSAHCPCluster } from '../types';
import type { YamlEditorHandle } from '../Steps/YamlEditor/RosaHcpYamlEditorStep';
import { RosaHcpYamlEditorFooter } from './RosaHcpYamlEditorFooter';

export type YamlEditorFooterMountProps = {
  hasSchemaErrors?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: (data: ROSAHCPCluster) => Promise<void>;
};

export function YamlEditorFooterMount({
  hasSchemaErrors = false,
  onClose = () => {},
  onCancel = () => {},
  onSubmit = async () => {},
}: YamlEditorFooterMountProps = {}) {
  return (
    <RosaHcpWizardStringsProvider>
      <YamlEditorFooterMountInner
        hasSchemaErrors={hasSchemaErrors}
        onClose={onClose}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </RosaHcpWizardStringsProvider>
  );
}

function YamlEditorFooterMountInner({
  hasSchemaErrors,
  onClose,
  onCancel,
  onSubmit,
}: Required<YamlEditorFooterMountProps>) {
  const methods = useForm<ROSAHCPCluster>({ defaultValues: {} });

  const editorRef = useRef<YamlEditorHandle>({
    discard: () => {},
    hasSchemaErrors: () => hasSchemaErrors,
  });

  return (
    <FormProvider {...methods}>
      <RosaHcpWizardValidationProvider>
        <RosaHcpYamlEditorFooter
          editorRef={editorRef}
          onClose={onClose}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
}

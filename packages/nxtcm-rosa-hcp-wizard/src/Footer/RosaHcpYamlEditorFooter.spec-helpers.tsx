import React, { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';
import { RosaHcpWizardValidationProvider } from '../rosaHcpWizardValidationContext';
import type { ROSAHCPCluster } from '../types';
import type { YamlEditorHandle } from '../Steps/YamlEditor/RosaHcpYamlEditorStep';
import { RosaHcpYamlEditorFooter } from './RosaHcpYamlEditorFooter';

export type YamlEditorFooterMountProps = {
  hasSchemaErrors?: boolean;
  yamlContent?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: (yamlString: string) => Promise<void>;
};

export function YamlEditorFooterMount({
  hasSchemaErrors = false,
  yamlContent = '',
  onClose = () => {},
  onCancel = () => {},
  onSubmit = async () => {},
}: YamlEditorFooterMountProps = {}) {
  return (
    <RosaHcpWizardStringsProvider>
      <YamlEditorFooterMountInner
        hasSchemaErrors={hasSchemaErrors}
        yamlContent={yamlContent}
        onClose={onClose}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </RosaHcpWizardStringsProvider>
  );
}

function YamlEditorFooterMountInner({
  hasSchemaErrors,
  yamlContent,
  onClose,
  onCancel,
  onSubmit,
}: Required<YamlEditorFooterMountProps>) {
  const methods = useForm<ROSAHCPCluster>({ defaultValues: {} });

  const editorRef = useRef<YamlEditorHandle>({
    discard: () => {},
    hasSchemaErrors: () => hasSchemaErrors,
    getYaml: () => yamlContent,
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

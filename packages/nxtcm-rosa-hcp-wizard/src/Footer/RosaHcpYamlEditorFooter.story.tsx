import React, { useRef } from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { RosaHcpWizardValidationProvider } from '../rosaHcpWizardValidationContext';
import type { YamlEditorHandle } from '../Steps/YamlEditor/RosaHcpYamlEditorStep';
import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../types';
import { RosaHcpYamlEditorFooter } from './RosaHcpYamlEditorFooter';

export type YamlEditorFooterMountProps = {
  hasSchemaErrors?: boolean;
  yamlContent?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: (yamlString: string) => Promise<void>;
};

function YamlEditorFooterMountComponent({
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

type BrowserProps = NonNullable<React.ComponentProps<typeof YamlEditorFooterMountComponent>>;

export type YamlEditorFooterMountGalleryProps = Omit<
  BrowserProps,
  'onClose' | 'onCancel' | 'onSubmit'
> & {
  onClose?: boolean;
  onCancel?: boolean;
  onSubmit?: boolean;
};

export function YamlEditorFooterMount(
  props: YamlEditorFooterMountGalleryProps
): React.ReactElement {
  const [onCloseCalls, setOnCloseCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onClose']>>[]
  >([]);
  const [onCancelCalls, setOnCancelCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onCancel']>>[]
  >([]);
  const [onSubmitCalls, setOnSubmitCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onSubmit']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onClose: props.onClose
        ? () => {
            setOnCloseCalls((calls) => [...calls, []]);
          }
        : undefined,
      onCancel: props.onCancel
        ? () => {
            setOnCancelCalls((calls) => [...calls, []]);
          }
        : undefined,
      onSubmit: props.onSubmit
        ? (...args) => {
            setOnSubmitCalls((calls) => [...calls, args]);
            return Promise.resolve();
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <YamlEditorFooterMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="onClose-calls" readOnly value={JSON.stringify(onCloseCalls)} />
        <input data-testid="onClose-count" readOnly value={String(onCloseCalls.length)} />
        <input data-testid="onCancel-calls" readOnly value={JSON.stringify(onCancelCalls)} />
        <input data-testid="onCancel-count" readOnly value={String(onCancelCalls.length)} />
        <input data-testid="onSubmit-calls" readOnly value={JSON.stringify(onSubmitCalls)} />
        <input data-testid="onSubmit-count" readOnly value={String(onSubmitCalls.length)} />
      </div>
    </>
  );
}

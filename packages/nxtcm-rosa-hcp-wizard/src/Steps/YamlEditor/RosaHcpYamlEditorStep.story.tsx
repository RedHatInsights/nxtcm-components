import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../types';
import type { RosaHcpYamlEditorStepProps, YamlEditorHandle } from './RosaHcpYamlEditorStep';
import { RosaHcpYamlEditorStep } from './RosaHcpYamlEditorStep';
import type { ValidationError, YamlResourceGenerator } from './types';

// Mock resource generator for tests
const mockResourceGenerator: YamlResourceGenerator = {
  renderYaml: () => `
kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
  version: 4.12.0
  region: us-east-1
  channelGroup: stable
`,
  validateYaml: () => [],
  resourceSchemas: [
    {
      kind: 'ROSAControlPlane',
      schema: {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          spec: { type: 'object' },
        },
      },
      primary: true,
    },
  ],
};

export type YamlEditorStepMountProps = Partial<RosaHcpYamlEditorStepProps>;

// Mountable gallery story for Monaco rendering and configuration tests.
function YamlEditorStepMountComponent({
  onClose,
  onCancel,
  resourceGenerator = mockResourceGenerator,
}: YamlEditorStepMountProps = {}) {
  return (
    <RosaHcpWizardStringsProvider>
      <YamlEditorStepMountInner
        onClose={onClose}
        onCancel={onCancel}
        resourceGenerator={resourceGenerator}
      />
    </RosaHcpWizardStringsProvider>
  );
}

function YamlEditorStepMountInner({
  onClose,
  onCancel,
  resourceGenerator,
}: {
  onClose?: () => void;
  onCancel?: () => void;
  resourceGenerator: YamlResourceGenerator;
}) {
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      name: 'test-cluster',
      cluster_version: '4.12.0',
      region: 'us-east-1',
    },
  });

  return (
    <FormProvider {...methods}>
      <RosaHcpYamlEditorStep
        onClose={onClose}
        onCancel={onCancel}
        resourceGenerator={resourceGenerator}
      />
    </FormProvider>
  );
}

type BrowserProps = NonNullable<React.ComponentProps<typeof YamlEditorStepMountComponent>>;

export type YamlEditorStepMountGalleryProps = Omit<BrowserProps, 'onClose' | 'onCancel'> & {
  onClose?: boolean;
  onCancel?: boolean;
};

// One schema error per line containing this marker.
const INVALID_YAML_MARKER = 'INVALID';

const VALID_YAML = `kind: ROSAControlPlane
apiVersion: controlplane.cluster.x-k8s.io/v1beta2
spec:
  rosaClusterName: test-cluster
`;

function createValidatingGenerator(invalidLineCount: number): YamlResourceGenerator {
  const invalidLines = Array.from(
    { length: invalidLineCount },
    (_, index) => `  badField${index + 1}: ${INVALID_YAML_MARKER}\n`
  ).join('');
  return {
    ...mockResourceGenerator,
    renderYaml: () => `${VALID_YAML}${invalidLines}`,
    validateYaml: (yamlStr) =>
      yamlStr
        .split('\n')
        .flatMap((line, index): ValidationError[] =>
          line.includes(INVALID_YAML_MARKER)
            ? [{ message: 'Unknown field', line: index + 1, column: 3, severity: 'error' }]
            : []
        ),
  };
}

// Schemas without a primary entry: the schema panel can never render.
const noPrimarySchemaGenerator: YamlResourceGenerator = {
  ...mockResourceGenerator,
  resourceSchemas: [
    {
      kind: 'ROSAControlPlane',
      schema: {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          spec: { type: 'object' },
        },
      },
    },
  ],
};

export type YamlEditorStepValidationMountProps = {
  /** number of schema errors in the initial YAML */
  invalidLineCount?: number;
};

/** Editor with invalid YAML. "Check schema errors" calls hasSchemaErrors(), like submit. */
export function YamlEditorStepValidationMount({
  invalidLineCount = 1,
}: YamlEditorStepValidationMountProps): React.ReactElement {
  const editorRef = React.useRef<YamlEditorHandle>(null);
  const [hasSchemaErrorsResult, setHasSchemaErrorsResult] = React.useState('');
  const generator = React.useMemo(
    () => createValidatingGenerator(invalidLineCount),
    [invalidLineCount]
  );
  return (
    <RosaHcpWizardStringsProvider>
      <YamlEditorStepValidationInner editorRef={editorRef} resourceGenerator={generator} />
      <button
        type="button"
        onClick={() => setHasSchemaErrorsResult(String(editorRef.current?.hasSchemaErrors()))}
      >
        Check schema errors
      </button>
      <div hidden>
        <input data-testid="hasSchemaErrors-result" readOnly value={hasSchemaErrorsResult} />
      </div>
    </RosaHcpWizardStringsProvider>
  );
}

function YamlEditorStepValidationInner({
  editorRef,
  resourceGenerator,
}: {
  editorRef: React.Ref<YamlEditorHandle>;
  resourceGenerator: YamlResourceGenerator;
}) {
  const methods = useForm<Partial<ROSAHCPCluster>>();
  return (
    <FormProvider {...methods}>
      <RosaHcpYamlEditorStep ref={editorRef} resourceGenerator={resourceGenerator} />
    </FormProvider>
  );
}

/** Editor whose generator supplies schemas but no primary entry, so no schema panel can render. */
export function YamlEditorStepNoPrimarySchemaMount(): React.ReactElement {
  const editorRef = React.useRef<YamlEditorHandle>(null);
  return (
    <RosaHcpWizardStringsProvider>
      <YamlEditorStepValidationInner
        editorRef={editorRef}
        resourceGenerator={noPrimarySchemaGenerator}
      />
    </RosaHcpWizardStringsProvider>
  );
}

export function YamlEditorStepMount(props: YamlEditorStepMountGalleryProps): React.ReactElement {
  const [onCloseCalls, setOnCloseCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onClose']>>[]
  >([]);
  const [onCancelCalls, setOnCancelCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onCancel']>>[]
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
    }),
    [props]
  );
  return (
    <>
      <YamlEditorStepMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="onClose-calls" readOnly value={JSON.stringify(onCloseCalls)} />
        <input data-testid="onClose-count" readOnly value={String(onCloseCalls.length)} />
        <input data-testid="onCancel-calls" readOnly value={JSON.stringify(onCancelCalls)} />
        <input data-testid="onCancel-count" readOnly value={String(onCancelCalls.length)} />
      </div>
    </>
  );
}

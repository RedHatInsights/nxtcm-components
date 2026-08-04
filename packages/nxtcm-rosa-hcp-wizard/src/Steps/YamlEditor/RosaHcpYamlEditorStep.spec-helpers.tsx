import { FormProvider, useForm } from 'react-hook-form';

import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../types';
import type { YamlResourceGenerator } from './types';
import { RosaHcpYamlEditorStep } from './RosaHcpYamlEditorStep';
import type { RosaHcpYamlEditorStepProps } from './RosaHcpYamlEditorStep';

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

// Mountable component for tests - follows the pattern from RosaHcpYamlEditorFooter.spec-helpers
export function YamlEditorStepMount({
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

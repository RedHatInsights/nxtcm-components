import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { YamlCodeEditor, parseYaml, prettifyYaml } from './YamlCodeEditor';
import { Button, Stack, StackItem, Alert } from '@patternfly/react-core';

const meta: Meta<typeof YamlCodeEditor> = {
  title: 'Components/YamlCodeEditor',
  component: YamlCodeEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof YamlCodeEditor>;

export const Default: Story = {
  args: {
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: example-config
  namespace: default
data:
  database.host: localhost
  database.port: "5432"`,
    height: '400px',
  },
};

export const ReadOnly: Story = {
  args: {
    code: `# This editor is read-only
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376`,
    isReadOnly: true,
    height: '400px',
  },
};

export const WithMinimap: Story = {
  args: {
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80`,
    isMinimapVisible: true,
    height: '500px',
  },
};

export const WithAutoValidation: Story = {
  render: () => {
    const [code, setCode] = useState(`apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest`);
    const [validation, setValidation] = useState<{ isValid: boolean; error?: string } | null>(null);

    const handlePrettify = () => {
      const prettified = prettifyYaml(code);
      setCode(prettified);
    };

    return (
      <Stack hasGutter>
        <StackItem>
          <YamlCodeEditor
            code={code}
            onChange={setCode}
            onValidate={(result) => {
              setValidation({
                isValid: result.isValid,
                error: result.error,
              });
            }}
            debounceDelay={500}
            height="400px"
          />
        </StackItem>
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Button onClick={handlePrettify} variant="secondary">
                Prettify YAML
              </Button>
            </StackItem>
            {validation && (
              <StackItem>
                <Alert
                  variant={validation.isValid ? 'success' : 'danger'}
                  title={validation.isValid ? 'Valid YAML' : 'Invalid YAML'}
                  isInline
                >
                  {validation.error || 'YAML is valid and can be parsed successfully.'}
                </Alert>
              </StackItem>
            )}
          </Stack>
        </StackItem>
      </Stack>
    );
  },
};

export const InteractiveWithValidation: Story = {
  render: () => {
    const [code, setCode] = useState(`apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest`);
    const [validation, setValidation] = useState<{ isValid: boolean; error?: string } | null>(null);

    const handleValidate = () => {
      const result = parseYaml(code);
      setValidation({
        isValid: result.isValid,
        error: result.error,
      });
    };

    const handlePrettify = () => {
      const prettified = prettifyYaml(code);
      setCode(prettified);
    };

    return (
      <Stack hasGutter>
        <StackItem>
          <YamlCodeEditor
            code={code}
            onChange={(value) => {
              setCode(value);
              setValidation(null);
            }}
            height="400px"
          />
        </StackItem>
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Button onClick={handleValidate} variant="primary">
                Validate YAML
              </Button>{' '}
              <Button onClick={handlePrettify} variant="secondary">
                Prettify YAML
              </Button>
            </StackItem>
            {validation && (
              <StackItem>
                <Alert
                  variant={validation.isValid ? 'success' : 'danger'}
                  title={validation.isValid ? 'Valid YAML' : 'Invalid YAML'}
                  isInline
                >
                  {validation.error || 'YAML is valid and can be parsed successfully.'}
                </Alert>
              </StackItem>
            )}
          </Stack>
        </StackItem>
      </Stack>
    );
  },
};

export const CompactEditor: Story = {
  args: {
    code: `name: compact-example
value: 123`,
    height: '200px',
    isLineNumbersVisible: false,
  },
};

export const EmptyEditor: Story = {
  args: {
    code: '',
    height: '300px',
  },
};


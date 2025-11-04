import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { YamlCodeEditor } from './YamlCodeEditor';
import { parseYaml, prettifyYaml } from './yamlUtils';

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

const sampleYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  namespace: default
data:
  key1: value1
  key2: value2`;

const DefaultComponent = () => {
  const [code, setCode] = useState(sampleYaml);
  return <YamlCodeEditor code={code} onChange={setCode} />;
};

const EmptyComponent = () => {
  const [code, setCode] = useState('');
  return <YamlCodeEditor code={code} onChange={setCode} />;
};

const CustomHeightComponent = () => {
  const [code, setCode] = useState(sampleYaml);
  return <YamlCodeEditor code={code} onChange={setCode} height="600px" />;
};

const NoLineNumbersComponent = () => {
  const [code, setCode] = useState(sampleYaml);
  return <YamlCodeEditor code={code} onChange={setCode} isLineNumbersVisible={false} />;
};

export const Default: Story = {
  render: () => <DefaultComponent />,
};

export const Empty: Story = {
  render: () => <EmptyComponent />,
};

export const ReadOnly: Story = {
  render: () => <YamlCodeEditor code={sampleYaml} isReadOnly={true} />,
};

export const CustomHeight: Story = {
  render: () => <CustomHeightComponent />,
};

export const NoLineNumbers: Story = {
  render: () => <NoLineNumbersComponent />,
};

const WithValidationComponent = () => {
  const [code, setCode] = useState(sampleYaml);
  const [validationMessage, setValidationMessage] = useState('');

  const handleValidate = () => {
    const result = parseYaml(code);
    if (result.isValid) {
      setValidationMessage('✓ YAML is valid!');
    } else {
      const errorMsg = result.errorLine
        ? `✗ Error on line ${result.errorLine}: ${result.error}`
        : `✗ Error: ${result.error}`;
      setValidationMessage(errorMsg);
    }
  };

  return (
    <div>
      <YamlCodeEditor code={code} onChange={setCode} />
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={handleValidate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Validate YAML
        </button>
        {validationMessage && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              borderRadius: '3px',
              backgroundColor: validationMessage.startsWith('✓') ? '#e7f4e4' : '#fce3e3',
              color: validationMessage.startsWith('✓') ? '#2d5016' : '#7d1007',
            }}
          >
            {validationMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export const WithValidation: Story = {
  render: () => <WithValidationComponent />,
};

const WithPrettifyComponent = () => {
  const messyYaml = `apiVersion:    v1
kind:   ConfigMap
metadata:
      name:   my-config
      namespace:   default
data:
    key1:   value1
    key2:   value2`;

  const [code, setCode] = useState(messyYaml);

  const handlePrettify = () => {
    const prettified = prettifyYaml(code, 2);
    setCode(prettified);
  };

  return (
    <div>
      <YamlCodeEditor code={code} onChange={setCode} />
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={handlePrettify}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Prettify YAML
        </button>
      </div>
    </div>
  );
};

export const WithPrettify: Story = {
  render: () => <WithPrettifyComponent />,
};

const SmallEditorComponent = () => {
  const [code, setCode] = useState('name: test\nvalue: 123');
  return <YamlCodeEditor code={code} onChange={setCode} height="150px" />;
};

export const SmallEditor: Story = {
  render: () => <SmallEditorComponent />,
};

const LargeDocumentComponent = () => {
  const largeYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
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
        - containerPort: 80
        env:
        - name: ENV_VAR_1
          value: value1
        - name: ENV_VAR_2
          value: value2
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        volumeMounts:
        - name: config
          mountPath: /etc/config
      volumes:
      - name: config
        configMap:
          name: nginx-config`;

  const [code, setCode] = useState(largeYaml);
  return <YamlCodeEditor code={code} onChange={setCode} height="500px" />;
};

export const LargeDocument: Story = {
  render: () => <LargeDocumentComponent />,
};

const WithSyntaxHighlightingComponent = () => {
  const yamlWithAllFeatures = `---
# Configuration file example
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config  # Inline comment
  namespace: default
  labels:
    app: demo
    environment: production
data:
  # String values
  greeting: "Hello, World!"
  message: 'Single quoted string'
  
  # Numbers
  port: 8080
  timeout: 30.5
  
  # Booleans
  enabled: true
  debug: false
  production: yes
  
  # Null values
  optional: null
  unused: ~
  
  # Lists
  servers:
    - web-01
    - web-02
    - web-03
  
  # Nested objects
  database:
    host: localhost
    port: 5432
    credentials:
      username: admin
      password: secret123
  
  # Anchors and aliases
  defaults: &default_settings
    timeout: 30
    retries: 3
  
  service_a:
    <<: *default_settings
    name: "Service A"
...`;

  const [code, setCode] = useState(yamlWithAllFeatures);
  return <YamlCodeEditor code={code} onChange={setCode} height="600px" />;
};

const WithoutSyntaxHighlightingComponent = () => {
  const [code, setCode] = useState(sampleYaml);
  return <YamlCodeEditor code={code} onChange={setCode} enableSyntaxHighlighting={false} />;
};

export const WithSyntaxHighlighting: Story = {
  render: () => <WithSyntaxHighlightingComponent />,
};

export const WithoutSyntaxHighlighting: Story = {
  render: () => <WithoutSyntaxHighlightingComponent />,
};

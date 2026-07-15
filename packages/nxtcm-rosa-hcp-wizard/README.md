# @redhat-cloud-services/nxtcm-rosa-hcp-wizard

PatternFly wizard component for ROSA HCP cluster creation in ACM and OCM.

## Installation

```bash
npm install @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

## Prerequisites

### Peer dependencies

See [`peerDependencies` in `package.json`](./package.json) for the full list and required version ranges.

### Monaco worker setup

`monaco-editor` and `monaco-yaml` run language features in web workers. You **must** configure `window.MonacoEnvironment` in your application entry point **before** this wizard is imported or rendered. Omitting this will cause the YAML editor to fail silently or throw at runtime.

```ts
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url';
import yamlWorkerUrl from 'monaco-yaml/yaml.worker.js?url';

window.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    if (label === 'yaml') {
      return new Worker(yamlWorkerUrl, { type: 'module' });
    }
    return new Worker(editorWorkerUrl, { type: 'module' });
  },
};
```

The `?url` import syntax is supported by Vite out of the box. For webpack, use `new URL('...', import.meta.url)` or a dedicated worker loader instead. See the [monaco-yaml worker setup docs](https://www.npmjs.com/package/monaco-yaml#usage) for more details.

### Resource generator

The wizard requires a `resourceGenerator` prop that implements `YamlResourceGenerator` (renders YAML from form values and validates it). The wizard has no built-in template or schema - consuming applications supply the generator.

`resourceGenerator.resourceSchemas` typically describes several Kubernetes resources rendered as one multi-document YAML string (separated by `---`), with exactly one marked `primary` (only the primary resource's schema is shown in the YAML editor's schema drawer). `validateYaml` is expected to validate **every** resource against its own schema.

To help with that, the package exports a few schema-library-agnostic helpers for splitting a multi-document YAML string and mapping validation errors back to accurate line numbers:

- `splitYamlDocuments(yamlStr)` — splits on `---` separators, returning each document's content plus its starting line number.
- `findLineForPath(content, instancePath)` — resolves a JSON-pointer-style path to a line number within a single document.
- `yamlExceptionToValidationError(error, lineOffset?)` — converts a caught `js-yaml` parse exception into a `ValidationError`.

See `createTemplateBasedGenerator` in the test fixtures for a full reference implementation that pairs these with Ajv (one compiled validator per resource `kind`) — that file itself isn't published, but the pattern is meant to be adapted, e.g. with whatever JSON schema validation library the consuming app already uses.

## Usage

```tsx
import '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/dist/nxtcm-rosa-hcp-wizard.css';
import { RosaHCPWizard } from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';
import type {
  ROSAHCPCluster,
  ROSAHCPWizardData,
} from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';

export const CreateClusterWizard = ({ wizardData }: { wizardData: ROSAHCPWizardData }) => (
  <RosaHCPWizard
    title="Create ROSA HCP cluster"
    wizardData={wizardData}
    onSubmit={async (cluster: ROSAHCPCluster) => {
      // host app calls its cluster creation API
    }}
    onCancel={() => {
      // host app handles navigation
    }}
  />
);
```

## Component catalog

- `RosaHCPWizard` - full ROSA HCP cluster creation wizard
- `ROSAHCPWizardData` - injected async resources for regions, roles, VPCs, versions, and related fields
- `RosaHCPWizardProps` - wizard component props
- `ROSAHCPCluster` - submitted cluster payload shape
- `Resource` - data, loading, and error wrapper used by host apps for wizard resources
- `RosaHcpWizardStringsProvider` - context provider for label and validator strings
- `useRosaHcpWizardStrings` - read UI strings in custom extensions
- `useRosaHcpWizardValidators` - read validator message strings
- `defaultRosaHcpWizardStrings` - default English UI copy
- `defaultRosaHcpWizardValidatorStrings` - default English validator messages
- `mergeRosaHcpWizardStrings` - merge partial UI string overrides
- `buildRosaHcpWizardStringBundles` - build merged UI and validator string bundles
- `clusterValidationSchema` - Yup schema for the full wizard form
- `getClusterValidationSchemaDefaultValues` - default form values from the schema
- `wizardFieldMetaByPath` - field metadata by schema path
- `detailsFields` - Details step field schemas
- `rolesAndPoliciesFields` - Roles and policies step field schemas
- `machinePoolsFields` - Machine pools step field schemas
- `networkingFields` - Networking step field schemas
- `clusterWideProxyFields` - Cluster-wide proxy step field schemas
- `encryptionFields` - Encryption step field schemas
- `clusterUpdatesFields` - Cluster updates step field schemas

## Publishing

This package is published when a GitHub Release is created on `main` with tag `nxtcm-rosa-hcp-wizard-v{version}` matching `package.json`. See the [repository publishing guide](../../README.md#publishing-packages).

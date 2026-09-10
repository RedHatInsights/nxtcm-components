# @redhat-cloud-services/nxtcm-rosa-hcp-wizard

PatternFly wizard component for ROSA HCP cluster creation in ACM and OCM.

## Installation

```bash
npm install @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

## Prerequisites

### Peer dependencies

See [`peerDependencies` in `package.json`](./package.json) for the full list and required version ranges.

**`monaco-editor` must be `<0.55.0`.** Monaco 0.55 made a breaking change to `editor.createWebWorker()`: it dropped the `moduleId`/`label`/`createData` options and now requires the caller to construct and pass a `Worker` instance directly. `monaco-yaml`'s worker manager (as of `monaco-yaml@5.4.1`/`monaco-worker-manager@2.0.1`) hasn't been updated for this yet, so pairing it with Monaco `>=0.55` doesn't throw — it silently falls back to Monaco's generic in-process worker, which lacks YAML-specific RPC methods.

### Monaco worker setup

`monaco-editor` and `monaco-yaml` run language features in web workers. You **must** configure `window.MonacoEnvironment` in your application entry point **before** this wizard is imported or rendered. Omitting this will cause the YAML editor to fail silently or throw at runtime.

```ts
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import YamlWorker from 'monaco-yaml/yaml.worker.js?worker';

window.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};
```

Use Vite's `?worker` import syntax. `monaco-yaml`'s worker bundle pulls in `path-browserify`, a plain-CommonJS dependency; `?worker` routes the whole worker module graph through Vite's bundler. You'll also need `path-browserify` in `optimizeDeps.include` in your Vite config so it's pre-bundled correctly:

```ts
export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml', 'path-browserify'],
  },
});
```

For webpack, use `new URL('...', import.meta.url)` with `import.meta.webpackHot` worker handling or a dedicated worker loader instead. See the [monaco-yaml worker setup docs](https://www.npmjs.com/package/monaco-yaml#usage) for more details.

**You must also point `@monaco-editor/react` at your local `monaco-editor` install.**

```ts
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

loader.config({ monaco });
```

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
import '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/index.css';
import { RosaHCPWizard } from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';
import type {
  ROSAHCPCluster,
  ROSAHCPWizardData,
  YamlResourceGenerator,
} from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';

const resourceGenerator: YamlResourceGenerator = {
  renderYaml: (formValues) => JSON.stringify(formValues, null, 2),
  validateYaml: () => [],
  resourceSchemas: [],
};

export const CreateClusterWizard = ({ wizardData }: { wizardData: ROSAHCPWizardData }) => (
  <RosaHCPWizard
    title="Create ROSA HCP cluster"
    wizardData={wizardData}
    resourceGenerator={resourceGenerator}
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
- `WizardConfig` / `STEP_IDS` / `FIELD_NAME` - optional host-app step and field hiding
- `RosaHcpWizardStringsInput` - partial UI string overrides passed via the `strings` prop
- `YamlResourceGenerator` - host-supplied YAML render/validate contract
- `splitYamlDocuments` / `findLineForPath` / `yamlExceptionToValidationError` - helpers for implementing `validateYaml`

## Publishing

This package is published when a GitHub Release is created on `main` with tag `nxtcm-rosa-hcp-wizard-v{version}` matching `package.json`. See the [repository publishing guide](../../README.md#publishing-packages).

# @redhat-cloud-services/nxtcm-rosa-hcp-wizard

PatternFly wizard component for ROSA HCP cluster creation in ACM and OCM.

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

The wizard requires a `resourceGenerator` prop that implements `YamlResourceGenerator` (renders YAML from form values and validates it). The wizard has no built-in template or schema — consuming applications supply the generator. See `createTemplateBasedGenerator` in the test fixtures for a reference implementation.

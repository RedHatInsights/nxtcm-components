/* eslint-disable class-methods-use-this */
import type { DiagnosticsOptions, SchemasSettings } from 'monaco-yaml';

import rosaControlPlaneSchema from './schemas/rosaControlPlaneSchema.json';

function isMonacoYamlWorkerAvailable(): boolean {
  // Webpack hosts (e.g. ACM) expose getWorkerUrl with the built-in yaml worker only.
  // monaco-yaml must not be imported there — its module side effect registers a yaml worker
  // that conflicts with the host worker and causes "Unexpected usage" / Unexpected token '<'.
  return typeof window !== 'undefined' && typeof window.MonacoEnvironment?.getWorker === 'function';
}

const defaultDiagnosticsOptions: DiagnosticsOptions = {
  validate: false,
  hover: true,
  completion: true,
  isKubernetes: true,
  enableSchemaRequest: false,
  schemas: [
    {
      uri: 'inmemory://rosa-hcp-control-plane-schema.json',
      fileMatch: ['*'],
      schema: rosaControlPlaneSchema as SchemasSettings['schema'],
    },
  ],
};

export class RosaHcpYamlMonacoLoader {
  configure(options?: DiagnosticsOptions): () => void {
    if (!isMonacoYamlWorkerAvailable()) {
      return () => undefined;
    }

    let disposed = false;

    void import('monaco-yaml').then(({ setDiagnosticsOptions }) => {
      if (disposed) {
        return;
      }
      setDiagnosticsOptions({ ...defaultDiagnosticsOptions, ...options });
    });

    return () => {
      disposed = true;
      // Wizard teardown only clears our schemas. Workers are created on demand via
      // window.MonacoEnvironment (host or monacoYamlSetup); monaco-yaml has no public API to
      // unregister workers or language providers once its module has loaded.
      void import('monaco-yaml').then(({ setDiagnosticsOptions }) => {
        setDiagnosticsOptions({ schemas: [] });
      });
    };
  }
}

/* eslint-disable class-methods-use-this */
import type { DiagnosticsOptions, SchemasSettings } from 'monaco-yaml';

import { isMonacoYamlDiagnosticsAvailable } from './monacoYamlSetup';
import rosaControlPlaneSchema from './schemas/rosaControlPlaneSchema.json';

export const defaultRosaHcpMonacoYamlDiagnosticsOptions: DiagnosticsOptions = {
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

/** Applies monaco-yaml schema diagnostics when the package is available; no-op on failure. */
export async function applyRosaHcpMonacoYamlDiagnostics(
  options?: DiagnosticsOptions
): Promise<void> {
  try {
    const { setDiagnosticsOptions } = await import('monaco-yaml');
    setDiagnosticsOptions({ ...defaultRosaHcpMonacoYamlDiagnosticsOptions, ...options });
  } catch {
    // monaco-yaml is optional — hosts without it still get Ajv validation in the editor step.
  }
}

/** Clears monaco-yaml schemas on teardown; no-op when monaco-yaml is unavailable. */
async function clearRosaHcpMonacoYamlDiagnostics(): Promise<void> {
  try {
    const { setDiagnosticsOptions } = await import('monaco-yaml');
    setDiagnosticsOptions({ schemas: [] });
  } catch {
    // monaco-yaml not installed — nothing to clear.
  }
}

export class RosaHcpYamlMonacoLoader {
  configure(options?: DiagnosticsOptions): () => void {
    // Webpack hosts (e.g. ACM) already provide Monaco workers; importing monaco-yaml there
    // conflicts with the host worker and fails when the package is not installed.
    if (!isMonacoYamlDiagnosticsAvailable()) {
      return () => undefined;
    }

    let disposed = false;

    void (async () => {
      if (disposed) {
        return;
      }
      await applyRosaHcpMonacoYamlDiagnostics(options);
      if (disposed) {
        await clearRosaHcpMonacoYamlDiagnostics();
      }
    })();

    return () => {
      disposed = true;
      // Wizard teardown only clears our schemas. Workers are created on demand via
      // window.MonacoEnvironment (host or monacoYamlSetup); monaco-yaml has no public API to
      // unregister workers or language providers once its module has loaded.
      void clearRosaHcpMonacoYamlDiagnostics();
    };
  }
}

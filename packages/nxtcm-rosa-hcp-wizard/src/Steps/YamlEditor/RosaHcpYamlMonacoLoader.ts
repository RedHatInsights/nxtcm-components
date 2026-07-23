/* eslint-disable class-methods-use-this */
import { type MonacoEditor } from 'monaco-types';
import { configureMonacoYaml, type MonacoYamlOptions, type SchemasSettings } from 'monaco-yaml';

import type { ResourceSchema } from './types';

export class RosaHcpYamlMonacoLoader {
  configure(
    monaco: MonacoEditor,
    resourceSchemas?: ResourceSchema[],
    options?: MonacoYamlOptions,
    /** Restrict schema completion/hover to this specific model path. */
    fileMatch = ['rosa-hcp-control-plane.yaml']
  ): () => void {
    const schemas: SchemasSettings[] = (resourceSchemas ?? []).map(({ kind, schema }) => ({
      uri: `inmemory://${kind}-schema.json`,
      fileMatch,
      schema,
    }));

    const monacoYaml = configureMonacoYaml(monaco, {
      validate: false,
      hover: true,
      completion: true,
      isKubernetes: false,
      enableSchemaRequest: false,
      schemas,
      ...options,
    });
    return () => {
      monacoYaml.dispose();
    };
  }
}

/* eslint-disable class-methods-use-this */
import { type MonacoEditor } from 'monaco-types';
import { configureMonacoYaml, type MonacoYamlOptions, type SchemasSettings } from 'monaco-yaml';

import { combinedSchema } from './schemas/combinedSchema';

export class RosaYamlMonacoLoader {
  configure(monaco: MonacoEditor, options?: MonacoYamlOptions): () => void {
    const monacoYaml = configureMonacoYaml(monaco, {
      validate: false,
      hover: true,
      completion: true,
      isKubernetes: true,
      enableSchemaRequest: false,
      schemas: [
        {
          uri: 'inmemory://rosa-combined-schema.json',
          fileMatch: ['*'],
          schema: combinedSchema as SchemasSettings['schema'],
        },
      ],
      ...options,
    });
    return () => {
      monacoYaml.dispose();
    };
  }
}

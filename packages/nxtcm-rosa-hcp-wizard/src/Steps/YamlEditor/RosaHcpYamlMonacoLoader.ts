/* eslint-disable class-methods-use-this */
import { type MonacoEditor } from 'monaco-types';
import { configureMonacoYaml, type MonacoYamlOptions, type SchemasSettings } from 'monaco-yaml';

import { isMonacoYamlLanguageSupportEnabled } from '../../configureRosaHcpMonaco';
import rosaControlPlaneSchema from './schemas/rosaControlPlaneSchema.json';

export class RosaHcpYamlMonacoLoader {
  configure(monaco: MonacoEditor, options?: MonacoYamlOptions): () => void {
    if (!isMonacoYamlLanguageSupportEnabled()) {
      return () => undefined;
    }

    const monacoYaml = configureMonacoYaml(monaco, {
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
      ...options,
    });
    return () => {
      monacoYaml.dispose();
    };
  }
}

import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { configureMonacoYaml, type SchemasSettings } from 'monaco-yaml';
import { combinedSchema } from './schemas/combinedSchema';

loader.config({ monaco });

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') {
      return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  },
};

configureMonacoYaml(monaco, {
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
});

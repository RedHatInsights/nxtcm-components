import type { JSONSchema } from 'monaco-yaml';

import type { ROSAHCPCluster } from '../../types';
import type { ValidationError, YamlDocumentChunk } from './yamlValidation';

export type { ValidationError, YamlDocumentChunk };
export interface ResourceSchema {
  kind: string;
  schema: JSONSchema;
  primary?: boolean;
}

export interface YamlResourceGenerator {
  renderYaml: (formValues: Partial<ROSAHCPCluster>) => string;
  validateYaml: (yamlStr: string) => ValidationError[];
  resourceSchemas?: ResourceSchema[];
}

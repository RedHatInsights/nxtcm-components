import type { JSONSchema } from 'monaco-yaml';
import type { ValidationError, YamlDocumentChunk } from './yamlValidation';
import type { ROSAHCPCluster } from '../../types';

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

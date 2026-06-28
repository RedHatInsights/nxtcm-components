import type { ValidationError } from './yamlValidation';
import type { ROSAHCPCluster } from '../../types';

export type { ValidationError };
export interface ResourceSchema {
  kind: string;
  schema: object;
  primary?: boolean;
}

export interface YamlResourceGenerator {
  renderYaml: (formValues: Partial<ROSAHCPCluster>) => string;
  validateYaml: (yamlStr: string) => ValidationError[];
  parseYamlToForm: (yamlStr: string) => Record<string, unknown> | null;
  formFields: ReadonlyArray<keyof ROSAHCPCluster>;
  resourceSchemas?: ResourceSchema[];
}

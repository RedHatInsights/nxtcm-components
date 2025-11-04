import * as yaml from 'js-yaml';

export interface YamlParseResult {
  isValid: boolean;
  data?: any;
  error?: string;
  errorLine?: number;
}

/**
 * Parse and validate YAML string
 * @param yamlString The YAML string to parse
 * @returns Parse result with validity status, data, and error information
 */
export function parseYaml(yamlString: string): YamlParseResult {
  try {
    const data = yaml.load(yamlString);
    return {
      isValid: true,
      data,
    };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return {
        isValid: false,
        error: error.message,
        errorLine: error.mark?.line ? error.mark.line + 1 : undefined,
      };
    }
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format YAML with consistent indentation
 * @param yamlString The YAML string to prettify
 * @param indent Number of spaces for indentation (default: 2)
 * @returns Formatted YAML string, or original string if invalid
 */
export function prettifyYaml(yamlString: string, indent: number = 2): string {
  try {
    const data = yaml.load(yamlString);
    return yaml.dump(data, {
      indent,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  } catch {
    return yamlString;
  }
}

/**
 * Convert a JavaScript object to YAML string
 * @param obj The object to convert
 * @param indent Number of spaces for indentation (default: 2)
 * @returns YAML string representation
 */
export function objectToYaml(obj: any, indent: number = 2): string {
  return yaml.dump(obj, {
    indent,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Quick validation check for YAML string
 * @param yamlString The YAML string to validate
 * @returns true if valid, false otherwise
 */
export function isValidYaml(yamlString: string): boolean {
  try {
    yaml.load(yamlString);
    return true;
  } catch {
    return false;
  }
}

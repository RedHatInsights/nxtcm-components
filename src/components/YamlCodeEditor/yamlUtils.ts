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

export function removeEmptyValues(obj: Record<string, any>): Record<string, any> | undefined {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;

    if (Array.isArray(value)) {
      const filteredArray = value.filter((item) => item !== null && item !== undefined);
      if (filteredArray.length > 0) {
        cleaned[key] = filteredArray;
      }
    } else if (typeof value === 'object') {
      const nested = removeEmptyValues(value);
      if (nested !== undefined) {
        cleaned[key] = nested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * Convert a JavaScript object to YAML string
 * @param obj The object to convert
 * @param indent Number of spaces for indentation (default: 2)
 * @returns YAML string representation
 */
export function objectToYaml(obj: any, indent: number = 2): string {
  const cleanedObj = removeEmptyValues(obj);
  return yaml.dump(cleanedObj ?? {}, {
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

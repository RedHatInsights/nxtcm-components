import {
  CodeEditor,
  CodeEditorProps,
  Language,
} from "@patternfly/react-code-editor";
import { useState, useEffect, useRef } from "react";
import * as yaml from "js-yaml";

export interface YamlParseResult {
  isValid: boolean;
  data?: unknown;
  error?: string;
  errorLine?: number;
}

export type YamlCodeEditorProps = Omit<CodeEditorProps, "onChange"> & {
  /** The YAML content to display in the editor */
  code?: string;
  /** Callback when the code changes */
  onChange?: (value: string) => void;
  /** Callback when validation is performed (debounced) */
  onValidate?: (result: YamlParseResult) => void;
  /** Debounce delay in milliseconds for auto-validation (default: 500) */
  debounceDelay?: number;
  "data-testid"?: string;
};

/**
 * Parse YAML string and validate it
 * @param yamlString - The YAML string to parse
 * @returns Object containing parse result and any errors
 */
export function parseYaml(yamlString: string): YamlParseResult {
  if (!yamlString || yamlString.trim() === "") {
    return {
      isValid: true,
      data: undefined,
    };
  }

  try {
    const data = yaml.load(yamlString);
    return {
      isValid: true,
      data,
    };
  } catch (error) {
    const yamlError = error as yaml.YAMLException;
    return {
      isValid: false,
      error: yamlError.message,
      errorLine: yamlError.mark?.line,
    };
  }
}

/**
 * Prettify/format YAML string with consistent indentation
 * @param yamlString - The YAML string to prettify
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted YAML string, or original string if invalid
 */
export function prettifyYaml(
  yamlString: string,
  indent: number = 2
): string {
  if (!yamlString || yamlString.trim() === "") {
    return yamlString;
  }

  try {
    const parsed = yaml.load(yamlString);
    return yaml.dump(parsed, {
      indent,
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't use references
      sortKeys: false, // Preserve key order
    });
  } catch (error) {
    // If parsing fails, return the original string
    console.error("Failed to prettify YAML:", error);
    return yamlString;
  }
}

/**
 * Convert a JavaScript object to YAML string
 * @param obj - The object to convert
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns YAML string representation
 */
export function objectToYaml(obj: any, indent: number = 2): string {
  try {
    return yaml.dump(obj, {
      indent,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  } catch (error) {
    console.error("Failed to convert object to YAML:", error);
    return "";
  }
}

/**
 * Validate YAML string without parsing it completely
 * @param yamlString - The YAML string to validate
 * @returns True if valid, false otherwise
 */
export function isValidYaml(yamlString: string): boolean {
  return parseYaml(yamlString).isValid;
}

export const YamlCodeEditor = ({
  code = "",
  onChange,
  onValidate,
  debounceDelay = 500,
  "data-testid": dataTestId,
  ...props
}: YamlCodeEditorProps) => {
  const [editorValue, setEditorValue] = useState(code);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    onChange?.(value);
  };

  // Debounced validation effect
  useEffect(() => {
    if (!onValidate) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const result = parseYaml(editorValue);
      onValidate(result);
    }, debounceDelay);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editorValue, onValidate, debounceDelay]);

  return (
    <div data-testid={dataTestId}>
      <CodeEditor
        code={editorValue}
        onChange={handleEditorChange}
        language={Language.yaml}
        options={{
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
        }}
        {...props}
      />
    </div>
  );
};

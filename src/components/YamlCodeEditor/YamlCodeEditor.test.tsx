import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  YamlCodeEditor,
  parseYaml,
  prettifyYaml,
  objectToYaml,
  isValidYaml,
  YamlParseResult,
} from './YamlCodeEditor';

describe('YamlCodeEditor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<YamlCodeEditor data-testid="yaml-editor" />);
    const editor = screen.getByTestId('yaml-editor');
    expect(editor).toBeInTheDocument();
  });

  it('renders with initial code', () => {
    const code = 'name: test\nvalue: 123';
    render(<YamlCodeEditor data-testid="yaml-editor" code={code} />);
    const editor = screen.getByTestId('yaml-editor');
    expect(editor).toBeInTheDocument();
  });

  it('calls onValidate with debounce when code is provided', async () => {
    const onValidate = jest.fn();
    const code = 'name: test\nvalue: 123';

    render(
      <YamlCodeEditor
        data-testid="yaml-editor"
        code={code}
        onValidate={onValidate}
        debounceDelay={500}
      />
    );

    // Should not be called immediately
    expect(onValidate).not.toHaveBeenCalled();

    // Fast-forward time by 500ms
    jest.advanceTimersByTime(500);

    // Should be called after debounce delay
    await waitFor(() => {
      expect(onValidate).toHaveBeenCalledTimes(1);
      expect(onValidate).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          data: { name: 'test', value: 123 },
        })
      );
    });
  });

  it('does not call onValidate when not provided', () => {
    const code = 'name: test\nvalue: 123';
    render(<YamlCodeEditor data-testid="yaml-editor" code={code} />);

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    // Test should pass without errors (no validation callback)
    expect(screen.getByTestId('yaml-editor')).toBeInTheDocument();
  });
});

describe('parseYaml', () => {
  it('parses valid YAML', () => {
    const yamlString = 'name: test\nvalue: 123';
    const result = parseYaml(yamlString);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual({ name: 'test', value: 123 });
    expect(result.error).toBeUndefined();
  });

  it('handles invalid YAML', () => {
    const yamlString = 'name: test\n  invalid: : syntax';
    const result = parseYaml(yamlString);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles empty string', () => {
    const result = parseYaml('');
    
    expect(result.isValid).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it('parses complex YAML structures', () => {
    const yamlString = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  key1: value1
  key2: value2
`;
    const result = parseYaml(yamlString);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toHaveProperty('apiVersion', 'v1');
    expect(result.data).toHaveProperty('kind', 'ConfigMap');
  });
});

describe('prettifyYaml', () => {
  it('prettifies valid YAML with default indentation', () => {
    const yamlString = 'name: test\nvalue: 123\nnested:\n  key: value';
    const prettified = prettifyYaml(yamlString);
    
    expect(prettified).toContain('name: test');
    expect(prettified).toContain('value: 123');
  });

  it('prettifies YAML with custom indentation', () => {
    const yamlString = 'name: test\nnested:\n  key: value';
    const prettified = prettifyYaml(yamlString, 4);
    
    expect(prettified).toBeDefined();
    expect(prettified).toContain('name: test');
  });

  it('returns original string for invalid YAML', () => {
    const invalidYaml = 'invalid: : syntax';
    const result = prettifyYaml(invalidYaml);
    
    expect(result).toBe(invalidYaml);
  });

  it('handles empty string', () => {
    const result = prettifyYaml('');
    expect(result).toBe('');
  });
});

describe('objectToYaml', () => {
  it('converts object to YAML', () => {
    const obj = { name: 'test', value: 123 };
    const yaml = objectToYaml(obj);
    
    expect(yaml).toContain('name: test');
    expect(yaml).toContain('value: 123');
  });

  it('converts nested objects to YAML', () => {
    const obj = {
      name: 'test',
      nested: {
        key: 'value',
        number: 42,
      },
    };
    const yaml = objectToYaml(obj);
    
    expect(yaml).toContain('name: test');
    expect(yaml).toContain('nested:');
    expect(yaml).toContain('key: value');
  });

  it('handles arrays in objects', () => {
    const obj = {
      items: ['item1', 'item2', 'item3'],
    };
    const yaml = objectToYaml(obj);
    
    expect(yaml).toContain('items:');
    expect(yaml).toContain('- item1');
    expect(yaml).toContain('- item2');
  });
});

describe('isValidYaml', () => {
  it('returns true for valid YAML', () => {
    const yamlString = 'name: test\nvalue: 123';
    expect(isValidYaml(yamlString)).toBe(true);
  });

  it('returns false for invalid YAML', () => {
    const yamlString = 'invalid: : syntax';
    expect(isValidYaml(yamlString)).toBe(false);
  });

  it('returns true for empty string', () => {
    expect(isValidYaml('')).toBe(true);
  });
});


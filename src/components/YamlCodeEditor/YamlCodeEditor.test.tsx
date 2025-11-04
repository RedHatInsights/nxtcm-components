import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { YamlCodeEditor } from './YamlCodeEditor';
import { isValidYaml, objectToYaml, parseYaml, prettifyYaml } from './yamlUtils';

describe('YamlCodeEditor', () => {
  it('renders with default props', () => {
    render(<YamlCodeEditor />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('renders with provided code', () => {
    const code = 'name: test\nvalue: 123';
    render(<YamlCodeEditor code={code} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(code);
  });

  it('calls onChange when text is changed', () => {
    const handleChange = jest.fn();
    render(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'name: test' } });
    expect(handleChange).toHaveBeenCalledWith('name: test');
  });

  it('is read-only when isReadOnly is true', () => {
    render(<YamlCodeEditor code="test" isReadOnly={true} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readonly');
  });

  it('applies custom className', () => {
    const { container } = render(<YamlCodeEditor className="custom-class" />);
    const editor = container.firstChild as HTMLElement;
    expect(editor.className).toContain('custom-class');
  });

  it('applies custom height', () => {
    const { container } = render(<YamlCodeEditor height="500px" />);
    const editor = container.firstChild as HTMLElement;
    expect(editor.style.height).toBe('500px');
  });

  it('applies custom aria-label', () => {
    render(<YamlCodeEditor aria-label="Custom YAML editor" />);
    expect(screen.getByLabelText('Custom YAML editor')).toBeInTheDocument();
  });

  it('hides line numbers when isLineNumbersVisible is false', () => {
    const { container } = render(<YamlCodeEditor isLineNumbersVisible={false} />);
    // Line numbers should not be rendered
    expect(container.textContent).not.toContain('1\n2\n3');
  });

  it('shows line numbers by default', () => {
    const code = 'line1\nline2\nline3';
    render(<YamlCodeEditor code={code} />);
    // Component should render without errors
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(code);
  });

  it('handles Tab key for indentation', () => {
    const handleChange = jest.fn();
    render(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

    expect(handleChange).toHaveBeenCalledWith('  ');
  });
});

describe('yamlUtils', () => {
  describe('parseYaml', () => {
    it('parses valid YAML', () => {
      const result = parseYaml('name: test\nvalue: 123');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ name: 'test', value: 123 });
      expect(result.error).toBeUndefined();
    });

    it('returns error for invalid YAML', () => {
      const result = parseYaml('name: test\n  invalid: : yaml');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('includes error line number', () => {
      const result = parseYaml('name: test\n  invalid: : yaml');
      expect(result.isValid).toBe(false);
      expect(result.errorLine).toBeDefined();
    });
  });

  describe('prettifyYaml', () => {
    it('formats YAML with consistent indentation', () => {
      const input = 'name: test\nmetadata:\n    key: value';
      const result = prettifyYaml(input, 2);
      expect(result).toContain('name: test');
      expect(result).toContain('metadata:');
    });

    it('returns original string for invalid YAML', () => {
      const invalid = 'invalid: : yaml';
      const result = prettifyYaml(invalid);
      expect(result).toBe(invalid);
    });

    it('respects custom indentation', () => {
      const input = 'root:\n  child: value';
      const result = prettifyYaml(input, 4);
      expect(result).toBeDefined();
    });
  });

  describe('objectToYaml', () => {
    it('converts object to YAML', () => {
      const obj = { name: 'test', value: 123 };
      const result = objectToYaml(obj);
      expect(result).toContain('name: test');
      expect(result).toContain('value: 123');
    });

    it('handles nested objects', () => {
      const obj = {
        root: {
          child: {
            value: 'test',
          },
        },
      };
      const result = objectToYaml(obj);
      expect(result).toContain('root:');
      expect(result).toContain('child:');
      expect(result).toContain('value: test');
    });

    it('respects custom indentation', () => {
      const obj = { root: { child: 'value' } };
      const result = objectToYaml(obj, 4);
      expect(result).toBeDefined();
    });
  });

  describe('isValidYaml', () => {
    it('returns true for valid YAML', () => {
      expect(isValidYaml('name: test')).toBe(true);
      expect(isValidYaml('items:\n  - item1\n  - item2')).toBe(true);
    });

    it('returns false for invalid YAML', () => {
      expect(isValidYaml('invalid: : yaml')).toBe(false);
    });

    it('returns true for empty string', () => {
      expect(isValidYaml('')).toBe(true);
    });
  });
});

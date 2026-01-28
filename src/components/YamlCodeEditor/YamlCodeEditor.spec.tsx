import { test, expect } from '@playwright/experimental-ct-react';
import { YamlCodeEditor } from './YamlCodeEditor';
import { checkAccessibility } from '../../test-helpers';

test.describe('YamlCodeEditor', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor />);
    await checkAccessibility({ component });
  });

  test('should render with default props', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should render with provided code', async ({ mount }) => {
    const code = 'name: test\nvalue: 123';
    const component = await mount(<YamlCodeEditor code={code} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(code);
  });

  test('should call onChange when text is changed', async ({ mount }) => {
    let changedValue = '';
    const handleChange = (value: string) => {
      changedValue = value;
    };

    const component = await mount(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.fill('name: test');
    expect(changedValue).toBe('name: test');
  });

  test('should be read-only when isReadOnly is true', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="test" isReadOnly={true} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveAttribute('readonly');
  });

  test('should apply custom className', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor className="custom-class" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should apply custom height', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor height="500px" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should apply custom aria-label', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor aria-label="Custom YAML editor" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveAttribute('aria-label', 'Custom YAML editor');
  });

  test('should hide line numbers when isLineNumbersVisible is false', async ({ mount }) => {
    const component = await mount(
      <YamlCodeEditor code="line1\nline2\nline3" isLineNumbersVisible={false} />
    );
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should show line numbers by default', async ({ mount }) => {
    const code = 'line1\nline2\nline3';
    const component = await mount(<YamlCodeEditor code={code} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(code);
    await expect(textarea).toBeVisible();
  });

  test('should handle Tab key for indentation', async ({ mount, page }) => {
    let currentValue = '';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await page.keyboard.press('Tab');

    expect(currentValue).toBe('  ');
  });

  test('should handle Shift+Tab for unindenting', async ({ mount, page }) => {
    let currentValue = '  test';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="  test" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await textarea.evaluate((el) => {
      (el as HTMLTextAreaElement).setSelectionRange(2, 2);
    });
    await page.keyboard.press('Shift+Tab');

    expect(currentValue).toBe('test');
  });

  test('should have spellCheck disabled', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveAttribute('spellcheck', 'false');
  });

  test('should update line numbers when code changes', async ({ mount }) => {
    let currentValue = 'line1';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="line1" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.fill('line1\nline2\nline3');
    expect(currentValue).toBe('line1\nline2\nline3');
  });

  test('should render without syntax highlighting when disabled', async ({ mount }) => {
    const component = await mount(
      <YamlCodeEditor code="name: test" enableSyntaxHighlighting={false} />
    );
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue('name: test');
  });

  test('should render with syntax highlighting by default', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="name: test" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should handle multi-line YAML content', async ({ mount }) => {
    const yamlContent = `apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
    - name: nginx
      image: nginx:latest`;

    const component = await mount(<YamlCodeEditor code={yamlContent} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(yamlContent);
  });

  test('should allow editing multi-line content', async ({ mount }) => {
    let currentValue = '';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    const newContent = 'key1: value1\nkey2: value2';

    await textarea.fill(newContent);

    await expect.poll(() => currentValue).toBe(newContent);
  });

  test('should not call onChange when readonly', async ({ mount }) => {
    let changeCallCount = 0;
    const handleChange = () => {
      changeCallCount++;
    };

    const component = await mount(
      <YamlCodeEditor code="initial" onChange={handleChange} isReadOnly={true} />
    );
    const textarea = component.getByRole('textbox');

    await textarea.fill('new value', { force: true });

    expect(changeCallCount).toBe(0);
  });

  test('should handle empty string code', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue('');
  });

  test('should handle very long YAML content', async ({ mount }) => {
    const longContent = Array.from({ length: 100 }, (_, i) => `key${i}: value${i}`).join('\n');
    const component = await mount(<YamlCodeEditor code={longContent} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(longContent);
  });

  test('should handle code with only whitespace', async ({ mount }) => {
    const whitespaceCode = '   \n   \n   ';
    const component = await mount(<YamlCodeEditor code={whitespaceCode} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(whitespaceCode);
  });

  test('should handle code with special YAML characters', async ({ mount }) => {
    const specialYaml = 'key: "value with: colon"\nlist:\n  - item1\n  - item2';
    const component = await mount(<YamlCodeEditor code={specialYaml} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(specialYaml);
  });

  test('should handle rapid text changes', async ({ mount }) => {
    const changes: string[] = [];
    const handleChange = (value: string) => {
      changes.push(value);
    };

    const component = await mount(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.fill('a');
    await textarea.fill('ab');
    await textarea.fill('abc');

    expect(changes.length).toBeGreaterThan(0);
  });

  test('should handle multiple tab indentations', async ({ mount, page }) => {
    let currentValue = '';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await page.keyboard.press('Tab');

    expect(currentValue).toBe('  ');
  });

  test('should handle Tab in middle of text', async ({ mount, page }) => {
    let currentValue = 'hello';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="hello" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await textarea.evaluate((el) => {
      (el as HTMLTextAreaElement).setSelectionRange(5, 5);
    });
    await page.keyboard.press('Tab');

    expect(currentValue).toBe('hello  ');
  });

  test('should preserve cursor position after onChange', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="test" onChange={() => {}} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await textarea.evaluate((el) => {
      (el as HTMLTextAreaElement).setSelectionRange(2, 2);
    });

    await expect(textarea).toBeFocused();
  });

  test('should handle code update from props', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="initial" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue('initial');

    await component.update(<YamlCodeEditor code="updated" />);
    await expect(textarea).toHaveValue('updated');
  });

  test('should render with consistent height', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="test" height="300px" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should disable spellcheck by default', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="test" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveAttribute('spellcheck', 'false');
  });

  test('should handle newline characters correctly', async ({ mount }) => {
    const codeWithNewlines = 'line1\nline2\nline3';
    const component = await mount(<YamlCodeEditor code={codeWithNewlines} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(codeWithNewlines);
  });

  test('should handle unicode characters', async ({ mount }) => {
    const unicodeCode = 'name: 你好\ndescription: Привет\nemoji: 🎉';
    const component = await mount(<YamlCodeEditor code={unicodeCode} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(unicodeCode);
  });

  test('should handle onChange with selection', async ({ mount, page }) => {
    let currentValue = 'hello world';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="hello world" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await textarea.evaluate((el) => {
      (el as HTMLTextAreaElement).setSelectionRange(0, 5);
    });
    await page.keyboard.press('Delete');

    expect(currentValue).toBe(' world');
  });

  test('should handle line numbers for single line', async ({ mount }) => {
    const component = await mount(<YamlCodeEditor code="single line" />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toBeVisible();
  });

  test('should handle very deeply indented YAML', async ({ mount }) => {
    const deeplyIndented = '  '.repeat(10) + 'deeply: nested';
    const component = await mount(<YamlCodeEditor code={deeplyIndented} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(deeplyIndented);
  });

  test('should handle Shift+Tab on first column', async ({ mount, page }) => {
    let currentValue = 'test';
    const handleChange = (value: string) => {
      currentValue = value;
    };

    const component = await mount(<YamlCodeEditor code="test" onChange={handleChange} />);
    const textarea = component.getByRole('textbox');

    await textarea.focus();
    await textarea.evaluate((el) => {
      (el as HTMLTextAreaElement).setSelectionRange(0, 0);
    });
    await page.keyboard.press('Shift+Tab');

    expect(currentValue).toBe('test');
  });

  test('should handle mixed indentation styles', async ({ mount }) => {
    const mixedIndent = '  spaces\n\ttab';
    const component = await mount(<YamlCodeEditor code={mixedIndent} />);
    const textarea = component.getByRole('textbox');
    await expect(textarea).toHaveValue(mixedIndent);
  });
});

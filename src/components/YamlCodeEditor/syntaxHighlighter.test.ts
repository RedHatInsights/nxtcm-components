import { highlightYaml, stripHighlighting } from './syntaxHighlighter';

describe('syntaxHighlighter', () => {
  describe('highlightYaml', () => {
    it('highlights YAML keys', () => {
      const result = highlightYaml('name: test');
      expect(result).toContain('yaml-key');
      expect(result).toContain('name');
    });

    it('highlights strings', () => {
      const result = highlightYaml('name: "test string"');
      expect(result).toContain('yaml-string');
    });

    it('highlights numbers', () => {
      const result = highlightYaml('count: 123');
      expect(result).toContain('yaml-number');
      expect(result).toContain('123');
    });

    it('highlights boolean values', () => {
      const result = highlightYaml('enabled: true');
      expect(result).toContain('yaml-boolean');
      expect(result).toContain('true');
    });

    it('highlights comments', () => {
      const result = highlightYaml('# This is a comment');
      expect(result).toContain('yaml-comment');
    });

    it('highlights list items', () => {
      const result = highlightYaml('items:\n  - item1\n  - item2');
      expect(result).toContain('yaml-punctuation');
    });

    it('highlights directives', () => {
      const result = highlightYaml('---\nname: test');
      expect(result).toContain('yaml-directive');
      expect(result).toContain('---');
    });

    it('escapes HTML entities', () => {
      const result = highlightYaml('html: <script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('handles empty strings', () => {
      const result = highlightYaml('');
      expect(result).toBe('');
    });

    it('highlights nested structures', () => {
      const yaml = `
root:
  child:
    value: 123
    name: "test"
`;
      const result = highlightYaml(yaml);
      expect(result).toContain('yaml-key');
      expect(result).toContain('yaml-number');
      expect(result).toContain('yaml-string');
    });

    it('highlights anchors and aliases', () => {
      const result = highlightYaml('anchor: &myanchor\nalias: *myanchor');
      expect(result).toContain('yaml-anchor');
    });

    it('preserves line breaks', () => {
      const result = highlightYaml('line1\nline2\nline3');
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
    });
  });

  describe('stripHighlighting', () => {
    it('removes HTML tags from highlighted code', () => {
      const highlighted =
        '<span class="yaml-key">name</span>: <span class="yaml-string">"test"</span>';
      const result = stripHighlighting(highlighted);
      expect(result).toBe('name: "test"');
    });

    it('handles text without HTML tags', () => {
      const text = 'plain text';
      const result = stripHighlighting(text);
      expect(result).toBe('plain text');
    });

    it('removes nested HTML tags', () => {
      const highlighted = '<div><span class="yaml-key">name</span></div>';
      const result = stripHighlighting(highlighted);
      expect(result).toBe('name');
    });
  });
});

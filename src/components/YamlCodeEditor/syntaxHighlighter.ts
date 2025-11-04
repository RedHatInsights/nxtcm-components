/**
 * Simple YAML syntax highlighter
 * Converts YAML text to HTML with syntax highlighting
 */

export function highlightYaml(code: string): string {
  if (!code) return '';

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const lines = code.split('\n');
  const highlightedLines = lines.map((line) => {
    const highlighted = escapeHtml(line);

    // Skip empty lines
    if (!highlighted.trim()) {
      return highlighted;
    }

    // YAML directives (---, ...) - must be first
    if (/^(---|\.\.\.)\s*$/.test(highlighted)) {
      return highlighted.replace(/^(---|\.\.\.)/, '<span class="yaml-directive">$1</span>');
    }

    // Comments (entire line or inline)
    if (highlighted.trim().startsWith('#')) {
      return `<span class="yaml-comment">${highlighted}</span>`;
    }

    // Split inline comments
    const commentMatch = highlighted.match(/^(.+?)(#.*)$/);
    let mainPart = highlighted;
    let commentPart = '';

    if (commentMatch) {
      mainPart = commentMatch[1];
      commentPart = `<span class="yaml-comment">${commentMatch[2]}</span>`;
    }

    // List items (lines with dash)
    mainPart = mainPart.replace(/^(\s*)(-)(\s+)/, '$1<span class="yaml-punctuation">$2</span>$3');

    // YAML keys (word followed by colon) - handle quoted strings in values first to avoid conflicts
    const keyMatch = mainPart.match(/^(\s*)([a-zA-Z0-9_-]+)(\s*)(:)(.*)$/);
    if (keyMatch) {
      const indent = keyMatch[1];
      const key = keyMatch[2];
      const space = keyMatch[3];
      const colon = keyMatch[4];
      let value = keyMatch[5];

      // Handle the value part
      // Strings (quoted) - must be before numbers and booleans
      value = value.replace(
        /(&quot;)([^&]*?)(&quot;)/g,
        '<span class="yaml-string">&quot;$2&quot;</span>'
      );
      value = value.replace(
        /(&#039;)([^&]*?)(&#039;)/g,
        '<span class="yaml-string">&#039;$2&#039;</span>'
      );

      // Anchors and aliases (avoid matching HTML entities like &lt; &gt; &quot; &amp;)
      value = value.replace(/([&*])([a-zA-Z][a-zA-Z0-9_-]*)/g, (match, prefix, name) => {
        // Don't highlight HTML entities
        if (prefix === '&' && ['lt', 'gt', 'quot', 'amp', '#039'].includes(name)) {
          return match;
        }
        return `<span class="yaml-anchor">${prefix}${name}</span>`;
      });

      // Boolean values (only if not already in a span)
      value = value.replace(
        /^\s*(true|false|yes|no|on|off|null|~)\s*$/gi,
        ' <span class="yaml-boolean">$1</span>'
      );

      // Numbers (only if not already in a span)
      if (!value.includes('<span')) {
        value = value.replace(/^\s*(-?\d+\.?\d*)\s*$/, ' <span class="yaml-number">$1</span>');
      }

      mainPart = `${indent}<span class="yaml-key">${key}</span>${space}<span class="yaml-punctuation">${colon}</span>${value}`;
    }

    return mainPart + commentPart;
  });

  return highlightedLines.join('\n');
}

/**
 * Strip HTML tags from highlighted code
 * Used for testing or conversion purposes
 */
export function stripHighlighting(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

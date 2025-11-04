import React, { useEffect, useRef } from 'react';
import styles from './YamlCodeEditor.module.scss';
import { highlightYaml } from './syntaxHighlighter';

export interface YamlCodeEditorProps {
  code?: string;
  onChange?: (value: string) => void;
  height?: string;
  isReadOnly?: boolean;
  isLineNumbersVisible?: boolean;
  className?: string;
  'aria-label'?: string;
  enableSyntaxHighlighting?: boolean;
}

export const YamlCodeEditor: React.FC<YamlCodeEditorProps> = ({
  code = '',
  onChange,
  height = '400px',
  isReadOnly = false,
  isLineNumbersVisible = true,
  className = '',
  'aria-label': ariaLabel = 'YAML code editor',
  enableSyntaxHighlighting = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;

      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
      if (highlightRef.current) {
        // Move the inner content of the highlight layer
        const content = highlightRef.current.firstChild as HTMLElement;
        if (content) {
          content.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;
        }
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (event.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineBeforeSelection = value.substring(lineStart, start);

        if (lineBeforeSelection.startsWith('  ')) {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          if (onChange) {
            onChange(newValue);
          }
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        } else if (lineBeforeSelection.startsWith(' ')) {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 1);
          if (onChange) {
            onChange(newValue);
          }
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1;
          }, 0);
        }
      } else {
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        if (onChange) {
          onChange(newValue);
        }
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lineCount = (code.match(/\n/g) || []).length + 1;
      const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
      lineNumbersRef.current.textContent = lineNumbers;
    }
  }, [code]);

  return (
    <div className={`${styles.editor} ${className}`} style={{ height }}>
      {isLineNumbersVisible && (
        <div className={styles.lineNumbers} ref={lineNumbersRef} aria-hidden="true" />
      )}
      <div className={styles.contentWrapper}>
        {enableSyntaxHighlighting && (
          <div ref={highlightRef} className={styles.highlight} aria-hidden="true">
            <pre
              className={styles.highlightContent}
              dangerouslySetInnerHTML={{ __html: highlightYaml(code) }}
            />
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={`${styles.textarea} ${!enableSyntaxHighlighting ? styles.textareaNoHighlight : ''}`}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={isReadOnly}
          spellCheck={false}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
};

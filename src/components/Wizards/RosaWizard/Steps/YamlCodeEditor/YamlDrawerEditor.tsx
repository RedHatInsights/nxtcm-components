import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@tanstack/react-form';
import { Alert, Button, ClipboardCopyButton, Tooltip } from '@patternfly/react-core';
import { SearchIcon, UndoIcon, RedoIcon, TimesIcon } from '@patternfly/react-icons';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import Handlebars from 'handlebars';
import rosaHcpTemplateRaw from './templates/rosa-hcp-template.hbs?raw';
import './YamlDrawerEditor.css';
import { parseMultiDocYaml } from './yamlUtils';
import { validateYaml } from './yamlValidation';

import { useRosaForm } from '../../RosaFormContext';

/** Handlebars helper: renders the block when `a` strictly equals `b`, else the inverse block. */
Handlebars.registerHelper(
  'eq',
  function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  }
);

/** Handlebars helper: removes a leading `/` from string values (no-op for non-strings). */
Handlebars.registerHelper('stripSlash', function (value: string) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value.slice(1);
  }
  return value;
});

const compiledTemplate = Handlebars.compile(rosaHcpTemplateRaw);

/** Builds YAML text from the ROSA HCP Handlebars template and strips blank-only lines. */
function renderTemplate(data: Record<string, unknown>): string {
  try {
    const raw = compiledTemplate(data);
    const cleaned = raw
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
    return cleaned;
  } catch {
    return 'Error rendering template';
  }
}

/** Optional drawer chrome: parent can supply a close handler for the YAML panel. */
interface YamlDrawerEditorProps {
  onClose?: () => void;
}

/**
 * Monaco YAML editor synced with wizard form values: renders from template when unfocused,
 * writes parsed cluster fields back on edit, and shows schema validation in the editor.
 */
export function YamlDrawerEditor({ onClose }: YamlDrawerEditorProps) {
  const form = useRosaForm();
  const data = useStore(form.store, (s) => s.values);
  const [yamlContent, setYamlContent] = useState('');
  const [parseError, setParseError] = useState('');
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const hasFocusRef = useRef(false);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /** Runs YAML validation and maps results to Monaco model markers plus inline error text. */
  const setEditorMarkers = useCallback((yamlStr: string) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!model || !monaco) return;

    const validationErrors = validateYaml(yamlStr);

    const markers = validationErrors.map((err) => ({
      severity:
        err.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      message: err.message,
      startLineNumber: err.line,
      startColumn: err.column,
      endLineNumber: err.line,
      endColumn: model.getLineMaxColumn(err.line),
    }));

    monaco.editor.setModelMarkers(model, 'yaml-validation', markers);

    if (validationErrors.length > 0) {
      const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
      setParseError(`${errorCount} validation error${errorCount !== 1 ? 's' : ''} found`);
    } else {
      setParseError('');
    }
  }, []);

  /** Refreshes editor YAML from the Handlebars template when form data changes, unless the editor has focus. */
  useEffect(() => {
    if (!hasFocusRef.current) {
      const rendered = renderTemplate(data as Record<string, unknown>);
      setYamlContent(rendered);
      setParseError('');
    }
  }, [data]);

  /** Updates local YAML state, merges parsed `cluster` into the form, and debounces validation. */
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newYaml = value ?? '';
      setYamlContent(newYaml);

      const parsed = parseMultiDocYaml(newYaml);
      if (parsed) {
        const parsedCluster = parsed.cluster as Record<string, unknown> | undefined;
        if (parsedCluster) {
          for (const [key, val] of Object.entries(parsedCluster)) {
            form.setFieldValue(`cluster.${key}` as never, val as never);
          }
        }
      }

      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = setTimeout(() => {
        setEditorMarkers(newYaml);
      }, 300);
    },
    [form, setEditorMarkers]
  );

  /** Stores editor/Monaco refs, tracks focus for template refresh, adds a top spacer zone, and validates. */
  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.onDidFocusEditorWidget(() => {
        hasFocusRef.current = true;
      });
      editor.onDidBlurEditorWidget(() => {
        hasFocusRef.current = false;
      });

      editor.changeViewZones((changeAccessor) => {
        const domNode = document.createElement('div');
        changeAccessor.addZone({
          afterLineNumber: 0,
          heightInPx: 10,
          domNode,
        });
      });

      setEditorMarkers(yamlContent);
    },
    [setEditorMarkers, yamlContent]
  );

  /** Copies the current selection if any, otherwise the full YAML document, to the clipboard. */
  const handleCopy = useCallback(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      const selection = editorRef.current.getSelection();
      if (model && selection) {
        const selectedText = model.getValueInRange(selection);
        void navigator.clipboard.writeText(selectedText || yamlContent);
      } else {
        void navigator.clipboard.writeText(yamlContent);
      }
    } else {
      void navigator.clipboard.writeText(yamlContent);
    }
  }, [yamlContent]);

  return (
    <div className="yaml-drawer-editor">
      <div className="yaml-drawer-editor__header">
        <div className="yaml-drawer-editor__title">YAML</div>
        <div className="yaml-drawer-editor__toolbar">
          <Tooltip content="Undo">
            <Button
              variant="plain"
              size="sm"
              aria-label="Undo"
              onClick={() => editorRef.current?.trigger('source', 'undo', undefined)}
            >
              <UndoIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Redo">
            <Button
              variant="plain"
              size="sm"
              aria-label="Redo"
              onClick={() => editorRef.current?.trigger('source', 'redo', undefined)}
            >
              <RedoIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Find">
            <Button
              variant="plain"
              size="sm"
              aria-label="Find"
              onClick={() => editorRef.current?.trigger('source', 'actions.find', undefined)}
            >
              <SearchIcon />
            </Button>
          </Tooltip>
          <ClipboardCopyButton
            id="yaml-copy-button"
            aria-label="Copy to clipboard"
            onClick={handleCopy}
            exitDelay={600}
            variant="plain"
          >
            Copy
          </ClipboardCopyButton>
          {onClose && (
            <Tooltip content="Close">
              <Button variant="plain" size="sm" aria-label="Close" onClick={onClose}>
                <TimesIcon />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {parseError && (
        <div className="yaml-drawer-editor__error">
          <Alert variant="danger" isInline isPlain title={parseError} />
        </div>
      )}

      <div className="yaml-drawer-editor__body">
        <Editor
          defaultLanguage="yaml"
          value={yamlContent}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          height="100%"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: true,
            smoothScrolling: true,
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true,
            wordWrap: 'wordWrapColumn',
            wordWrapColumn: 256,
            glyphMargin: true,
            scrollbar: {
              verticalScrollbarSize: 17,
              horizontalScrollbarSize: 17,
            },
          }}
        />
      </div>
    </div>
  );
}

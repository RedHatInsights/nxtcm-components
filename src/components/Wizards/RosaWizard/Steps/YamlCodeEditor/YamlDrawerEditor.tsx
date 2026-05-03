import { useState, useEffect, useCallback, useRef } from 'react';
import { useItem, useData } from '@patternfly-labs/react-form-wizard';
import { Alert, Button, ClipboardCopyButton, Tooltip } from '@patternfly/react-core';
import { SearchIcon, UndoIcon, RedoIcon, TimesIcon } from '@patternfly/react-icons';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import './monacoYamlSetup';
import Handlebars from 'handlebars';
import rosaHcpTemplateRaw from './templates/rosa-hcp-template.hbs?raw';
import './YamlDrawerEditor.css';
import { validateYaml } from './yamlValidation';
import { parseMultiDocYaml } from './yamlUtils';
import { RosaWizardFormData } from '../../../types';

Handlebars.registerHelper(
  'eq',
  function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  }
);

Handlebars.registerHelper('stripSlash', function (value: string) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value.slice(1);
  }
  return value;
});

const compiledTemplate = Handlebars.compile(rosaHcpTemplateRaw);
const ROSA_YAML_MODEL_PATH = 'rosa-control-plane.yaml';
const YAML_VALIDATION_OWNER = 'yaml-validation';

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

interface YamlDrawerEditorProps {
  onClose?: () => void;
}

export function YamlDrawerEditor({ onClose }: YamlDrawerEditorProps) {
  const data = useItem<RosaWizardFormData>();
  const { update } = useData();
  const [yamlContent, setYamlContent] = useState('');
  const [parseError, setParseError] = useState('');
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const hasFocusRef = useRef(false);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const setEditorMarkers = useCallback((yamlStr: string) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!model || !monaco) return;

    const errors = validateYaml(yamlStr);
    const markers = errors.map((err) => {
      const lineNumber = Math.min(Math.max(err.line, 1), model.getLineCount());
      const startColumn = Math.max(err.column, 1);
      const endColumn = Math.max(startColumn + 1, model.getLineMaxColumn(lineNumber));

      return {
        severity:
          err.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        message: err.message,
        startLineNumber: lineNumber,
        startColumn,
        endLineNumber: lineNumber,
        endColumn,
      };
    });

    monaco.editor.setModelMarkers(model, YAML_VALIDATION_OWNER, markers);
    const errorCount = errors.filter((error) => error.severity === 'error').length;
    setParseError(
      errorCount > 0 ? `${errorCount} validation error${errorCount !== 1 ? 's' : ''} found` : ''
    );
  }, []);

  useEffect(() => {
    if (!hasFocusRef.current) {
      const rendered = renderTemplate(data as Record<string, unknown>);
      setYamlContent(rendered);
      setParseError('');
    }
  }, [data]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newYaml = value ?? '';
      setYamlContent(newYaml);

      const parsed = parseMultiDocYaml(newYaml);
      if (parsed) {
        const current = data as Record<string, unknown>;
        const merged = {
          ...current,
          cluster: {
            ...(current.cluster as Record<string, unknown>),
            ...(parsed.cluster as Record<string, unknown>),
          },
        };
        update(merged);
      }

      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = setTimeout(() => {
        setEditorMarkers(newYaml);
      }, 250);
    },
    [update, data, setEditorMarkers]
  );

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

      setEditorMarkers(editor.getValue());
    },
    [setEditorMarkers]
  );

  useEffect(() => {
    return () => {
      clearTimeout(validationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      setEditorMarkers(yamlContent);
    }
  }, [yamlContent, setEditorMarkers]);

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
          language="yaml"
          path={ROSA_YAML_MODEL_PATH}
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
            quickSuggestions: { other: true, comments: true, strings: true },
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

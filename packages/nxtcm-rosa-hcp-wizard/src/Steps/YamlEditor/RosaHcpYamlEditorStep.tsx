import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Alert,
  Button,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Tooltip,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import type { EditorDidMount } from '@patternfly/react-code-editor';
import type * as MonacoTypes from 'monaco-editor';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';
import { useWatch } from 'react-hook-form';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../types';
import { RosaHcpYamlMonacoLoader } from './RosaHcpYamlMonacoLoader';
import { RosaHcpSchemaPanel } from './RosaHcpSchemaPanel';
import type { YamlResourceGenerator } from './types';
import './RosaHcpYamlEditorStep.css';

const YAML_MODEL_PATH = 'rosa-hcp-control-plane.yaml';
const YAML_VALIDATION_OWNER = 'yaml-hcp-validation';

export type YamlEditorHandle = {
  discard: () => void;
  hasSchemaErrors: () => boolean;
};

export type RosaHcpYamlEditorStepProps = {
  onClose?: () => void;
  onCancel?: () => void;
  resourceGenerator: YamlResourceGenerator;
};

export const RosaHcpYamlEditorStep = forwardRef<YamlEditorHandle, RosaHcpYamlEditorStepProps>(
  ({ onClose, onCancel: _onCancel, resourceGenerator }, ref) => {
    const watchedValues = useWatch<Partial<ROSAHCPCluster>>();

    const { yamlEditor: yamlStrings } = useRosaHcpWizardStrings();

    const generator = resourceGenerator;

    const [yamlContent, setYamlContent] = useState(() =>
      generator.renderYaml(watchedValues as Partial<ROSAHCPCluster>)
    );
    const [parseError, setParseError] = useState('');
    const [showSchema, setShowSchema] = useState(true);

    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof MonacoTypes | null>(null);
    const monacoYamlDisposeRef = useRef<(() => void) | null>(null);
    const editorListenersDisposeRef = useRef<(() => void) | null>(null);
    const hasFocusRef = useRef(false);
    const validationTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const isInitializedRef = useRef(false);
    const pendingYamlRef = useRef(yamlContent);
    const userHasEditedRef = useRef(false);
    const hasSchemaErrorsRef = useRef(false);

    const setEditorMarkers = useCallback(
      (yamlStr: string, showBanner = true) => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const model = editor?.getModel();
        if (!model || !monaco) return;

        const errors = generator.validateYaml(yamlStr);
        const markers = errors.map((err) => {
          const lineNumber = Math.min(Math.max(err.line, 1), model.getLineCount());
          const startColumn = Math.max(err.column, 1);
          const endColumn = Math.max(startColumn + 1, model.getLineMaxColumn(lineNumber));
          return {
            severity:
              err.severity === 'error'
                ? monaco.MarkerSeverity.Error
                : monaco.MarkerSeverity.Warning,
            message: err.message,
            startLineNumber: lineNumber,
            startColumn,
            endLineNumber: lineNumber,
            endColumn,
          };
        });

        monaco.editor.setModelMarkers(model, YAML_VALIDATION_OWNER, markers);
        const errorCount = errors.filter((e) => e.severity === 'error').length;
        hasSchemaErrorsRef.current = errorCount > 0;
        if (showBanner) {
          setParseError(
            errorCount > 0
              ? `${errorCount} validation error${errorCount !== 1 ? 's' : ''} found`
              : ''
          );
        }
      },
      [generator]
    );

    useEffect(() => {
      if (!hasFocusRef.current && !userHasEditedRef.current) {
        const rendered = generator.renderYaml(watchedValues as Partial<ROSAHCPCluster>);
        if (rendered === pendingYamlRef.current) {
          return;
        }
        pendingYamlRef.current = rendered;
        setYamlContent(rendered);
        setParseError('');
        hasSchemaErrorsRef.current = false;
        if (editorRef.current) {
          setEditorMarkers(rendered, false);
        }
      }
    }, [watchedValues, generator, setEditorMarkers]);

    const handleCodeChange = useCallback(
      (value: string) => {
        pendingYamlRef.current = value;
        userHasEditedRef.current = true;
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = setTimeout(() => {
          setEditorMarkers(value, false);
        }, 300);
      },
      [setEditorMarkers]
    );

    const handleEditorDidMount: EditorDidMount = useCallback(
      (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco as unknown as typeof MonacoTypes;

        editorListenersDisposeRef.current?.();
        const focusDisposable = editor.onDidFocusEditorWidget(() => {
          hasFocusRef.current = true;
        });
        const blurDisposable = editor.onDidBlurEditorWidget(() => {
          hasFocusRef.current = false;
          setEditorMarkers(editor.getValue());
        });
        editorListenersDisposeRef.current = () => {
          focusDisposable.dispose();
          blurDisposable.dispose();
        };

        if (!isInitializedRef.current) {
          monacoYamlDisposeRef.current?.();
          monacoYamlDisposeRef.current = new RosaHcpYamlMonacoLoader().configure(
            monaco as Parameters<RosaHcpYamlMonacoLoader['configure']>[0],
            generator.resourceSchemas
          );
          isInitializedRef.current = true;
        }

        pendingYamlRef.current = editor.getValue();
        setEditorMarkers(editor.getValue(), false);
      },
      [setEditorMarkers, generator]
    );

    useEffect(() => {
      return () => {
        clearTimeout(validationTimerRef.current);
        editorListenersDisposeRef.current?.();
        editorListenersDisposeRef.current = null;
        monacoYamlDisposeRef.current?.();
        monacoYamlDisposeRef.current = null;
        isInitializedRef.current = false;
        userHasEditedRef.current = false;
        hasSchemaErrorsRef.current = false;
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        discard() {
          onClose?.();
        },
        hasSchemaErrors() {
          return hasSchemaErrorsRef.current;
        },
      }),
      [onClose]
    );

    const schemaToggleControl = (
      <Tooltip content={showSchema ? yamlStrings.schemaHideTooltip : yamlStrings.schemaShowTooltip}>
        <Button
          variant="plain"
          aria-label={yamlStrings.schemaToggleAriaLabel}
          onClick={() => setShowSchema((v) => !v)}
        >
          <OpenDrawerRightIcon />
        </Button>
      </Tooltip>
    );

    const primarySchema = generator.resourceSchemas?.find((s) => s.primary)?.schema;
    const hasResourceSchemas = (generator.resourceSchemas?.length ?? 0) > 0;

    return (
      <div className="rosa-hcp-yaml-editor-step">
        {parseError && (
          <Alert
            variant="danger"
            isInline
            title={yamlStrings.parseErrorTitle}
            className="pf-v6-u-mb-sm"
          >
            {parseError}
          </Alert>
        )}

        <Drawer isInline isExpanded={showSchema} position="end">
          <DrawerContent
            panelContent={
              showSchema && primarySchema ? (
                <RosaHcpSchemaPanel onClose={() => setShowSchema(false)} schema={primarySchema} />
              ) : undefined
            }
          >
            <DrawerContentBody>
              <CodeEditor
                language={Language.yaml}
                code={yamlContent}
                onCodeChange={handleCodeChange}
                onEditorDidMount={handleEditorDidMount}
                isFullHeight
                isCopyEnabled
                isDownloadEnabled
                customControls={hasResourceSchemas ? schemaToggleControl : undefined}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  tabSize: 2,
                  automaticLayout: true,
                  wordWrap: 'wordWrapColumn',
                  wordWrapColumn: 256,
                  glyphMargin: true,
                  quickSuggestions: { other: true, comments: true, strings: true },
                  fixedOverflowWidgets: true,
                  scrollbar: {
                    verticalScrollbarSize: 17,
                    horizontalScrollbarSize: 17,
                  },
                }}
                editorProps={{ path: YAML_MODEL_PATH }}
              />
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }
);

RosaHcpYamlEditorStep.displayName = 'RosaHcpYamlEditorStep';

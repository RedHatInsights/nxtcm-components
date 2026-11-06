import {
  forwardRef,
  Fragment,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import type { EditorDidMount } from '@patternfly/react-code-editor';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { Alert, AlertGroup } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core/dist/dynamic/components/Drawer';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import { Flex, FlexItem } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';
import type * as MonacoTypes from 'monaco-editor';
import { useWatch } from 'react-hook-form';

import { YAML_MODEL_PATH, YAML_VALIDATION_OWNER } from '../../constants';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../types';
import { RosaHcpSchemaPanel } from './RosaHcpSchemaPanel';
import { RosaHcpYamlMonacoLoader } from './RosaHcpYamlMonacoLoader';
import type { YamlResourceGenerator } from './types';

import './RosaHcpYamlEditorStep.css';

export type YamlEditorHandle = {
  discard: () => void;
  hasSchemaErrors: () => boolean;
  getYaml: () => string;
};

type ShortcutKeyCombo = {
  keys: string[];
  platform?: string;
};

type EditorShortcut = {
  combos: ShortcutKeyCombo[];
  description: string;
};

const ShortcutKeys = ({ keys, platform }: ShortcutKeyCombo): ReactElement => (
  <Flex
    flexWrap={{ default: 'nowrap' }}
    gap={{ default: 'gapXs' }}
    alignItems={{ default: 'alignItemsCenter' }}
  >
    {keys.map((key, index) => (
      <Fragment key={key}>
        {index > 0 && <FlexItem>+</FlexItem>}
        <FlexItem>
          <Label variant="outline" isCompact>
            <kbd>{key}</kbd>
          </Label>
        </FlexItem>
      </Fragment>
    ))}
    {platform && <FlexItem>({platform})</FlexItem>}
  </Flex>
);

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

    const instructionsId = useId();
    const editorWrapperRef = useRef<HTMLElement | null>(null);
    const schemaToggleRef = useRef<HTMLButtonElement>(null);
    const schemaPanelId = useId();
    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof MonacoTypes | null>(null);
    const monacoYamlDisposeRef = useRef<(() => void) | null>(null);
    const editorListenersDisposeRef = useRef<(() => void) | null>(null);
    const hasFocusRef = useRef(false);
    const validationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isInitializedRef = useRef(false);
    const pendingYamlRef = useRef(yamlContent);
    const userHasEditedRef = useRef(false);
    const hasSchemaErrorsRef = useRef(false);
    const bannerShownRef = useRef(false);

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
        if (showBanner || bannerShownRef.current) {
          if (errorCount > 0) {
            bannerShownRef.current = true;
          }
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
        bannerShownRef.current = false;
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

    // CodeEditor has no props to name its focusable wrapper, so set them on the DOM.
    const labelEditorWrapper = useCallback(() => {
      const wrapper = editorWrapperRef.current;
      if (!wrapper) return;
      wrapper.setAttribute('role', 'group');
      wrapper.setAttribute('aria-label', yamlStrings.editorAriaLabel);
      wrapper.setAttribute('aria-describedby', instructionsId);
    }, [yamlStrings.editorAriaLabel, instructionsId]);

    useEffect(() => {
      labelEditorWrapper();
    }, [labelEditorWrapper]);

    const handleEditorDidMount: EditorDidMount = useCallback(
      (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editorWrapperRef.current = editor
          .getContainerDomNode()
          .closest<HTMLElement>('[tabindex="0"]');
        labelEditorWrapper();

        // Expose editor for E2E testing
        if (import.meta.env.DEV) {
          (window as typeof window & { monacoEditor?: typeof editor }).monacoEditor = editor;
        }

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
            monaco,
            generator.resourceSchemas
          );
          isInitializedRef.current = true;
        }

        pendingYamlRef.current = editor.getValue();
        setEditorMarkers(editor.getValue(), false);
      },
      [setEditorMarkers, generator, labelEditorWrapper]
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
        bannerShownRef.current = false;
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        discard() {
          onClose?.();
        },
        hasSchemaErrors() {
          if (hasSchemaErrorsRef.current && !bannerShownRef.current) {
            setEditorMarkers(pendingYamlRef.current, true);
          }
          return hasSchemaErrorsRef.current;
        },
        getYaml() {
          return pendingYamlRef.current;
        },
      }),
      [onClose, setEditorMarkers]
    );

    const primarySchema = generator.resourceSchemas?.find((s) => s.primary)?.schema;
    const hasResourceSchemas = (generator.resourceSchemas?.length ?? 0) > 0;

    // The close button unmounts with the panel, so move focus to the toggle.
    const closeSchemaPanel = useCallback(() => {
      setShowSchema(false);
      schemaToggleRef.current?.focus();
    }, []);

    const schemaToggleControl = (
      <Tooltip content={showSchema ? yamlStrings.schemaHideTooltip : yamlStrings.schemaShowTooltip}>
        <Button
          ref={schemaToggleRef}
          variant="plain"
          aria-label={yamlStrings.schemaToggleAriaLabel}
          aria-expanded={showSchema}
          // The panel unmounts when closed.
          aria-controls={showSchema && primarySchema ? schemaPanelId : undefined}
          data-testid="schema-panel-toggle"
          onClick={() => setShowSchema((v) => !v)}
        >
          <OpenDrawerRightIcon />
        </Button>
      </Tooltip>
    );

    const shortcuts: EditorShortcut[] = [
      { combos: [{ keys: ['Down Arrow'] }], description: yamlStrings.shortcutStartEditing },
      { combos: [{ keys: ['Shift', 'Tab'] }], description: yamlStrings.shortcutLeaveEditor },
      {
        combos: [
          { keys: ['Ctrl', 'M'] },
          { keys: ['Ctrl', 'Shift', 'M'], platform: yamlStrings.shortcutsMacLabel },
        ],
        description: yamlStrings.shortcutToggleTabFocus,
      },
      { combos: [{ keys: ['F8'] }], description: yamlStrings.shortcutNextProblem },
      { combos: [{ keys: ['Shift', 'F8'] }], description: yamlStrings.shortcutPreviousProblem },
      { combos: [{ keys: ['F1'] }], description: yamlStrings.shortcutCommandPalette },
    ];

    const shortcutsPopoverProps = {
      'aria-label': yamlStrings.shortcutsAriaLabel,
      maxWidth: '34rem',
      bodyContent: (
        <DescriptionList isHorizontal isCompact termWidth="30ch">
          {shortcuts.map(({ combos, description }) => (
            <DescriptionListGroup key={description}>
              <DescriptionListTerm>
                <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                  {combos.map((combo) => (
                    <ShortcutKeys key={combo.keys.join('+')} {...combo} />
                  ))}
                </Flex>
              </DescriptionListTerm>
              <DescriptionListDescription>{description}</DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      ),
    };

    return (
      <div className="rosa-hcp-yaml-editor-step">
        <span id={instructionsId} hidden>
          {yamlStrings.editorInstructions}
        </span>
        <AlertGroup isLiveRegion data-testid="yaml-validation-live-region">
          {/* Not &&: AlertGroup would wrap '' in an empty <li>. */}
          {parseError ? (
            <Alert
              variant="danger"
              isInline
              title={yamlStrings.parseErrorTitle}
              className="pf-v6-u-mb-sm"
            >
              {parseError}
            </Alert>
          ) : null}
        </AlertGroup>

        <Drawer isInline isExpanded={showSchema} position="end">
          <DrawerContent
            panelContent={
              showSchema && primarySchema ? (
                <RosaHcpSchemaPanel
                  id={schemaPanelId}
                  onClose={closeSchemaPanel}
                  schema={primarySchema}
                />
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
                shortcutsPopoverButtonText={yamlStrings.shortcutsButtonText}
                shortcutsPopoverProps={shortcutsPopoverProps}
                options={{
                  ariaLabel: yamlStrings.editorAriaLabel,
                  // 'auto' never detects a screen reader in browsers.
                  accessibilitySupport: 'on',
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

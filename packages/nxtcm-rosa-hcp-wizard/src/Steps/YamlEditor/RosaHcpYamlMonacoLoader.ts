/* eslint-disable class-methods-use-this */
import { type MonacoEditor } from 'monaco-types';
import { configureMonacoYaml, type MonacoYamlOptions, type SchemasSettings } from 'monaco-yaml';

import type { ResourceSchema } from './types';

/** Matches the trailing "Source: [schema-name](uri)" line monaco-yaml always appends to hover content. */
const SOURCE_LINE_PATTERN = /\n*Source: \[[^\]]*\]\([^)]*\)\s*$/;
type RegisterHoverProvider = MonacoEditor['languages']['registerHoverProvider'];

/**
 * monaco-yaml has no option to omit the "Source: <schema>" line it appends to hover content, so
 * this temporarily wraps `registerHoverProvider` while `configureMonacoYaml` registers its own
 * hover provider, stripping that line from the returned markdown.
 */
function withoutHoverSourceLine(monaco: MonacoEditor, configure: () => void): void {
  const originalRegisterHoverProvider: RegisterHoverProvider =
    monaco.languages.registerHoverProvider;

  monaco.languages.registerHoverProvider = ((languageSelector, provider) =>
    originalRegisterHoverProvider(languageSelector, {
      ...provider,
      provideHover: async (model, position, token, context) => {
        const hover = await provider.provideHover(model, position, token, context);
        if (!hover) {
          return hover;
        }
        return {
          ...hover,
          contents: hover.contents.map((content) => ({
            ...content,
            value: content.value.replace(SOURCE_LINE_PATTERN, ''),
          })),
        };
      },
    })) as RegisterHoverProvider;

  try {
    configure();
  } finally {
    monaco.languages.registerHoverProvider = originalRegisterHoverProvider;
  }
}

export class RosaHcpYamlMonacoLoader {
  configure(
    monaco: MonacoEditor,
    resourceSchemas?: ResourceSchema[],
    options?: MonacoYamlOptions,
    /** Restrict schema completion/hover to this specific model path. */
    fileMatch = ['rosa-hcp-control-plane.yaml']
  ): () => void {
    const schemas: SchemasSettings[] = (resourceSchemas ?? []).map(({ kind, schema }) => ({
      uri: `inmemory://${kind}-schema.json`,
      fileMatch,
      schema,
    }));

    let monacoYaml: ReturnType<typeof configureMonacoYaml> | undefined;
    withoutHoverSourceLine(monaco, () => {
      monacoYaml = configureMonacoYaml(monaco, {
        validate: false,
        hover: true,
        completion: true,
        isKubernetes: false,
        enableSchemaRequest: false,
        schemas,
        ...options,
      });
    });

    return () => {
      monacoYaml?.dispose();
    };
  }
}

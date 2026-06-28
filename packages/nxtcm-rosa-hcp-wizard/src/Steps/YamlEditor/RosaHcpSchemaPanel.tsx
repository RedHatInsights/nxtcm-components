import { useState, useMemo } from 'react';
import {
  Button,
  Content,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Label,
  SearchInput,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ChevronRightIcon from '@patternfly/react-icons/dist/esm/icons/chevron-right-icon';
import ChevronDownIcon from '@patternfly/react-icons/dist/esm/icons/chevron-down-icon';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';

type SchemaProperty = {
  type?: string | string[];
  description?: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  enum?: string[];
};

type SchemaProps = Record<string, SchemaProperty>;

const TYPE_VARIANT: Record<string, 'blue' | 'green' | 'orange' | 'purple' | 'teal'> = {
  string: 'blue',
  integer: 'orange',
  number: 'orange',
  boolean: 'purple',
  object: 'teal',
  array: 'green',
};

function getTypeLabel(prop: SchemaProperty): string {
  if (prop.type) {
    return Array.isArray(prop.type) ? prop.type.join(' | ') : prop.type;
  }
  if (prop.enum) return 'enum';
  return '';
}

type SchemaFieldProps = {
  name: string;
  prop: SchemaProperty;
  depth?: number;
};

const SchemaField = ({ name, prop, depth = 0 }: SchemaFieldProps) => {
  const [expanded, setExpanded] = useState(false);
  const typeLabel = getTypeLabel(prop);
  const typeVariant = TYPE_VARIANT[typeLabel] ?? 'blue';
  const hasChildren =
    prop.type === 'object' && prop.properties && Object.keys(prop.properties).length > 0;

  return (
    <StackItem style={depth > 0 ? { paddingLeft: `${depth * 16}px` } : undefined}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        }}
      >
        {hasChildren ? (
          <Button
            variant="plain"
            size="sm"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((v) => !v)}
            style={{ padding: 0, minWidth: 'auto', marginTop: '2px' }}
          >
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Button>
        ) : (
          <span style={{ width: '16px', display: 'inline-block', flexShrink: 0 }} />
        )}

        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <code style={{ fontSize: '13px', fontWeight: 600, wordBreak: 'break-all' }}>
              {name}
            </code>
            {typeLabel && (
              <Label isCompact color={typeVariant}>
                {typeLabel}
              </Label>
            )}
          </div>
          {prop.description && (
            <Content
              component="small"
              style={{
                color: 'var(--pf-t--global--text--color--subtle)',
                marginTop: '2px',
                display: 'block',
              }}
            >
              {prop.description}
            </Content>
          )}
          {prop.enum && (
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {prop.enum.map((v) => (
                <Label key={v} isCompact variant="outline">
                  {v}
                </Label>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasChildren && expanded && prop.properties && (
        <Stack hasGutter>
          {Object.entries(prop.properties).map(([childName, childProp]) => (
            <SchemaField key={childName} name={childName} prop={childProp} depth={depth + 1} />
          ))}
        </Stack>
      )}
    </StackItem>
  );
};

export type RosaHcpSchemaPanelProps = {
  onClose: () => void;
  schema: object;
};

export const RosaHcpSchemaPanel = ({ onClose, schema }: RosaHcpSchemaPanelProps) => {
  const { yamlEditor } = useRosaHcpWizardStrings();
  const [searchText, setSearchText] = useState('');

  const specProperties = useMemo(
    () =>
      (schema as { properties?: { spec?: { properties?: SchemaProps } } }).properties?.spec
        ?.properties ?? {},
    [schema]
  );

  const filteredProperties = useMemo(() => {
    const lower = searchText.trim().toLowerCase();
    if (!lower) return specProperties;
    return Object.fromEntries(
      Object.entries(specProperties).filter(
        ([key, val]) =>
          key.toLowerCase().includes(lower) || (val.description ?? '').toLowerCase().includes(lower)
      )
    );
  }, [specProperties, searchText]);

  return (
    <DrawerPanelContent isResizable defaultSize="33%">
      <DrawerHead>
        <Title headingLevel="h3" size="md">
          {yamlEditor.schemaTitle}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} aria-label={yamlEditor.schemaToggleAriaLabel} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Stack hasGutter>
          <StackItem>
            <SearchInput
              placeholder={yamlEditor.schemaSearchPlaceholder}
              value={searchText}
              onChange={(_e, val) => setSearchText(val)}
              onClear={() => setSearchText('')}
            />
          </StackItem>
          <StackItem>
            <Stack>
              {Object.entries(filteredProperties).map(([fieldName, fieldProp]) => (
                <SchemaField key={fieldName} name={fieldName} prop={fieldProp} /> // eslint-disable-line prettier/prettier
              ))}
            </Stack>
          </StackItem>
        </Stack>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

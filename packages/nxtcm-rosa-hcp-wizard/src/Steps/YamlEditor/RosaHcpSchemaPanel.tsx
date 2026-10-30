import { useMemo, useState } from 'react';

import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core/dist/dynamic/components/Drawer';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { SearchInput } from '@patternfly/react-core/dist/dynamic/components/SearchInput';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import type { TreeViewDataItem } from '@patternfly/react-core/dist/dynamic/components/TreeView';
import { TreeView } from '@patternfly/react-core/dist/dynamic/components/TreeView';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import type { JSONSchema } from 'monaco-yaml';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';

type SchemaProperty = {
  type?: string | string[];
  description?: string;
  properties?: Record<string, SchemaProperty>;
  enum?: unknown[];
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

const hasChildProperties = (
  prop: SchemaProperty
): prop is SchemaProperty & { properties: SchemaProps } =>
  prop.type === 'object' && !!prop.properties && Object.keys(prop.properties).length > 0;

const buildTreeItems = (properties: SchemaProps, parentPath = ''): TreeViewDataItem[] =>
  Object.entries(properties).map(([name, prop]) => {
    const id = parentPath ? `${parentPath}.${name}` : name;
    const typeLabel = getTypeLabel(prop);

    return {
      id,
      title: (
        <Flex
          component="span"
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
          flexWrap={{ default: 'wrap' }}
        >
          <code>{name}</code>
          {typeLabel && (
            <Label isCompact color={TYPE_VARIANT[typeLabel] ?? 'blue'}>
              {typeLabel}
            </Label>
          )}
        </Flex>
      ),
      name: (
        <Flex component="span" direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
          {prop.description && <Content component="small">{prop.description}</Content>}
          {prop.enum && (
            <Flex component="span" gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
              {prop.enum.map((v, i) => (
                <Label key={i} isCompact variant="outline">
                  {String(v)}
                </Label>
              ))}
            </Flex>
          )}
        </Flex>
      ),
      children: hasChildProperties(prop) ? buildTreeItems(prop.properties, id) : undefined,
    };
  });

export type RosaHcpSchemaPanelProps = {
  onClose: () => void;
  schema: JSONSchema;
};

export const RosaHcpSchemaPanel = ({ onClose, schema }: RosaHcpSchemaPanelProps) => {
  const { yamlEditor } = useRosaHcpWizardStrings();
  const [searchText, setSearchText] = useState('');

  const specProperties = useMemo(() => {
    const spec = schema.properties?.spec;
    if (!spec || typeof spec === 'boolean') return {};
    const specProps = spec.properties;
    if (!specProps) return {};
    return Object.fromEntries(
      Object.entries(specProps).filter(([, v]) => typeof v !== 'boolean')
    ) as SchemaProps;
  }, [schema]);

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

  const treeItems = useMemo(() => buildTreeItems(filteredProperties), [filteredProperties]);

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
          {treeItems.length > 0 && (
            <StackItem>
              <TreeView
                variant="compact"
                hasGuides
                data={treeItems}
                aria-label={yamlEditor.schemaTreeAriaLabel}
              />
            </StackItem>
          )}
        </Stack>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

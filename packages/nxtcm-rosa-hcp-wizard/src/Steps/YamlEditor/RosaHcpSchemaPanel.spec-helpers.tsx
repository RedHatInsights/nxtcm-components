import React from 'react';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import { RosaHcpSchemaPanel } from './RosaHcpSchemaPanel';
import rosaControlPlaneSchema from '../../test/acmGeneratorFixtures/schemas/rosaControlPlaneSchema.json';

const defaultSchema = rosaControlPlaneSchema as object;

export type SchemaPanelMountProps = {
  onClose?: () => void;
  schema?: object;
};

export function SchemaPanelMount({
  onClose = () => {},
  schema = defaultSchema,
}: SchemaPanelMountProps = {}) {
  return withRosaCt(
    <Drawer isExpanded position="right">
      <DrawerContent panelContent={<RosaHcpSchemaPanel onClose={onClose} schema={schema} />}>
        <DrawerContentBody>YAML editor content</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
}

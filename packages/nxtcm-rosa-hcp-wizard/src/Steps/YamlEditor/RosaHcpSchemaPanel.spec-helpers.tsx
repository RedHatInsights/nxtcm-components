import React from 'react';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import { RosaHcpSchemaPanel } from './RosaHcpSchemaPanel';

export type SchemaPanelMountProps = {
  onClose?: () => void;
};

export function SchemaPanelMount({ onClose = () => {} }: SchemaPanelMountProps = {}) {
  return withRosaCt(
    <Drawer isExpanded position="right">
      <DrawerContent panelContent={<RosaHcpSchemaPanel onClose={onClose} />}>
        <DrawerContentBody>YAML editor content</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
}

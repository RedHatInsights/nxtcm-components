// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import React from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core/dist/dynamic/components/Drawer';

import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import rosaControlPlaneSchema from '../../test/acmGeneratorFixtures/schemas/rosaControlPlaneSchema.json';
import { RosaHcpSchemaPanel } from './RosaHcpSchemaPanel';

const defaultSchema = rosaControlPlaneSchema as object;

export type SchemaPanelMountProps = {
  onClose?: () => void;
  schema?: object;
};

function SchemaPanelMountComponent({
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

type BrowserProps = NonNullable<React.ComponentProps<typeof SchemaPanelMountComponent>>;

export type SchemaPanelMountGalleryProps = Omit<BrowserProps, 'onClose'> & {
  onClose?: boolean;
};

export function SchemaPanelMount(props: SchemaPanelMountGalleryProps): React.ReactElement {
  const [onCloseCalls, setOnCloseCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onClose']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onClose: props.onClose
        ? () => {
            setOnCloseCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <SchemaPanelMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="onClose-calls" readOnly value={JSON.stringify(onCloseCalls)} />
        <input data-testid="onClose-count" readOnly value={String(onCloseCalls.length)} />
      </div>
    </>
  );
}

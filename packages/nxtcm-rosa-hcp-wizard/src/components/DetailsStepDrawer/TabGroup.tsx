import { ReactElement, useState } from 'react';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core/dist/dynamic/components/ToggleGroup';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';

type ToggleGroupTabsProps = {
  tabs: { title: string; body: ReactElement; 'data-testid'?: string; id: string }[];
};

export const TabGroup: React.FunctionComponent<ToggleGroupTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isSelected, setIsSelected] = useState<string>(tabs[0].id);

  return (
    <Stack hasGutter className="pf-v6-u-mt-md">
      <StackItem>
        <ToggleGroup>
          {tabs.map((tab) => (
            <ToggleGroupItem
              key={tab.id}
              text={tab.title}
              buttonId={tab.id}
              isSelected={isSelected === tab.id}
              onChange={() => {
                setIsSelected(tab.id);
                setActiveTab(tab);
              }}
              data-testid={tab['data-testid']}
            />
          ))}
        </ToggleGroup>
      </StackItem>
      <StackItem className="ocm-instruction-block">{activeTab.body}</StackItem>
    </Stack>
  );
};

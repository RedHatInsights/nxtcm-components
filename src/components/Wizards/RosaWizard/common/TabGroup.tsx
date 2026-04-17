import {
  ToggleGroupItemProps,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { ReactElement, useState } from 'react';

/** Describes one tab: stable id, label, optional test id, and the panel body rendered when that tab is selected. */
type ToggleGroupTabsProps = {
  tabs: { title: string; body: ReactElement; 'data-testid'?: string; id: string }[];
};

/**
 * Renders a PatternFly toggle group to pick among tabs and shows the selected tab’s body content below.
 */
export const TabGroup: React.FunctionComponent<ToggleGroupTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isSelected, setIsSelected] = useState<string>(tabs[0].id);

  /** Selects the tab whose button id matches the toggle event and updates the visible panel body. */
  const handleToggleChange: ToggleGroupItemProps['onChange'] = (event) => {
    const { id } = event.currentTarget;
    const tab = tabs.find((element) => element.id === id);

    setIsSelected(id);
    if (tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <ToggleGroup>
          {tabs.map((tab) => (
            <ToggleGroupItem
              key={tab.id}
              text={tab.title}
              buttonId={tab.id}
              isSelected={isSelected === tab.id}
              onChange={handleToggleChange}
              data-testid={tab['data-testid']}
            />
          ))}
        </ToggleGroup>
      </StackItem>
      <StackItem className="ocm-instruction-block">{activeTab.body}</StackItem>
    </Stack>
  );
};

import {
  ToggleGroupItemProps,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { ReactElement, useState } from 'react';

type ToggleGroupTabsProps = {
  tabs: { title: string; body: ReactElement; 'data-testid'?: string; id: string }[];
};

export const TabGroup: React.FunctionComponent<ToggleGroupTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isSelected, setIsSelected] = useState<string>(tabs[0].id);

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

import { type MouseEvent, type ReactNode, useState } from 'react';

import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import { Stack } from '@patternfly/react-core/dist/dynamic/layouts/Stack';

export const ReviewExpandSection = (props: {
  label: string;
  children: ReactNode;
  initialExpanded: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(props.initialExpanded);
  const onToggle = (_event: MouseEvent<Element>, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      isWidthLimited
      onToggle={onToggle}
      toggleText={props.label}
    >
      <Stack hasGutter>{props.children}</Stack>
    </ExpandableSection>
  );
};

import { ExpandableSection, Title } from '@patternfly/react-core';
import React from 'react';

type AssociateAWSAccountInfoProps = {
  title: string;
  initiallyExpanded?: boolean;
  children: React.ReactNode;
};

export const AssociateAWSAccountInfo = (props: AssociateAWSAccountInfoProps) => {
  const { title } = props;
  const [isExpanded, setIsExpanded] = React.useState(props.initiallyExpanded);
  const onToggle = (_: React.MouseEvent<Element, MouseEvent>, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  return (
    <>
      <ExpandableSection
        onToggle={(event: React.MouseEvent<Element, MouseEvent>, isExpanded: boolean) =>
          onToggle(event, isExpanded)
        }
        isExpanded={isExpanded}
        toggleContent={
          <Title headingLevel="h3" size="md">
            {title}
          </Title>
        }
      >
        {props.children}
      </ExpandableSection>
    </>
  );
};

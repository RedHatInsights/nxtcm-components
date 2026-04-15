import { ExpandableSection, Title } from '@patternfly/react-core';
import React from 'react';

/** Props for a titled expandable section that wraps AWS account association help content. */
type AssociateAWSAccountInfoProps = {
  title: string;
  initiallyExpanded?: boolean;
  children: React.ReactNode;
};

/**
 * Renders an expandable section with a title so users can show or hide AWS account setup instructions.
 */
export const AssociateAWSAccountInfo = (props: AssociateAWSAccountInfoProps) => {
  const { title } = props;
  const [isExpanded, setIsExpanded] = React.useState(props.initiallyExpanded);
  /** Updates local state when the PatternFly expandable section is toggled open or closed. */
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

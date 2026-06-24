import { ExpandableSection } from '@patternfly/react-core';
import React from 'react';

import './AssociateAWSAccountInfo.css';

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
    <ExpandableSection
      className="associate-aws-account-info"
      toggleWrapper="h3"
      toggleText={title}
      onToggle={(event: React.MouseEvent<Element, MouseEvent>, isExpanded: boolean) =>
        onToggle(event, isExpanded)
      }
      isExpanded={isExpanded}
    >
      {props.children}
    </ExpandableSection>
  );
};

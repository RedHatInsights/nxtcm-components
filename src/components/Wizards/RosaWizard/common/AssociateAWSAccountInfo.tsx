import { ExpandableSection, Title } from "@patternfly/react-core"
import React from "react";


export const AssociateAWSAccountInfo = (props: any) => {
    const {title} = props
    const [isExpanded, setIsExpanded] = React.useState(props.initiallyExpanded);
    const onToggle = (_: React.MouseEvent<Element, MouseEvent>, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
    return(
        <>
            <ExpandableSection
                onToggle={(event: any, isExpanded: boolean) => onToggle(event, isExpanded)}
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
    )
}
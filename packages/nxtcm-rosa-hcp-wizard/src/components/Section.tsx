import React, { ReactNode } from 'react';

import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import { Split, SplitItem } from '@patternfly/react-core/dist/dynamic/layouts/Split';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';

import './Section.css';

type SectionProps = {
  label?: string | ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Optional actions rendered beside the section title (e.g. Review "Edit in YAML"). */
  labelActions?: ReactNode;
  /** When false, step body is not wrapped in PatternFly Form (e.g. Review). Defaults to true. */
  isForm?: boolean;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const { isForm = true, children, description, label, labelActions } = props;
  const sectionHeader = label ? (
    <Content>
      <Split hasGutter>
        <SplitItem isFilled>
          <Title headingLevel="h3" size="md">
            {label}
          </Title>
        </SplitItem>
        {labelActions ? <SplitItem>{labelActions}</SplitItem> : null}
      </Split>
      {description ? <Content component="small">{description}</Content> : null}
    </Content>
  ) : null;

  return (
    <Stack hasGutter>
      {sectionHeader ? <StackItem>{sectionHeader}</StackItem> : null}
      <StackItem>
        {isForm ? <Form onSubmit={(event) => event.preventDefault()}>{children}</Form> : children}
      </StackItem>
    </Stack>
  );
};

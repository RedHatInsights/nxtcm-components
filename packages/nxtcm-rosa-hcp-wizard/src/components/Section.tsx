import React, { ReactNode } from 'react';

import { Content, Form, Split, SplitItem, Stack, StackItem, Title } from '@patternfly/react-core';

import { LabelHelp } from './Fields/LabelHelp';

import './Section.css';

type SectionProps = {
  id?: string;
  label?: string | ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  labelHelpTitle?: string;
  labelHelp?: string;
  /** Optional actions rendered beside the section title (e.g. Review "Edit in YAML"). */
  labelActions?: ReactNode;
  /** When false, step body is not wrapped in PatternFly Form (e.g. Review). Defaults to true. */
  isForm?: boolean;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const {
    isForm = true,
    children,
    description,
    id: idProp,
    label,
    labelHelp,
    labelHelpTitle,
    labelActions,
  } = props;
  const id =
    idProp ?? (typeof label === 'string' ? label.toLowerCase().split(' ').join('-') : undefined);
  const sectionHeader = label ? (
    <Content>
      <Split hasGutter>
        <SplitItem isFilled>
          <Title headingLevel="h3" size="md">
            {label}
          </Title>
          {idProp && (
            <LabelHelp id={idProp} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />
          )}
        </SplitItem>
        {labelActions ? <SplitItem>{labelActions}</SplitItem> : null}
      </Split>
      {description ? <Content component="small">{description}</Content> : null}
    </Content>
  ) : null;

  return (
    <div id={id}>
      <Stack hasGutter>
        {sectionHeader ? <StackItem>{sectionHeader}</StackItem> : null}
        <StackItem>
          {isForm ? <Form onSubmit={(event) => event.preventDefault()}>{children}</Form> : children}
        </StackItem>
      </Stack>
    </div>
  );
};

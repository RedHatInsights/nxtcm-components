import { Content, Form, FormSection, Split, SplitItem, Stack, Title } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import React, { ReactNode } from 'react';
import './Section.css';

type SectionProps = {
  id?: string;
  label: string | ReactNode;
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
  const id = idProp ?? (typeof label === 'string' ? label.toLowerCase().split(' ').join('-') : '');

  const titleContent = isForm ? (
    <div className="pf-v6-u-w-100">
      {label}
      {idProp && <LabelHelp id={idProp} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    </div>
  ) : (
    <Title headingLevel="h2" size="md" className="pf-v6-u-w-100">
      {label}
      {idProp && <LabelHelp id={idProp} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />}
    </Title>
  );

  const sectionHeader = (
    <Split hasGutter>
      <SplitItem isFilled>{titleContent}</SplitItem>
      {labelActions ? <SplitItem>{labelActions}</SplitItem> : null}
    </Split>
  );

  const sectionDescription = description ? (
    <Content component="small" className="pf-v6-u-pt-sm">
      {description}
    </Content>
  ) : null;

  const formSectionTitle = (
    <Split hasGutter>
      <SplitItem isFilled>
        <Stack>
          {sectionHeader}
          {sectionDescription}
        </Stack>
      </SplitItem>
    </Split>
  );

  if (isForm) {
    return (
      <Form onSubmit={(e) => e.preventDefault()}>
        <FormSection id={id} title={formSectionTitle}>
          {children}
        </FormSection>
      </Form>
    );
  }

  return (
    <div id={id}>
      <Stack hasGutter>
        {sectionHeader}
        {sectionDescription}
        {children}
      </Stack>
    </div>
  );
};

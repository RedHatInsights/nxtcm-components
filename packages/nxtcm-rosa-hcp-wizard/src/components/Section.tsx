import { Content, Form, Split, SplitItem, Stack } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import React, { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  label: string | ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  labelHelpTitle?: string;
  labelHelp?: string;
  /** When false, content is not wrapped in PatternFly Form (e.g. Review). Defaults to true. */
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
  } = props;
  const id = idProp ?? (typeof label === 'string' ? label.toLowerCase().split(' ').join('-') : '');

  const sectionContent = (
    <>
      <Split hasGutter>
        <SplitItem isFilled>
          <Stack>
            <Split hasGutter>
              <div className="pf-v6-c-form__section-title pf-v6-u-w-100">
                {label}
                {idProp && (
                  <LabelHelp id={idProp} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />
                )}
              </div>
            </Split>
            {description && (
              <Content component="small" className="pf-v6-u-pt-sm">
                {description}
              </Content>
            )}
          </Stack>
        </SplitItem>
      </Split>
      {children}
    </>
  );

  return (
    <section id={id} className="pf-v6-c-form__group" role="group">
      {isForm ? (
        <Form isWidthLimited onSubmit={(e) => e.preventDefault()}>
          {sectionContent}
        </Form>
      ) : (
        sectionContent
      )}
    </section>
  );
};
